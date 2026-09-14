"""Accessible, data-driven diagrams. Counts, labels and bars share one source."""
import html

def esc(s): return html.escape(str(s), quote=True)

def pct(n): return f'{n:.1f}'.replace('.', ',').removesuffix(',0') + '%'

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
