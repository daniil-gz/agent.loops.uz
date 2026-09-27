#!/usr/bin/env python3
"""Publishable static output; /leadgeneration/assets remains the stable asset base."""
from pathlib import Path
import subprocess,re,shutil
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'_handoff/leadgeneration-source'
subprocess.run(['npm','run','build','--prefix',str(SOURCE)],check=True)
DIST=SOURCE/'dist/client'
for route in ['', 'target','ai-bot','consulting','analytics']:
 target=ROOT/route/'index.html';target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(DIST/route/'index.html',target)
html=(DIST/'index.html').read_text()
for file in re.findall(r'/leadgeneration/assets/(index-[^" ]+\.(?:js|css))',html):
 shutil.copyfile(DIST/'assets'/file,ROOT/'leadgeneration/assets'/file)
# Server has an exact 301; this portable fallback also preserves query and fragment.
(ROOT/'leadgeneration/index.html').write_text('''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="https://loops.uz/"><title>Loops — новая главная</title><script>location.replace('/'+location.search+location.hash)</script></head><body><p>Страница переехала. <a href="/">Перейти на главную Loops</a></p></body></html>''')
print('Updated /, 4 services, hashed assets and legacy redirect fallback.')
