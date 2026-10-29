"""Shared price, team and proof blocks for case and editorial pages.
Prices mirror _handoff/leadgeneration-source/src/services.js — change both together.
Team wording answers both «частный таргетолог» and «агентство» queries with Daniil.
"""
import html, json
from pathlib import Path

esc = lambda x: html.escape(str(x), quote=True)

TEAM = ('Даниил Газизов — таргетолог и основатель Loops. Он лично отвечает за каждый проект. '
        'С ним работает команда Loops: таргетологи, креативы, чат-боты и CRM.')

PRICES = [
    ('Таргет в Instagram и Facebook', '6 млн сум / месяц', '/target/'),
    ('Таргет + чат-бот', '12 млн сум / месяц', '/target/'),
    ('Чат-бот и ИИ-квалификация', '6 млн сум / месяц', '/ai-bot/'),
    ('Отдел продаж и CRM', 'от 24 млн сум', '/consulting/'),
]

FAQ = [
    ('Loops — частный таргетолог или агентство?',
     'И то и другое. Даниил Газизов ведёт проект лично и остаётся на связи. '
     'Команда Loops делает креативы, чат-ботов, CRM и аналитику. Вы получаете личного специалиста и команду за одну цену.'),
    ('Сколько стоит работа с Loops?',
     'Таргет в Instagram и Facebook — 6 млн сум в месяц. Таргет с чат-ботом — 12 млн сум. '
     'Чат-бот отдельно — 6 млн сум. Отдел продаж и CRM — от 24 млн сум. Рекламный бюджет оплачивается отдельно.'),
]

# Three cases with the strongest numbers for each service or niche.
SECTOR_CASES = {
    'target': ['ilvi', 'viamed', 'chery'], 'ai-bot': ['tak', 'nwl', 'viamed'],
    'consulting': ['ilvi', 'biorise', 'tak'], 'analytics': ['biorise', 'ilvi', 'chery'],
    'clinics': ['biorise', 'viamed', 'dental'], 'b2b': ['ilvi', 'nwl', 'centrismedia'],
    'manufacturing': ['basalt', 'printuz', 'bts'], 'auto': ['chery', 'blackstar', 'ilvi'],
    'fitness': ['centrisfit', 'centrisladies', 'dental'], 'horeca': ['dolcetta', 'bscafe', 'restokids'],
}


def load_cases():
    root = Path(__file__).resolve().parents[1]
    return [json.loads(p.read_text()) for p in sorted((root / 'cases/_content').glob('*.json'))]


def proof(ids, cases):
    by_id = {c['id']: c for c in cases}
    cards = ''
    for cid in ids:
        c = by_id.get(cid)
        if not c:
            continue
        nums = ''.join(f'<li><strong>{esc(m["value"])}</strong> {esc(m["label"])}</li>' for m in c['metrics'][:2])
        cards += (f'<a class="offer-case" href="/cases/case-{cid}/"><span class="eyebrow">{esc(c["industry"])}</span>'
                  f'<h3>{esc(c["client"])}</h3><ul>{nums}</ul><span class="text-link">Открыть кейс ↗</span></a>')
    return f'<div class="offer-cases">{cards}</div>'


def prices():
    rows = ''.join(f'<tr><th scope="row"><a href="{href}">{esc(name)}</a></th><td>{esc(price)}</td></tr>' for name, price, href in PRICES)
    return ('<div class="table-wrap"><table class="data-table offer-prices"><caption>Цены Loops, 2026 год</caption>'
            f'<thead><tr><th scope="col">Услуга</th><th scope="col">Стоимость</th></tr></thead><tbody>{rows}</tbody></table></div>'
            '<p class="offer-note">Рекламный бюджет и платные сторонние сервисы оплачиваются отдельно.</p>')


def offer(ids, cases, heading='Результаты и цены.'):
    """Proof cases, price table and who runs the project, as one closing section."""
    return (f'<section class="wrap offer" aria-label="Кейсы и цены Loops"><span class="eyebrow">КЕЙСЫ С ЦИФРАМИ · ЦЕНЫ · КОМАНДА</span>'
            f'<h2>{esc(heading)}</h2>{proof(ids, cases)}<div class="offer-grid">{prices()}'
            f'<div class="offer-team"><h3>Кто ведёт проект</h3><p>{esc(TEAM)}</p>'
            '<a class="button button-yellow" href="https://t.me/dani_gzv">Написать Даниилу ↗</a></div></div>'
            f'{faq_html()}</section>')


def faq_schema(url):
    return {'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in FAQ]}


def faq_html():
    items = ''.join(f'<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in FAQ)
    return f'<div class="offer-faq">{items}</div>'
