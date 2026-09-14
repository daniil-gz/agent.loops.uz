"""Structured case renderer. Plain text data only; editorial fields never ship."""
import html
import json
import re
import math
from pathlib import Path
from case_graphics import flow_diagram, funnel_diagram, markets_diagram, return_diagram

SECTION_KEYS = ('context', 'objective', 'work', 'results', 'measurement', 'takeaway')
SECTION_LABELS = ('Контекст', 'Задача', 'Что сделали', 'Результаты', 'Как считали', 'Вывод')

def esc(value):
    return html.escape(str(value), quote=True)

def validate(data, known_ids):
    if data.get('schemaVersion') != 2 or data.get('status') not in ('draft', 'published'):
        raise ValueError('Case requires schemaVersion 2 and draft/published status')
    if data.get('id') not in known_ids:
        raise ValueError('Case id must exist in cases/cases.json')
    if not isinstance(data.get('coverRatio', 1), (int, float)) or not 0.25 <= data.get('coverRatio', 1) <= 4:
        raise ValueError('Cover ratio must be a number between 0.25 and 4')
    for key in ('headline', 'summary', 'client', 'industry', 'location', 'period', 'cover', 'coverAlt', 'workTitle'):
        if not isinstance(data.get(key), str) or not data[key].strip():
            raise ValueError(f'Missing case field: {key}')
    if not re.fullmatch(r'/[A-Za-z0-9_./-]+', data['cover']) or '..' in data['cover']:
        raise ValueError('Cover must be a local absolute asset path')
    if not 1 <= len(data.get('metrics', [])) <= 4:
        raise ValueError('Use 1–4 defined metrics')
    for metric in data['metrics']:
        if not all(metric.get(k) for k in ('value', 'label', 'definition')):
            raise ValueError('Every metric needs a value, label and definition')
    for key in SECTION_KEYS:
        if key == 'work':
            if not data.get(key) or not all(s.get('title') and s.get('text') for s in data[key]):
                raise ValueError('Work requires concrete steps')
        elif not data.get(key, {}).get('title') or not data[key].get('paragraphs'):
            raise ValueError(f'Missing section: {key}')
    if not data.get('editorial', {}).get('sourceFiles'):
        raise ValueError('Record source files before publication')
    if any(cid not in known_ids or cid == data['id'] for cid in data.get('related', [])):
        raise ValueError('Invalid related case')
    funnel = data.get('results', {}).get('funnel', [])
    for i, step in enumerate(funnel):
        if not isinstance(step.get('count'), int) or step['count'] <= 0 or (i and step['count'] > funnel[i-1]['count']):
            raise ValueError('Funnel requires positive, non-increasing integer counts')
        if str(step['count']) != str(step.get('value', '')).replace(' ', '').replace('\u00a0', ''):
            raise ValueError('Funnel display value must match numeric count')
    for step in data.get('flow', []):
        if not step.get('title') or not step.get('text'):
            raise ValueError('Flow steps need title and text')
    markets = data.get('markets')
    if markets is not None:
        countries = markets.get('countries', [])
        if not markets.get('origin') or not isinstance(countries, list) or not countries or not all(isinstance(c, str) and c.strip() for c in countries) or len(countries) != len(set(countries)):
            raise ValueError('Markets require an origin and distinct named countries')
    returns = data.get('results', {}).get('return')
    if returns is not None:
        for key in ('revenue', 'spend'):
            value = returns.get(key)
            if type(value) not in (int, float) or not math.isfinite(value) or value <= 0:
                raise ValueError('Return diagram requires positive finite revenue and spend')
    for evidence in data.get('evidence', []):
        if not evidence.get('alt') or not evidence.get('caption') or not re.fullmatch(r'/[A-Za-z0-9_./-]+', evidence.get('src', '')) or '..' in evidence['src']:
            raise ValueError('Evidence requires a local image, alt and caption')

def paragraphs(section):
    return ''.join(f'<p>{esc(p)}</p>' for p in section['paragraphs'])

