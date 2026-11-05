#!/usr/bin/env python3
"""Publishable static output; /leadgeneration/assets remains the stable asset base."""
from pathlib import Path
import subprocess,re,shutil,json
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'_handoff/leadgeneration-source'
# Homepage "По делу." rail: newest articles from content/articles.json, so every new article appears there.
HOME_ARTICLES=6
_arts=[a for a in json.loads((ROOT/'content/articles.json').read_text()) if a.get('cover')]
_arts.sort(key=lambda a:(a.get('published',''),a.get('updated','')),reverse=True)
(SOURCE/'src/home-articles.json').write_text(json.dumps([{k:a[k] for k in ('slug','category','title','summary','cover')} for a in _arts[:HOME_ARTICLES]],ensure_ascii=False,indent=1)+'\n')
subprocess.run(['npm','run','build','--prefix',str(SOURCE)],check=True)
DIST=SOURCE/'dist/client'
import json
routes=['', 'target','ai-bot','consulting','analytics',*json.loads((SOURCE/'src/industries.json').read_text())]
for route in routes:
 target=ROOT/route/'index.html';target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(DIST/route/'index.html',target)
for file in (DIST/'assets').iterdir():
 if file.suffix in ('.js','.css'):
  shutil.copyfile(file,ROOT/'leadgeneration/assets'/file.name)
# Server has an exact 301; this portable fallback also preserves query and fragment.
(ROOT/'leadgeneration/index.html').write_text('''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="https://loops.uz/"><title>Loops — новая главная</title><script>location.replace('/'+location.search+location.hash)</script></head><body><p>Страница переехала. <a href="/">Перейти на главную Loops</a></p></body></html>''')
print(f'Updated root, {len(routes)-1} service/industry pages, hashed assets and legacy redirect fallback.')
