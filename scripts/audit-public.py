#!/usr/bin/env python3
"""Pre-release QA of the public site files. Errors block release; warnings do not.

Errors:
- sitemap page: missing file, not exactly one h1, no title/description, canonical != URL,
  no or invalid JSON-LD, noindex
- broken local link/asset, <img> without alt, missing #anchor
- indexable public page that is not in sitemap.xml (or sitemap page that is not indexable)
- duplicate title or description across sitemap pages
- empty list section (a grid with no items)
- case count in text != published cases; price in offer_block.py not found in services.js
Warnings: title > 70 or description > 170 characters.

  python3 scripts/audit-public.py            full JSON
  python3 scripts/audit-public.py --summary  short report
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import defaultdict
import xml.etree.ElementTree as ET, json, re, sys

R = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(R / 'scripts'))
import offer_block  # noqa: E402

# Not shipped or not part of the indexable site (see scripts/release.py EXCLUDE).
NOT_PUBLIC = ('_handoff/', '_recovered/', 'scripts/', 'content/', 'node_modules/', 'evidence/', 'kp/',
              'razbor', 'clinic-ads/', 'api/', 'worker/', '.git/', '.claude/', 'cases/_bodies/',
              'cases/_content/', 'consulting/lab.html', 'consulting/iceberg-lab.html',
              'leadgeneration/assets/', 'reports/', 'studio/', 'css/', 'js/')


class Doc(HTMLParser):
    def __init__(self, s):
        super().__init__(); self.tags = []; self.ids = set(); self.h1 = 0; self.feed(s)

    def handle_starttag(self, t, a):
        a = dict(a); self.tags.append((t, a)); self.h1 += t == 'h1'
        if 'id' in a: self.ids.add(a['id'])


def path_file(path):
    p = R / unquote(path).lstrip('/')
    return p / 'index.html' if p.is_dir() or not p.suffix else p


def url_of(file):
    rel = str(file.relative_to(R))
    return 'https://loops.uz/' + (rel[:-len('index.html')] if rel.endswith('index.html') else rel)


def indexable(s):
    return not re.search(r'<meta[^>]+(noindex|http-equiv="refresh")', s)


urls = [x.text for x in ET.parse(R / 'sitemap.xml').getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
errors, warnings, docs, rows = [], [], {}, []
seen = defaultdict(lambda: defaultdict(list))
for url in urls:
    p = path_file(urlsplit(url).path)
    if not p.exists(): errors.append([url, 'missing file']); continue
    s = p.read_text(); d = Doc(s); docs[url] = (p, s, d)
    title = re.search(r'<title>(.*?)</title>', s, re.S)
    canon = [a.get('href') for t, a in d.tags if t == 'link' and a.get('rel') == 'canonical']
    desc = [a.get('content') for t, a in d.tags if t == 'meta' and a.get('name') == 'description']
    schemas = re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
    if d.h1 != 1: errors.append([url, 'h1', d.h1])
    if not title or not desc or canon != [url]: errors.append([url, 'metadata', canon])
    if not schemas: errors.append([url, 'schema missing'])
    for x in schemas:
        try: json.loads(x)
        except Exception: errors.append([url, 'invalid schema'])
    if not indexable(s): errors.append([url, 'noindex in sitemap'])
    if title:
        t = re.sub(r'\s+', ' ', title.group(1)).strip(); seen['title'][t].append(url)
        if len(t) > 70: warnings.append([url, f'title {len(t)} chars'])
    if desc and desc[0]:
        seen['description'][desc[0]].append(url)
        if len(desc[0]) > 170: warnings.append([url, f'description {len(desc[0])} chars'])
    if re.search(r'class="[^"]*(grid|list)[^"]*"></(div|ul|ol)>', s): errors.append([url, 'empty list section'])
    rows.append(dict(url=url, bytes=p.stat().st_size, h1=d.h1, schemas=len(schemas)))

for kind, values in seen.items():
    for value, where in values.items():
        if len(where) > 1: errors.append([where, f'duplicate {kind}', value[:80]])

# Every indexable public HTML page must be in the sitemap.
for f in R.rglob('*.html'):
    rel = str(f.relative_to(R))
    if rel.startswith(NOT_PUBLIC) or '.backup' in rel or rel == '404.html' or rel.startswith('yandex_'): continue
    if url_of(f) not in docs and indexable(f.read_text(errors='ignore')):
        errors.append([url_of(f), 'indexable page not in sitemap'])

for url, (p, s, d) in docs.items():
    for tag, a in d.tags:
        href = a.get('href') if tag in ('a', 'link') else a.get('src') if tag in ('img', 'script') else None
        if not href: continue
        u = urlsplit(href)
        if u.scheme in ('mailto', 'tel', 'data', 'javascript') or (u.netloc and u.netloc != 'loops.uz'): continue
        targetpath = u.path or urlsplit(url).path
        if not targetpath.startswith('/'): targetpath = '/' + str((p.parent / targetpath).relative_to(R))
        target = path_file(targetpath)
        if not target.exists(): errors.append([url, 'broken local resource', href]); continue
        if tag == 'img' and 'alt' not in a: errors.append([url, 'missing alt', href])
        if u.fragment and target.suffix == '.html':
            if unquote(u.fragment) not in Doc(target.read_text()).ids: errors.append([url, 'missing anchor', href])

# Facts copied in several sources must agree.
n = offer_block.CASE_COUNT
for url, (p, s, d) in docs.items():
    for m in re.findall(r'(\d+) (?:публичн\w* кейс|ИСТОРИ\w* ИЗ ПРАКТИКИ|кейс\w* Loops:)', s):
        if int(m) != n: errors.append([url, f'case count {m}, published {n}'])
services = (R / '_handoff/leadgeneration-source/src/services.js').read_text()
for name, price, _ in offer_block.PRICES:
    if 'млн' in price and price not in services:
        errors.append(['scripts/offer_block.py', f'price "{name}: {price}" not in services.js'])

if '--summary' in sys.argv:
    print(f'audit: {len(rows)} sitemap pages, {len(errors)} errors, {len(warnings)} warnings')
    for x in errors: print('  ERROR', *x)
    for x in warnings[:10]: print('  warn ', *x)
    if len(warnings) > 10: print(f'  … {len(warnings) - 10} more warnings')
else:
    print(json.dumps(dict(pages=len(rows), errors=errors, warnings=warnings, rows=rows), ensure_ascii=False, indent=2))
raise SystemExit(bool(errors))
