#!/usr/bin/env python3
"""sitemap.xml from the sources, not from the previous file.

Pages: root, 4 services, industries (industries.json), published cases (cases/_content),
articles (content/articles.json), /articles/, /cases.html, /about/, /privacy/.
lastmod: content date, not build date (16.11.2026): articles and cases — their updated/published;
pages.json — updated if set; React pages (root, services, industries) — last commit of their sources;
the rest — last commit of the page file.
Run by build-editorial.py; can also run alone: python3 scripts/sitemap.py
"""
from pathlib import Path
from datetime import date
import json, subprocess, html

R = Path(__file__).resolve().parents[1]
BASE = 'https://loops.uz'
SERVICES = ['target', 'ai-bot', 'consulting', 'analytics']
EXTRA = ['/articles/', '/cases.html', '/about/', '/privacy/']
PHOTO_PAGES = {'/', '/about/', '/target/'}


def published_cases():
    out = []
    for p in sorted((R / 'cases/_content').glob('*.json')):
        d = json.loads(p.read_text())
        if d.get('status') == 'published':
            out.append(d['id'])
    return out


def paths():
    industries = json.loads((R / '_handoff/leadgeneration-source/src/industries.json').read_text())
    articles = json.loads((R / 'content/articles.json').read_text())
    return (['/'] + [f'/{s}/' for s in SERVICES] + [f'/{k}/' for k in industries]
            + [f'/cases/case-{c}/' for c in published_cases()]
            + [f'/articles/{a["slug"]}/' for a in articles]
            + [f'/{pg["slug"]}/' for pg in json.loads((R / 'content/pages.json').read_text())] + EXTRA)


def page_file(path):
    p = R / path.lstrip('/')
    return p / 'index.html' if path.endswith('/') else p


def git(*args):
    return subprocess.run(['git', '-C', str(R), *args], capture_output=True, text=True)


def content_dates():
    out = {}
    for a in json.loads((R / 'content/articles.json').read_text()):
        out[f'/articles/{a["slug"]}/'] = a.get('updated') or a.get('published')
    for p in sorted((R / 'cases/_content').glob('*.json')):
        d = json.loads(p.read_text())
        out[f'/cases/case-{d["id"]}/'] = d.get('updated') or d.get('published')
    for pg in json.loads((R / 'content/pages.json').read_text()):
        if pg.get('updated'):
            out[f'/{pg["slug"]}/'] = pg['updated']
    return {k: v for k, v in out.items() if v}


REACT_SOURCES = ['_handoff/leadgeneration-source/src']


def lastmod(path, dates):
    if path in dates:
        return dates[path][:10]
    react = path == '/' or path.strip('/') in SERVICES or (R / '_handoff/leadgeneration-source/src/industries.json').read_text().count(f'"{path.strip("/")}"')
    rel = REACT_SOURCES[0] if react else str(page_file(path).relative_to(R))
    changed = git('status', '--porcelain', '--untracked-files=no', '--', rel).stdout.strip()
    committed = git('log', '-1', '--format=%cs', '--', rel).stdout.strip()
    return date.today().isoformat() if changed or not committed else committed


def build(photo_url):
    ps = paths()
    missing = [p for p in ps if not page_file(p).is_file()]
    if missing:
        raise SystemExit(f'sitemap: no page file for {missing}')
    if len(set(ps)) != len(ps):
        raise SystemExit('sitemap: duplicate paths')
    dates = content_dates()
    img = f'<image:image><image:loc>{html.escape(photo_url)}</image:loc></image:image>'
    rows = ''.join(
        f'  <url><loc>{BASE}{p}</loc><lastmod>{lastmod(p, dates)}</lastmod>{img if p in PHOTO_PAGES else ""}</url>\n'
        for p in sorted(ps))
    (R / 'sitemap.xml').write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' + rows + '</urlset>\n')
    return len(ps)


if __name__ == '__main__':
    person = json.loads((R / 'content/person.json').read_text())
    print(f'sitemap: {build(person["image"]["url"])} URLs')
