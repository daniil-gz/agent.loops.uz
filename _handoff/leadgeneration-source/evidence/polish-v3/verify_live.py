from pathlib import Path
import concurrent.futures, hashlib, json, subprocess, tempfile
root=Path('/Users/daniilgazizov/loops.uz/leadgeneration')
evidence=Path(__file__).parent

def check(p):
    rel=p.relative_to(root).as_posix()
    url='https://loops.uz/leadgeneration/'+('' if rel=='index.html' else rel)
    with tempfile.NamedTemporaryFile() as f:
        r=subprocess.run(['curl','--http1.1','--retry','1','--retry-delay','1','--connect-timeout','10','--max-time','35','-sS','-L','-o',f.name,'-w','%{http_code}',url],capture_output=True,text=True)
        actual=Path(f.name).read_bytes()
    expected=p.read_bytes()
    return dict(file=rel,url=url,status=r.stdout,match=actual==expected,local_sha256=hashlib.sha256(expected).hexdigest(),live_sha256=hashlib.sha256(actual).hexdigest(),error=r.stderr[:250])

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    rows=list(pool.map(check,[root/'index.html',*root.glob('assets/index-*.js'),*root.glob('assets/index-*.css'),root/'assets/krabs-original.png',root/'assets/marker-hero-loop.webp']))
(evidence/'live-assets-v3.json').write_text(json.dumps(rows,indent=2))
print(json.dumps(dict(files=len(rows),matched=sum(r['match'] and r['status']=='200' for r in rows),failures=[r for r in rows if not r['match'] or r['status']!='200']),indent=2))
