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


def centre(img, margin=0.10):
    """Find the drawing on the flat paper background and put it in the middle of a 3:2 canvas."""
    from PIL import ImageChops
    bg = img.getpixel((4, 4))
    diff = ImageChops.difference(img, Image.new('RGB', img.size, bg)).convert('L').point(lambda v: 255 if v > 28 else 0)
    box = diff.getbbox()
    if not box:
        return img
    pad = 30
    box = (max(0, box[0] - pad), max(0, box[1] - pad), min(img.width, box[2] + pad), min(img.height, box[3] + pad))
    art = img.crop(box)
    W = max(art.width / (1 - 2 * margin), art.height * 1.5 / (1 - 2 * margin))
    H = W / 1.5
    # Base = an empty strip of the same paper (keeps the grain), art pasted with soft edges.
    from PIL import ImageFilter
    blank = [x for x in range(0, img.width - 40, 20) if not diff.crop((x, 0, x + 40, img.height)).getbbox()]
    strip = img.crop((blank[0], 0, blank[0] + 40, img.height)) if blank else Image.new('RGB', (40, img.height), bg)
    canvas = Image.new('RGB', (round(W), round(H)), bg)
    for x in range(0, canvas.width, 40):
        for y in range(0, canvas.height, img.height):
            canvas.paste(strip, (x, y))
    feather = max(8, round(min(art.size) * 0.04))
    mask = Image.new('L', art.size, 0)
    mask.paste(255, (feather, feather, art.width - feather, art.height - feather))
    mask = mask.filter(ImageFilter.GaussianBlur(feather / 2))
    canvas.paste(art, ((canvas.width - art.width) // 2, (canvas.height - art.height) // 2), mask)
    return canvas


im = centre(im)


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
