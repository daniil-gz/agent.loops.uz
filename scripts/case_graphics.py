"""Accessible, data-driven diagrams. Counts, labels and bars share one source."""
import html

def esc(s): return html.escape(str(s), quote=True)

def pct(n): return f'{n:.1f}'.replace('.', ',').removesuffix(',0') + '%'

def markets_diagram(data):
    if not data: return ''
    countries = ''.join(f'<li><span aria-hidden="true">↗</span>{esc(c)}</li>' for c in data['countries'])
    return f'<figure class="markets-diagram"><figcaption><span class="eyebrow">ГЕОГРАФИЯ ПРОДВИЖЕНИЯ</span><span class="diagram-note">из Стамбула — к партнёрам</span></figcaption><div class="markets-origin"><span aria-hidden="true">◎</span><strong>{esc(data["origin"])}</strong></div><ul>{countries}</ul><p class="diagram-source">{len(data["countries"])} рынков рекламы. Схема показывает географию работы, а не распределение выручки.</p></figure>'

def return_diagram(data):
    if not data: return ''
    ratio = f'{data["revenue"]/data["spend"]:.2f}'.replace('.', ',')
    revenue = f'{data["revenue"]:,.0f}'.replace(',', ' ')
    spend = f'{data["spend"]:,.0f}'.replace(',', ' ')
    return f'<figure class="return-diagram"><figcaption><span class="eyebrow">ОТДАЧА ОТ РЕКЛАМЫ / ROAS</span><span class="diagram-note">считаем по точным суммам</span></figcaption><div class="return-equation"><div><strong>$1</strong><span>рекламного бюджета</span></div><span class="return-arrow" aria-hidden="true">→</span><div><strong>${ratio}</strong><span>выручки от привлечённых клиентов</span></div></div><p class="return-calculation">${revenue} выручки <span aria-hidden="true">÷</span><span class="sr-only">разделить на</span> ${spend} расходов Meta</p><p class="diagram-source">По сводке команды проекта. Отношение выручки к расходам Meta; не показатель чистой прибыли.</p></figure>'

ICON = {
 'ads': '<path d="M4 9h5l10-5v16L9 15H4zM9 15l2 6H7l-2-6M22 8v8"/>',
 'chat': '<path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-6 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM7 9h10M7 13h7"/>',
 'person': '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3M8 18h8"/>'
}

def flow_diagram(steps):
    if not steps: return ''
    cards = ''.join(f'<li><span class="flow-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">{ICON.get(s.get("icon"), ICON["chat"])}</svg></span><strong>{esc(s["title"])}</strong><span>{esc(s["text"])}</span></li>' for s in steps)
    return f'<figure class="flow-diagram"><figcaption><span class="eyebrow">ПУТЬ ЗАПРОСА</span><span class="diagram-note">каждый делает своё</span></figcaption><ol>{cards}</ol></figure>'

def funnel_diagram(steps):
    if not steps: return ''
    base = steps[0]['count']
    rows = []
    for i,s in enumerate(steps):
        ratio=s['count']/base*100
        transition='' if i==0 else f'<div class="funnel-transition">↓ {pct(s["count"]/steps[i-1]["count"]*100)} от предыдущего этапа</div>'
        rows.append(f'<li>{transition}<div class="funnel-label"><strong>{esc(s["value"])}</strong><span>{esc(s["label"])}</span><small>{pct(ratio)} от всех диалогов</small></div><div class="funnel-track" aria-hidden="true"><span style="width:{ratio:.4f}%"></span></div></li>')
    return '<figure class="funnel-diagram"><figcaption><span class="eyebrow">ВОРОНКА ОБРАЩЕНИЙ</span><span class="diagram-note">от диалога к задаче</span></figcaption><ol>'+''.join(rows)+'</ol><p class="diagram-source">Данные опубликованного кейса. Длина полос — доля от всех '+esc(steps[0]['value'])+' диалогов. Проценты между этапами рассчитаны отдельно.</p></figure>'
