#!/usr/bin/env python3
"""Release loops.uz: only files changed since the last release, never deletes on the server.

  python3 scripts/release.py --dry-run   show the plan, check the server, change nothing
  python3 scripts/release.py             release

Steps: checks (build-all --check) -> file list from git (tag `deployed`..HEAD, public files only)
-> server drift check (server files must equal the last release) -> backup on the server
-> upload assets, then HTML -> Cloudflare purge of changed URLs -> live readback
-> move tag `deployed`, push main and the tag -> IndexNow for changed pages.

Rules: run on branch main with everything committed. Files deleted in git stay on the server
(listed in the report; remove by hand if needed). scripts/deploy.sh is retired: it deletes
server-only folders (kp/, reports/, razbor/).
"""
from pathlib import Path
from fnmatch import fnmatch
from datetime import datetime
import hashlib, json, os, re, subprocess, sys, time, urllib.request

R = Path(__file__).resolve().parents[1]
SERVER, DEST = 'adstat-deploy', '/var/www/loops'
ZONE = 'f41fb8f4fbfda243650e27e0f7db5bc8'
BASE = 'https://loops.uz'
TAG = 'deployed'
INDEXNOW_KEY = 'ff380aef5dc203cccdc20aad36f963ab'
# Never shipped: sources, tools, docs, server-only or private folders.
EXCLUDE = ['.*', '*.md', 'README*', '*.resolved*', '*.metadata.json', '*.backup-*', 'index.old.html',
           'netlify.toml', 'vercel.json', '.htaccess', 'package.json', 'package-lock.json', 'wrangler.toml',
           'scripts/*', '_handoff/*', '_recovered/*', 'content/*', 'worker/*', 'api/*', 'evidence/*',
           'kp/*', 'reports/*', 'studio/*', 'razbor*', 'cases/_bodies/*', 'cases/_content/*', 'cases/cases.json',
           'cases/FORMAT.md', 'consulting/lab.html', 'consulting/iceberg-lab.html', 'consulting/annotate.js']
DRY = '--dry-run' in sys.argv


def sh(*cmd, check=True, input=None):
    r = subprocess.run(cmd, cwd=R, capture_output=True, text=True, input=input)
    if check and r.returncode:
        sys.exit(f'STOP: {" ".join(cmd)[:120]}\n{r.stderr.strip()[:800]}')
    return r.stdout.strip()


def ssh(cmd, input=None):
    return sh('ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=20', SERVER, cmd, input=input)


def public(f):
    return not any(fnmatch(f, p) for p in EXCLUDE)


def url_for(f):
    if f.endswith('index.html'):
        return BASE + '/' + f[:-len('index.html')]
    return BASE + '/' + f


def step(msg):
    print(f'\n== {msg}', flush=True)


# 1. State of the repository
step('Repository')
branch = sh('git', 'rev-parse', '--abbrev-ref', 'HEAD')
if branch != 'main' and not DRY: sys.exit(f'STOP: release only from main (now {branch})')
dirty = [l for l in sh('git', 'status', '--porcelain', '--untracked-files=no').splitlines()]
if dirty: sys.exit('STOP: commit first:\n' + '\n'.join(dirty[:20]))
head = sh('git', 'rev-parse', '--short', 'HEAD')
base = sh('git', 'rev-parse', '--short', TAG, check=False) or sys.exit(f'STOP: no tag {TAG}. Set it to the commit that is on the server: git tag {TAG} <commit>')
print(f'last release {base} -> now {head}')

# 2. Checks
step('Checks')
if subprocess.run(['python3', 'scripts/build-all.py', '--check'], cwd=R).returncode:
    sys.exit('STOP: checks failed')

# 3. File list
step('Files')
changes = [l.split('\t') for l in sh('git', 'diff', '--name-status', '--no-renames', f'{TAG}..HEAD').splitlines() if l]
files = [p for s, p in changes if s != 'D' and public(p)]
deleted = [p for s, p in changes if s == 'D' and public(p)]
if not files and not deleted:
    print('Nothing to release.'); sys.exit(0)
assets = [f for f in files if not f.endswith('.html')]
pages = [f for f in files if f.endswith('.html')]
print(f'{len(assets)} assets, {len(pages)} pages' + (f', {len(deleted)} deleted in git (stay on server)' if deleted else ''))
for f in files: print('  ', f)
for f in deleted: print('   (stays on server)', f)

