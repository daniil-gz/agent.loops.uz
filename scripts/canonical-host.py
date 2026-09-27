from pathlib import Path
import shutil, subprocess, datetime
p=Path('/etc/nginx/sites-available/loops');s=p.read_text();marker='# Canonical Loops host and scheme 2026-09-27'
if marker in s:print('Already configured');raise SystemExit
needle='    server_name loops.uz www.loops.uz;'
assert s.count(needle)==2 and 'listen 443 ssl;' in s and 'listen 80;' in s
backup=p.with_name('loops.bak-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'-canonical');shutil.copy2(p,backup)
block='''
    # Canonical Loops host and scheme 2026-09-27
    if ($host = www.loops.uz) { return 308 https://loops.uz$request_uri; }
    # Cloudflare Full connects over TLS even for a visitor's HTTP request.
    if ($http_x_forwarded_proto = http) { return 308 https://loops.uz$request_uri; }
    # Only external /index.html requests, never nginx internal index resolution.
    if ($request_uri ~ "^/index[.]html(?:[?]|$)") { return 308 https://loops.uz/$is_args$args; }
'''
s=s.replace(needle,needle+block,1)
start=s.index('# Cloudflare Flexible SSL support')
s=s[:start]+'''# Plain HTTP redirects directly to the canonical host; Cloudflare SSL must stay Full/Strict.
server {
    listen 80;
    server_name loops.uz www.loops.uz;
    return 308 https://loops.uz$request_uri;
}
'''
p.write_text(s)
try:
 subprocess.run(['nginx','-t'],check=True);subprocess.run(['systemctl','reload','nginx'],check=True)
except BaseException:
 shutil.copy2(backup,p);subprocess.run(['nginx','-t']);subprocess.run(['systemctl','reload','nginx']);raise
print('Applied canonical redirects; backup:',backup)
