/* Форма заявки loops.uz — одна на весь сайт (решение Даниила 10.11.2026).
   Страница ставит место: <div data-lead-form data-service="Консалтинг" data-theme="dark"></div>.
   Скрипт рисует форму и шлёт заявку в /api/razbor (сервер loops-lead) с form=site и адресом страницы.
   Дальше: группа «LeadGen. Заявки», Notion, таблица. Человеку автоматически никто не пишет.
   Ответ no_telegram — просим проверить номер. Другая ошибка — кнопка Telegram с готовым текстом.
   Поле company — ловушка для ботов: человек его не видит, и мы его не шлём, если оно пустое. */
(function () {
  'use strict';
  if (window.__loopsLeadForm) return;
  window.__loopsLeadForm = true;
  var TG = 'https://t.me/dani_gzv';

  /* Телефон или Telegram. То же правило, что normalizeContact в worker/index.js и App.jsx. */
  function normalizeContact(raw) {
    var s = String(raw || '').trim();
    var tg = s.match(/^(?:@|(?:https?:\/\/)?t(?:elegram)?\.me\/)([A-Za-z][A-Za-z0-9_]{4,31})\/?$/i);
    if (tg) return '@' + tg[1];
    if (!/^[+\d\s()\-.]+$/.test(s)) return null;
    var d = s.replace(/\D/g, '');
    if (d.length === 9) return '+998' + d;
    if (d.length === 12 && d.indexOf('998') === 0) return '+' + d;
    if (s.charAt(0) === '+' && d.length >= 10 && d.length <= 15) return '+' + d;
    return null;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var uid = 0;
  function formHtml(id) {
    return '<form class="lf-form ym-hide-content" novalidate>' +
      '<div class="lf-row">' +
      '<label class="lf-field">Как вас зовут<input name="name" autocomplete="given-name" placeholder="Имя" required maxlength="80"></label>' +
      '<label class="lf-field">Телефон или Telegram<input name="contact" autocomplete="tel" inputmode="text" placeholder="+998 90 123 45 67 или @ник" required maxlength="64" aria-describedby="' + id + '-err"></label>' +
      '</div>' +
      '<p class="lf-error" id="' + id + '-err" role="alert" hidden></p>' +
      '<label class="lf-field">Ваш бизнес<input name="business" autocomplete="organization" placeholder="Компания или ниша" maxlength="120"></label>' +
      '<label class="lf-field">Задача<textarea name="message" rows="3" placeholder="Что сейчас происходит и какой результат нужен?" maxlength="1500"></textarea></label>' +
      '<label class="lf-trap" aria-hidden="true">Компания<input name="company" tabindex="-1" autocomplete="off"></label>' +
      '<button class="lf-submit" type="submit">Отправить заявку</button>' +
      '<p class="lf-helper">Заявка придёт Даниилу. Он ответит по телефону или в Telegram.</p>' +
      '</form>';
  }

  function doneHtml() {
    return '<div class="lf-state" role="status"><h3>Заявка отправлена.</h3>' +
      '<p>Даниил получил её и свяжется с вами по контакту, который вы указали.</p></div>';
  }

  function briefHtml(text) {
    return '<div class="lf-state" role="status"><h3>Не получилось отправить.</h3>' +
      '<p>Текст заявки готов. Отправьте его Даниилу в Telegram — это одна кнопка.</p>' +
      '<pre>' + esc(text) + '</pre>' +
      '<a class="lf-submit" href="' + TG + '?text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener">Открыть Telegram ↗</a>' +
      '<button class="lf-again" type="button">Изменить заявку</button></div>';
  }

  function utm() {
    var q = new URLSearchParams(location.search), out = {};
    ['source', 'medium', 'campaign', 'content', 'term'].forEach(function (k) {
      var v = q.get('utm_' + k);
      if (v) out[k] = v.slice(0, 120);
    });
    return out;
  }

  function mount(host) {
    if (host.getAttribute('data-ready')) return;
    host.setAttribute('data-ready', '1');
    host.classList.add('lf', host.getAttribute('data-theme') === 'dark' ? 'lf--dark' : 'lf--light');
    var id = 'lf' + (++uid), draft = {}, view = 'form', brief = '';
    var service = host.getAttribute('data-service') || '';

    /* Рисует текущее состояние. React при гидратации может стереть содержимое места — тогда рисуем заново. */
    function render() {
      if (view === 'done') { host.innerHTML = doneHtml(); return; }
      if (view === 'brief') {
        host.innerHTML = briefHtml(brief);
        host.querySelector('.lf-again').addEventListener('click', showForm);
        return;
      }
      host.innerHTML = formHtml(id);
      var form = host.querySelector('form');
      Object.keys(draft).forEach(function (k) { if (form[k]) form[k].value = draft[k]; });
      form.addEventListener('submit', submit);
      form.contact.addEventListener('input', function () { setError(form, ''); });
      form.addEventListener('input', function (e) { if (e.target.name && e.target.name !== 'company') draft[e.target.name] = e.target.value; });
    }

    function showForm() { view = 'form'; render(); }

    function setError(form, text) {
      var box = form.querySelector('.lf-error');
      box.textContent = text;
      box.hidden = !text;
      if (text) form.contact.setAttribute('aria-invalid', 'true');
      else form.contact.removeAttribute('aria-invalid');
    }

    function submit(e) {
      e.preventDefault();
      var form = e.currentTarget, btn = form.querySelector('.lf-submit');
      ['name', 'contact', 'business', 'message'].forEach(function (k) { draft[k] = form[k].value.trim(); });
      if (!draft.name) { form.name.focus(); form.name.setAttribute('aria-invalid', 'true'); return; }
      form.name.removeAttribute('aria-invalid');
      var contact = normalizeContact(draft.contact);
      if (!contact) {
        setError(form, 'Укажите телефон, например +998 90 123 45 67, или Telegram, например @username.');
        form.contact.focus();
        return;
      }
      setError(form, '');
      var text = 'Даниил, здравствуйте! Хочу обсудить проект.\n\nИмя: ' + draft.name + '\nКонтакт: ' + contact +
        (draft.business ? '\nБизнес: ' + draft.business : '') + (service ? '\nТема: ' + service : '') +
        (draft.message ? '\nЗадача: ' + draft.message : '') + '\nСтраница: ' + location.host + location.pathname;
      var body = {
        form: 'site', page: location.origin + location.pathname, name: draft.name, contact: contact,
        business: draft.business, service: service, message: draft.message, utm: utm(),
        event_id: 'site-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
      };
      if (form.company.value) body.company = form.company.value;  // ловушка: только бот заполняет
      btn.disabled = true;
      btn.textContent = 'Отправляем…';
      fetch('/api/razbor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { r: r, j: j }; }); })
        .then(function (res) {
          if (res.j && res.j.error === 'no_telegram') {
            btn.disabled = false;
            btn.textContent = 'Отправить заявку';
            setError(form, 'Этот номер не нашли в Telegram. Проверьте номер или укажите @username — так Даниил сможет вам написать.');
            form.contact.focus();
            return;
          }
          if (!res.r.ok || !res.j.ok) throw new Error(res.j.error || 'send');
          if (window.loopsTrack) window.loopsTrack('lead_sent');
          view = 'done';
          render();
        })
        .catch(function () {
          if (window.loopsTrack) window.loopsTrack('brief_prepared');
          view = 'brief';
          brief = text;
          render();
        });
    }

    render();
    if (window.MutationObserver) {
      new MutationObserver(function () {
        if (!host.querySelector('.lf-form, .lf-state')) render();
      }).observe(host, { childList: true });
    }
  }

  function init() {
    var hosts = document.querySelectorAll('[data-lead-form]');
    if (!hosts.length) return;
    if (!document.querySelector('link[href="/lead-form.css"]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = '/lead-form.css';
      document.head.appendChild(l);
    }
    for (var i = 0; i < hosts.length; i++) mount(hosts[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', init);  // React-страницы: место под форму могло появиться после гидратации
})();
