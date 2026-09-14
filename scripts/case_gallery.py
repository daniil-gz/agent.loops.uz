"""Optional creative gallery. Only explicitly approved, anonymized copy goes here."""
import html
import re
from pathlib import Path


def esc(value):
    return html.escape(str(value), quote=True)


def validate_gallery(data):
    gallery = data.get('gallery')
    if gallery is None:
        return
    if not gallery.get('title') or not gallery.get('intro') or not 1 <= len(gallery.get('items', [])) <= 20:
        raise ValueError('Gallery requires a title, intro and 1–20 items')
    for item in gallery['items']:
        if not all(item.get(k) for k in ('title', 'caption', 'alt')):
            raise ValueError('Gallery items need title, caption and alt')
        for key in ('src', 'thumbnail'):
            path = item.get(key, '')
            if not re.fullmatch(r'/images/[A-Za-z0-9_./-]+', path) or '..' in path:
                raise ValueError('Gallery requires local image paths')
            if not (Path(__file__).resolve().parents[1] / path.lstrip('/')).is_file():
                raise ValueError('Missing gallery asset')
    for excerpt in gallery.get('conversations', []):
        if not excerpt.get('title') or not excerpt.get('messages'):
            raise ValueError('Conversation requires title and messages')
        for message in excerpt['messages']:
            if message.get('role') not in ('assistant', 'customer', 'redacted') or not message.get('text'):
                raise ValueError('Invalid conversation message')
            # Prevent raw telephone numbers from entering the reusable public format.
            if re.search(r'(?:\+?\d[\s()-]*){7,}', message['text']):
                raise ValueError('Anonymize contact details before publication')


def gallery_markup(gallery):
    if not gallery:
        return ''
    cards = []
    for index, item in enumerate(gallery['items'], 1):
        cards.append(f'''<figure class="cg-card"><a class="cg-open" href="{esc(item['src'])}" data-creative data-title="{esc(item['title'])}" data-caption="{esc(item['caption'])}" aria-label="Увеличить: {esc(item['title'])}"><img src="{esc(item['thumbnail'])}" alt="{esc(item['alt'])}" width="540" height="960" loading="lazy" decoding="async"><span class="cg-expand" aria-hidden="true">↗</span></a><figcaption><span class="cg-number">{index:02d}</span><div><h4>{esc(item['title'])}</h4><p>{esc(item['caption'])}</p></div></figcaption></figure>''')
    chats = []
    for index, excerpt in enumerate(gallery.get('conversations', []), 1):
        messages = ''.join(f'<li class="cg-message cg-message--{esc(m["role"])}"><span>{"Клиент" if m["role"] == "customer" else "Контакт" if m["role"] == "redacted" else "ILVI · ассистент"}</span><p>{esc(m["text"])}</p></li>' for m in excerpt['messages'])
        chats.append(f'<section class="cg-chat"><header><span class="cg-number">0{index}</span><h4>{esc(excerpt["title"])}</h4></header><ol>{messages}</ol></section>')
    conversation_html = f'''<div class="cg-conversation-head" id="qualification-examples"><div><span class="eyebrow">ПОСЛЕ КЛИКА</span><h3>Красивый креатив —<br>только начало.</h3></div><p>Дальше ассистент уточняет, кто оставил заявку: оптовый покупатель с действующим магазином или человек, который ищет пару для себя.</p></div><div class="cg-chats">{''.join(chats)}</div><p class="cg-disclosure">Фрагменты реальных диалогов. Личные данные скрыты; оформление адаптировано.</p>''' if chats else ''
    return f'''<div class="case-gallery" id="creative-gallery"><div class="cg-heading"><div><span class="eyebrow">КРЕАТИВЫ И КВАЛИФИКАЦИЯ</span><h3>{esc(gallery['title'])}</h3></div><div><p>{esc(gallery['intro'])}</p><span class="cg-handwritten">сначала внимание,<br>потом — диалог.</span></div></div><div class="cg-toolbar"><span>{len(cards)} креативов · нажмите, чтобы рассмотреть</span><div class="cg-controls" hidden><button type="button" data-rail-prev aria-label="Предыдущие креативы">←</button><button type="button" data-rail-next aria-label="Следующие креативы">→</button></div></div><div class="cg-rail" tabindex="0" role="region" aria-label="Креативы ILVI">{''.join(cards)}</div>{conversation_html}<dialog class="cg-lightbox" aria-labelledby="cg-lightbox-title"><div class="cg-lightbox-bar"><span data-lightbox-count aria-live="polite"></span><button type="button" data-lightbox-close aria-label="Закрыть просмотр">Закрыть <span aria-hidden="true">×</span></button></div><div class="cg-lightbox-stage"><button type="button" data-lightbox-prev aria-label="Предыдущий креатив">←</button><img data-lightbox-image alt=""><button type="button" data-lightbox-next aria-label="Следующий креатив">→</button></div><div class="cg-lightbox-caption"><h3 id="cg-lightbox-title"></h3><p data-lightbox-caption></p><a data-lightbox-original target="_blank" rel="noopener">Открыть изображение ↗</a></div></dialog></div>'''