# 4. Drift: the server must hold exactly the last release for every file we replace.
step('Server drift check')
existed = [f for f in files if subprocess.run(['git', 'cat-file', '-e', f'{TAG}:{f}'], cwd=R, capture_output=True).returncode == 0]
if existed:
    remote = ssh(f'cd {DEST} && md5sum -- ' + ' '.join(f"'{f}'" for f in existed) + ' 2>/dev/null; true')
    on_server = {line.split(None, 1)[1]: line.split()[0] for line in remote.splitlines() if line}
    drift = []
    for f in existed:
        expected = hashlib.md5(subprocess.run(['git', 'show', f'{TAG}:{f}'], cwd=R, capture_output=True).stdout).hexdigest()
        if on_server.get(f) != expected: drift.append(f)
    if drift:
        sys.exit('STOP: server differs from the last release (someone changed the server):\n  ' + '\n  '.join(drift))
print(f'OK: {len(existed)} files on the server match {base}')
if DRY:
    print('\nDry run: nothing changed.'); sys.exit(0)

# 5. Backup of every file we touch
step('Backup')
stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
backup = f'/root/backups/loops-release-{stamp}.tgz'
if existed:
    ssh(f'cd {DEST} && tar czf {backup} -- ' + ' '.join(f"'{f}'" for f in existed))
    print(backup)

# 6. Upload: assets first, so new pages never point to missing files
step('Upload')
for group in (assets, pages):
    if group:
        sh('rsync', '-rc', '--no-perms', '--no-owner', '--no-group', '--files-from=-', '-e', 'ssh -o BatchMode=yes',
           './', f'{SERVER}:{DEST}/', input='\n'.join(group) + '\n')
print(f'uploaded {len(files)} files')

# 7. Cloudflare purge of the changed URLs
step('Cloudflare purge')
env = dict(l.split('=', 1) for l in Path.home().joinpath('.cloudflare-loops.env').read_text().split('\n') if '=' in l)
token = env['CF_LOOPS_TOKEN'].strip().strip('"\'')
urls = sorted({url_for(f) for f in files})


def cf(body):
    req = urllib.request.Request(f'https://api.cloudflare.com/client/v4/zones/{ZONE}/purge_cache', data=json.dumps(body).encode(),
                                 headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'})
    try:
        return json.load(urllib.request.urlopen(req, timeout=30)).get('success')
    except Exception as e:
        print('  purge error:', getattr(e, 'read', lambda: str(e).encode())()[:300]); return False


ok = cf({'purge_everything': True}) if len(urls) > 300 else all(cf({'files': urls[i:i + 30]}) for i in range(0, len(urls), 30))
print('purged' if ok else 'PURGE FAILED: purge in the dashboard (Caching -> Configuration -> Purge Everything)')

# 8. Live readback
step('Live check')
time.sleep(3)
bad = []
for f in files:
    u = url_for(f)
    try:
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'LoopsRelease/1.0'}), timeout=30)
        except Exception:  # first uncached hit of a new file can be slow at the origin: retry once
            time.sleep(5)
            r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'LoopsRelease/1.0'}), timeout=60)
        body = r.read()
        if f.endswith('.html'):
            want = re.search(rb'<title>(.*?)</title>', (R / f).read_bytes(), re.S)
            if want and want.group(1) not in body: bad.append((u, 'old title'))
        elif hashlib.md5(body).hexdigest() != hashlib.md5((R / f).read_bytes()).hexdigest():
            bad.append((u, 'old content'))
    except Exception as e:
        bad.append((u, str(e)[:60]))
for u, why in bad: print('  FAIL', u, why)
print(f'{len(files) - len(bad)}/{len(files)} live and current')

# 9. Mark the release, push
step('Git')
sh('git', 'tag', '-f', TAG, 'HEAD')
sh('git', 'push', 'origin', 'main')
sh('git', 'push', '-f', 'origin', TAG)
print(f'tag {TAG} -> {head}, pushed')

# 10. IndexNow for changed sitemap pages
sitemap_urls = set(re.findall(r'<loc>(.*?)</loc>', (R / 'sitemap.xml').read_text()))
changed = sorted(u for u in {url_for(f) for f in pages} if u in sitemap_urls)
if changed:
    step('IndexNow')
    body = json.dumps({'host': 'loops.uz', 'key': INDEXNOW_KEY, 'keyLocation': f'{BASE}/{INDEXNOW_KEY}.txt', 'urlList': changed}).encode()
    for api in ('https://api.indexnow.org/indexnow', 'https://yandex.com/indexnow'):
        try:
            code = urllib.request.urlopen(urllib.request.Request(api, data=body, headers={'Content-Type': 'application/json; charset=utf-8'}), timeout=30).status
        except Exception as e:
            code = getattr(e, 'code', str(e)[:40])
        print(f'{api.split("/")[2]}: {code} ({len(changed)} URLs)')
    print('Google: request indexing by hand for new pages (playbooks/indexing.md)')

step('Done' if not bad else 'Done with live-check failures — look above')
sys.exit(1 if bad else 0)
