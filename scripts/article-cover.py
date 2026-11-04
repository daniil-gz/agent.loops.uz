#!/usr/bin/python3
"""Attach a cover image to an article.

  /usr/bin/python3 scripts/article-cover.py <slug> <source.png> "<alt text>"

Writes images/articles/<slug>.jpg (1200x800, page cover) and images/articles/<slug>-og.jpg
(1200x630, link preview), sets cover, coverOg, coverAlt in content/articles.json.
New picture for the same article = new file name (images are cached for 30 days): pass --v2.
Rules for the picture: playbooks/covers.md in ~/loops-seo.
"""
import json, sys
from pathlib import Path
from PIL import Image

R = Path(__file__).resolve().parents[1]
args = [a for a in sys.argv[1:] if not a.startswith('--')]
slug, src, alt = args
suffix = '-v2' if '--v2' in sys.argv else ''
articles = json.loads((R / 'content/articles.json').read_text())
art = next((a for a in articles if a['slug'] == slug), None)
if not art:
    sys.exit(f'no article {slug}')
out = R / 'images/articles'; out.mkdir(parents=True, exist_ok=True)
im = Image.open(src).convert('RGB')


def fit(w, h):
    r = max(w / im.width, h / im.height)
    x = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    left, top = (x.width - w) // 2, (x.height - h) // 2
    return x.crop((left, top, left + w, top + h))


def contain(w, h):
    # Whole picture, edges filled with its own paper colour (covers have a flat background).
    r = min(w / im.width, h / im.height)
    x = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    canvas = Image.new('RGB', (w, h), im.getpixel((4, 4)))
    canvas.paste(x, ((w - x.width) // 2, (h - x.height) // 2))
    return canvas


fit(1200, 800).save(out / f'{slug}{suffix}.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
contain(1200, 630).save(out / f'{slug}{suffix}-og.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
art.update(cover=f'/images/articles/{slug}{suffix}.jpg', coverOg=f'/images/articles/{slug}{suffix}-og.jpg', coverAlt=alt)
(R / 'content/articles.json').write_text(json.dumps(articles, ensure_ascii=False, indent=2) + '\n')
print('cover:', art['cover'], (out / f'{slug}{suffix}.jpg').stat().st_size // 1024, 'KB')
