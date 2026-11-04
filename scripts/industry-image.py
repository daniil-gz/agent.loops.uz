#!/usr/bin/python3
"""Card picture for an industry page (home section «Знаем контекст»).

  /usr/bin/python3 scripts/industry-image.py <slug> <source.png>

Writes images/industries/<slug>.jpg (1200x800), drawing centred on its own paper.
Slug = key in _handoff/leadgeneration-source/src/industries.json. Rules: ~/loops-seo/playbooks/covers.md.
"""
import sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
from illustrate import centre, fit

R = Path(__file__).resolve().parents[1]
slug, src = sys.argv[1:3]
out = R / 'images/industries'; out.mkdir(parents=True, exist_ok=True)
im = centre(Image.open(src).convert('RGB'))
fit(im, 1200, 800).save(out / f'{slug}.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
print(slug, (out / f'{slug}.jpg').stat().st_size // 1024, 'KB')
