#!/usr/bin/env python3
"""Run on the Loops VPS after shipping root HTML; preserve all asset URLs."""
from pathlib import Path
import hashlib, shutil, subprocess, datetime, sys
p = Path('/etc/nginx/sites-available/loops')
s = p.read_text()
marker = '# Loops root migration 2026-09-27'
if marker in s:
    print('Root redirects already installed'); sys.exit(0)
expected = 'b2160ec5a482402a837470ac89beae91ff2156a689103d146a8892fed3b46bbb'
if hashlib.sha256(s.encode()).hexdigest() != expected:
    raise SystemExit('Nginx config changed: inspect before applying migration')
needle = '    index index.html;'
assert s.count(needle) == 2
block = '''

    # Loops root migration 2026-09-27 — exact matches preserve /leadgeneration/assets/
    location = /leadgeneration { return 301 https://loops.uz/$is_args$args; }
    location = /leadgeneration/ { return 301 https://loops.uz/$is_args$args; }
    location = /leadgeneration/index.html { return 301 https://loops.uz/$is_args$args; }
'''
backup = p.with_name('loops.bak-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
shutil.copy2(p, backup)
p.write_text(s.replace(needle, needle + block))
try:
    subprocess.run(['nginx', '-t'], check=True)
    subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
except BaseException:
    shutil.copy2(backup, p)
    subprocess.run(['nginx', '-t'], check=True)
    subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
    raise
print('Installed root redirects; backup:', backup)