def render(data, registry, analytics):
    cid = data['id']
    url = f'https://loops.uz/cases/case-{cid}/'
    title = f"{data['client']} — {data['headline']} | Loops"
    schema = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'Article', 'headline': data['headline'], 'description': data['summary'],
         'author': {'@type': 'Person', 'name': 'Даниил Газизов', 'url': 'https://loops.uz/leadgeneration/#about'},
         'publisher': {'@type': 'Organization', 'name': 'Loops', 'url': 'https://loops.uz/'},
         'image': 'https://loops.uz' + data['cover'], 'mainEntityOfPage': url},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Loops', 'item': 'https://loops.uz/leadgeneration/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Кейсы', 'item': 'https://loops.uz/leadgeneration/#cases'},
            {'@type': 'ListItem', 'position': 3, 'name': data['client'], 'item': url}]}]}
    ld = json.dumps(schema, ensure_ascii=False).replace('<', '\\u003c')
    metrics = ''.join(f'<div><strong>{esc(m["value"])}</strong><span>{esc(m["label"])}</span></div>' for m in data['metrics'])
    toc = ''.join(f'<a href="#{key}"><span>0{i+1}</span>{label}</a>' for i, (key, label) in enumerate(zip(SECTION_KEYS, SECTION_LABELS)))
    sections = []
    for i, key in enumerate(SECTION_KEYS):
        heading = data['workTitle'] if key == 'work' else data[key]['title']
        if key == 'work':
            content = '<ol class="work-steps">' + ''.join(f'<li><span class="step-index" aria-hidden="true">0{index+1}</span><h3>{esc(step["title"])}</h3><p>{esc(step["text"])}</p></li>' for index, step in enumerate(data[key])) + '</ol>'
        else:
            section = data[key]
            content = paragraphs(section)
            if key == 'context':
                content += markets_diagram(data.get('markets'))
            if key == 'objective':
                content += flow_diagram(data.get('flow', []))
            if key == 'results':
                content = funnel_diagram(section.get('funnel', [])) + return_diagram(section.get('return')) + content
            if key == 'measurement':
                content += '<dl class="metric-notes">' + ''.join(f'<div><dt>{esc(m["label"])}</dt><dd>{esc(m["definition"])}</dd></div>' for m in data['metrics']) + '</dl>'
            if key == 'results':
                content += ''.join(f'<figure class="evidence"><img src="{esc(e["src"])}" alt="{esc(e["alt"])}" loading="lazy"><figcaption>{esc(e["caption"])}</figcaption></figure>' for e in data.get('evidence', []))
        sections.append(f'<section class="story-section" id="{key}"><header class="story-heading"><span class="eyebrow">0{i+1} / {SECTION_LABELS[i]}</span><h2>{esc(heading)}</h2></header><div class="story-body">{content}</div></section>')
    related = ''.join(f'<a href="/cases/case-{c["id"]}/"><span class="eyebrow">{esc(c["cat"])}</span><h3>{esc(c["client"])}</h3><span class="related-bottom">Открыть кейс <span aria-hidden="true">↗</span></span></a>' for rid in data.get('related', []) for c in registry if c['id'] == rid)
    return f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title><meta name="description" content="{esc(data['summary'])}"><link rel="canonical" href="{url}"><meta name="robots" content="index,follow">
<meta property="og:type" content="article"><meta property="og:site_name" content="Loops"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(data['summary'])}"><meta property="og:url" content="{url}"><meta property="og:image" content="https://loops.uz{esc(data['cover'])}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/leadgeneration/assets/favicon.png"><link rel="stylesheet" href="/leadgeneration/assets/fonts.css"><link rel="stylesheet" href="/cases/format-v2.css">
<script type="application/ld+json">{ld}</script>
{analytics}
<script defer data-website-id="dfid_f3VYRJCEILPpM9zBm2vdN" data-domain="loops.uz" src="https://datafa.st/js/script.js"></script>
</head><body><a class="skip-link" href="#content">Перейти к кейсу</a>
<header class="wrap case-header"><a class="wordmark" href="/leadgeneration/" aria-label="Loops — на главную">loops</a><nav aria-label="Основная навигация"><a href="/leadgeneration/#cases">Кейсы</a><a href="/leadgeneration/#services">Услуги</a><a href="/leadgeneration/#about">Обо мне</a></nav><a class="button" href="/leadgeneration/#contact">Обсудить проект <span aria-hidden="true">↗</span></a></header>
<main id="content"><section class="wrap case-hero"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="/leadgeneration/#projects">Все проекты</a><span aria-hidden="true">/</span><span>{esc(data['client'])}</span></nav>
<div class="hero-grid"><div><span class="eyebrow">{esc(data['client'])} / КЕЙС LOOPS</span><h1>{esc(data['headline'])}</h1><p class="case-summary">{esc(data['summary'])}</p></div><figure class="cover" style="--cover-ratio:{data.get('coverRatio', 1)}"><img src="{esc(data['cover'])}" alt="{esc(data['coverAlt'])}" width="640" height="640"><figcaption>За цифрами —<br>своя история.</figcaption></figure></div>
<div class="metrics" style="--metric-count:{len(data['metrics'])}">{metrics}</div><dl class="case-meta"><div><dt>Бизнес</dt><dd>{esc(data['industry'])}</dd></div><div><dt>География</dt><dd>{esc(data['location'])}</dd></div><div><dt>Инструменты</dt><dd>{esc(' · '.join(data['services']))}</dd></div><div><dt>Период</dt><dd>{esc(data['period'])}</dd></div></dl></section>
<div class="wrap story-layout"><aside><nav class="toc" aria-label="Содержание кейса"><span class="eyebrow">ВНУТРИ ИСТОРИИ</span>{toc}</nav></aside><article>{''.join(sections)}</article></div>
<section class="wrap case-cta"><span class="eyebrow">ЕСТЬ ПОХОЖАЯ ЗАДАЧА?</span><div class="case-cta-copy"><h2>Разберём ваш<br><span>путь к продаже.</span></h2><p>Посмотрим, что происходит от первого обращения до работы менеджера.</p></div><a class="button button-yellow" href="/leadgeneration/#contact">Обсудить проект <span aria-hidden="true">↗</span></a></section>
<section class="wrap related"><div class="section-heading"><h2>Другие истории.</h2><a href="/leadgeneration/#cases">Все кейсы ↗</a></div><div class="related-grid">{related}</div></section></main>
<footer class="wrap case-footer"><span>© 2026 Loops · Даниил Газизов</span><a href="/leadgeneration/#projects">Вернуться к проектам ↗</a><a href="https://t.me/dani_gzv" target="_blank" rel="noopener">Telegram ↗</a></footer></body></html>'''
