/* /razbor/ — поток заявок (canvas), появление блоков, закреплённая кнопка, форма.
   Событие Lead: браузер (fbq, eventID) + сервер (CAPI с тем же event_id) — Meta убирает дубль.
   Плюс цели Метрики и DataFast. */
(function () {
  var cfg = window.RAZBOR || {};
  var PIXEL = cfg.pixelId || '';
  var PROD = /^(www\.)?loops\.uz$/.test(location.hostname);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---------- Счётчики ---------- */
  if (PIXEL && PROD) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL);
    fbq('track', 'PageView');
  }
  function goal(name, params) {
    try { if (typeof ym === 'function') ym(101239870, 'reachGoal', name, params || {}); } catch (e) {}
    try { if (typeof window.datafast === 'function') window.datafast(name, params || {}); } catch (e) {}
  }
  function cookie(n) { var m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; }
  function fbc() {
    var c = cookie('_fbc'); if (c) return c;
    var id = new URLSearchParams(location.search).get('fbclid');
    return id ? 'fb.1.' + Date.now() + '.' + id : '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var top = document.querySelector('.top');
    var dock = document.getElementById('dock');
    var hero = document.querySelector('.hero .btn-main');
    var formSec = document.getElementById('form');

    /* ---------- Шапка и закреплённая кнопка ---------- */
    var heroOut = false, formIn = false;
    function dockState() { if (dock) dock.classList.toggle('show', heroOut && !formIn); }
    window.addEventListener('scroll', function () { top.classList.toggle('scrolled', scrollY > 8); }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; dockState(); }).observe(hero);
      new IntersectionObserver(function (e) { formIn = e[0].isIntersecting; dockState(); }, { rootMargin: '0px 0px -20% 0px' }).observe(formSec);
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-cta]');
      if (a) goal('razbor_cta', { place: a.getAttribute('data-cta') });
    });

    /* ---------- Появление блоков ---------- */
    var rv = document.querySelectorAll('.path h2, .path .lead, .step, .get-grid > *, .who-grid > *, .loop h2, .loop .lead, .lp, .cases h2, .cases .lead, .inds, .offer h2, .plan, .form-grid > *, .faq h2');
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      rv.forEach(function (el, i) { el.classList.add('reveal'); if (!el.classList.contains('lp')) el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
    } else {
      document.documentElement.classList.add('no-io');
    }

    /* ---------- Поток заявок ---------- */
    flow();

    /* ---------- Форма ---------- */
    form();
  });

  function flow() {
    var fig = document.querySelector('.flow');
    var cv = document.getElementById('flow');
    if (!fig || !cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var stages = [].slice.call(fig.querySelectorAll('.flow-stages li'));
    var keep = [1, .61, 34 / 61, 12 / 34];          // доля, которая проходит каждый этап
    var W, H, dpr, X, nodes = [], parts = [], running = false, last = 0, acc = 0;
    var cs = getComputedStyle(document.documentElement);
    var C = { paper: '#f7f7f2', leak: (cs.getPropertyValue('--leak') || '#ff4f86').trim(), yellow: (cs.getPropertyValue('--yellow') || '#f2df35').trim(), line: 'rgba(247,247,242,.16)' };

    function layout() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = fig.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var list = fig.querySelector('.flow-stages').getBoundingClientRect();
      X = list.left - r.left + 22;
      nodes = stages.map(function (li) { var b = li.querySelector('b').getBoundingClientRect(); return b.top - r.top + b.height / 2; });
      if (reduce) frame(0);
    }
    function spawn() {
      // этап, на котором заявка уходит (4 = дошла до оплаты)
      var out = 4;
      for (var k = 1; k < 4; k++) { if (Math.random() > keep[k]) { out = k; break; } }
      parts.push({ y: nodes[0] - 60 - Math.random() * 20, x: X + (Math.random() - .5) * 4, vy: 70 + Math.random() * 30, vx: 0, out: out, falling: false, a: 1, r: 2.6 + Math.random() * 1.2 });
    }
    function frame(dt) {
      ctx.clearRect(0, 0, W, H);
      // труба
      ctx.strokeStyle = C.line; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X, 0); ctx.lineTo(X, nodes[3]); ctx.stroke();
      // узлы
      nodes.forEach(function (y, i) {
        ctx.beginPath(); ctx.arc(X, y, i === 3 ? 9 : 7, 0, 7);
        ctx.fillStyle = i === 3 ? C.yellow : C.paper; ctx.fill();
        if (i > 0) { ctx.beginPath(); ctx.arc(X, y, 13, 0, 7); ctx.strokeStyle = C.leak; ctx.globalAlpha = .35; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1; }
      });
      // частицы
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        if (!p.falling) {
          p.y += p.vy * dt;
          var gate = p.out < 4 ? nodes[p.out] : nodes[3];
          if (p.y >= gate) {
            if (p.out < 4) { p.falling = true; p.vx = (Math.random() < .5 ? -1 : 1) * (40 + Math.random() * 60); p.vy = -20 - Math.random() * 30; }
            else { p.done = true; }
          }
        } else {
          p.vy += 420 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a -= dt * .9;
        }
        if (p.done) { p.r += dt * 18; p.a -= dt * 2.2; }
        if (p.a <= 0 || p.y > H + 20) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(p.a, 0);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fillStyle = p.falling ? C.leak : (p.done ? C.yellow : C.paper);
        if (p.done) { ctx.strokeStyle = C.yellow; ctx.lineWidth = 1.5; ctx.stroke(); } else ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    function loop(t) {
      if (!running) return;
      var dt = Math.min((t - (last || t)) / 1000, .05); last = t;
      acc += dt; while (acc > .16) { spawn(); acc -= .16; }
      frame(dt);
      requestAnimationFrame(loop);
    }
    layout();
    window.addEventListener('resize', layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    if (reduce) { fig.classList.add('on'); return; }
    var vis = function (on) {
      if (on) { fig.classList.add('on'); if (!running) { running = true; last = 0; requestAnimationFrame(loop); } }
      else running = false;
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis(e[0].isIntersecting); }).observe(fig);
    else vis(true);
    document.addEventListener('visibilitychange', function () { vis(!document.hidden && fig.getBoundingClientRect().top < innerHeight); });
  }

  function form() {
    var f1 = document.getElementById('step1'), f2 = document.getElementById('step2'), f3 = document.getElementById('step3');
    if (!f1) return;
    var msg = document.getElementById('f-msg'), btn = document.getElementById('f-submit');
    var started = false, lead = null;
    function start() { if (!started) { started = true; goal('razbor_form_start'); if (window.fbq && PIXEL) fbq('trackCustom', 'RazborFormStart'); } }
    if ('IntersectionObserver' in window) {
      var seen = false;
      new IntersectionObserver(function (e) { if (!seen && e[0].isIntersecting) { seen = true; goal('razbor_form_view'); if (window.fbq && PIXEL) fbq('trackCustom', 'RazborFormView'); } }).observe(f1);
    }
    f1.addEventListener('input', start);

    function send(body) {
      return fetch('/api/razbor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().then(function (j) { return r.ok && j.ok; }); });
    }

    /* --- контакт: телефон по стране или ник Telegram --- */
    var CC = {
      UZ: { code: '998', len: [9], mask: [2, 3, 2, 2], ph: '90 123 45 67' },
      KZ: { code: '7', len: [10], mask: [3, 3, 2, 2], ph: '701 234 56 78' },
      RU: { code: '7', len: [10], mask: [3, 3, 2, 2], ph: '912 345 67 89' },
      KG: { code: '996', len: [9], mask: [3, 3, 3], ph: '555 123 456' },
      TJ: { code: '992', len: [9], mask: [2, 3, 2, 2], ph: '93 123 45 67' },
      TR: { code: '90', len: [10], mask: [3, 3, 2, 2], ph: '532 123 45 67' },
      AE: { code: '971', len: [9], mask: [2, 3, 4], ph: '50 123 4567' },
      XX: { code: '', len: [7, 15], mask: null, ph: '+44 7700 900123' }
    };
    var mode = 'phone', cc = document.getElementById('f-cc'), ph = document.getElementById('f-phone'), tg = document.getElementById('f-tg');
    var pf = document.getElementById('phone-field'), tf = document.getElementById('tg-field');
    function fmt(d, m) { var out = [], i = 0; m.forEach(function (n) { if (i < d.length) { out.push(d.slice(i, i + n)); i += n; } }); if (i < d.length) out.push(d.slice(i)); return out.join(' '); }
    function country() { return CC[cc.value] || CC.UZ; }
    function phoneCheck() {
      var c = country(), d = ph.value.replace(/\D/g, '');
      if (c.code && d.indexOf(c.code) === 0 && d.length > c.len[0]) d = d.slice(c.code.length);   // вставили номер с кодом страны
      if (!c.code) return { ok: d.length >= c.len[0] && d.length <= c.len[1], full: '+' + d, d: d };
      return { ok: d.length === c.len[0], full: '+' + c.code + ' ' + fmt(d, c.mask), d: d };
    }
    function tgCheck() { var v = tg.value.trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//i, ''); return { ok: /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(v), full: '@' + v }; }
    function setBad(field, hintId, text) { field.classList.toggle('bad', !!text); document.getElementById(hintId).textContent = text || ''; }
    cc.addEventListener('change', function () { var c = country(); ph.placeholder = c.ph; ph.value = ''; setBad(pf, 'phone-hint', ''); ph.focus(); start(); });
    ph.addEventListener('input', function () {
      var c = country(); if (!c.mask) return;
      var d = ph.value.replace(/\D/g, ''); if (d.indexOf(c.code) === 0 && d.length > c.len[0]) d = d.slice(c.code.length);
      ph.value = fmt(d.slice(0, c.len[0]), c.mask); if (pf.classList.contains('bad') && phoneCheck().ok) setBad(pf, 'phone-hint', '');
    });
    tg.addEventListener('input', function () { if (tf.classList.contains('bad') && tgCheck().ok) setBad(tf, 'tg-hint', ''); });
    document.querySelectorAll('.seg-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.getAttribute('data-mode');
        document.querySelectorAll('.seg-btn').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
        pf.hidden = mode !== 'phone'; tf.hidden = mode !== 'tg'; (mode === 'phone' ? ph : tg).focus(); start();
      });
    });
    var direct = document.getElementById('tg-direct');
    if (direct) direct.addEventListener('click', function () { goal('razbor_tg_direct'); if (window.fbq && PIXEL) fbq('track', 'Contact', { content_name: 'razbor_telegram' }); });

    f1.addEventListener('submit', function (e) {
      e.preventDefault();
      var el = f1.elements, name = el.name.value.trim();
      var okName = /[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]/.test(name);
      el.name.setAttribute('aria-invalid', okName ? 'false' : 'true');
      var chk = mode === 'phone' ? phoneCheck() : tgCheck();
      if (mode === 'phone') setBad(pf, 'phone-hint', chk.ok ? '' : (country().code ? 'Номер неполный: нужно ' + country().len[0] + ' цифр после +' + country().code : 'Введите номер с кодом страны'));
      else setBad(tf, 'tg-hint', chk.ok ? '' : 'Ник из латиницы, от 5 символов, например dani_gzv');
      if (!okName || !chk.ok) {
        msg.className = 'form-msg err';
        msg.textContent = !okName ? 'Напишите имя буквами.' : '';
        (!okName ? el.name : (mode === 'phone' ? ph : tg)).focus();
        return;
      }
      var q = new URLSearchParams(location.search);
      lead = {
        stage: 1, name: name, contact: chk.full, contact_type: mode, company: el.company.value,
        event_id: 'rz-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10),
        page: location.href.split('#')[0], fbp: cookie('_fbp'), fbc: fbc(),
        utm: { source: q.get('utm_source') || '', medium: q.get('utm_medium') || '', campaign: q.get('utm_campaign') || '',
               content: q.get('utm_content') || '', term: q.get('utm_term') || '' }
      };
      btn.disabled = true; btn.textContent = 'Отправляю…'; msg.textContent = '';
      send(lead).then(function (ok) {
        if (!ok) throw new Error('fail');
        if (window.fbq && PIXEL) fbq('track', 'Lead', { content_name: 'razbor' }, { eventID: lead.event_id });
        goal('razbor_lead', { contact_type: mode });
        f1.hidden = true; f2.hidden = false;
        var d = document.getElementById('dock'); if (d) d.remove();
        document.getElementById('form-box').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }).catch(function () {
        btn.disabled = false; btn.textContent = 'Записаться';
        msg.className = 'form-msg err';
        msg.innerHTML = 'Заявка не отправилась. Попробуйте ещё раз или напишите в Telegram: <a href="https://t.me/dani_gzv">t.me/dani_gzv</a>';
      });
    });

    function finish() { f2.hidden = true; f3.hidden = false; }
    document.getElementById('f2-skip').addEventListener('click', function () { goal('razbor_details_skip'); finish(); });
    f2.addEventListener('submit', function (e) {
      e.preventDefault();
      var el = f2.elements;
      var extra = {
        stage: 2, event_id: lead && lead.event_id, name: lead && lead.name, contact: lead && lead.contact,
        sphere: (f2.querySelector('[name=sphere]:checked') || {}).value || '',
        budget: (f2.querySelector('[name=budget]:checked') || {}).value || '',
        site: el.site.value.trim(), comment: el.comment.value.trim()
      };
      if (!extra.sphere && !extra.budget && !extra.site && !extra.comment) { finish(); return; }
      var b2 = document.getElementById('f2-submit'); b2.disabled = true; b2.textContent = 'Отправляю…';
      send(extra).then(function () { goal('razbor_details', { sphere: extra.sphere, budget: extra.budget }); finish(); })
        .catch(function () { finish(); });
    });
  }

  /* ---------- Карусель кейсов ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var rail = document.querySelector('.cs-rail');
    if (!rail) return;
    document.querySelectorAll('.cs-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = rail.querySelector('.cs');
        var step = card ? card.getBoundingClientRect().width + 14 : 280;
        rail.scrollBy({ left: step * Number(b.getAttribute('data-dir')), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    rail.addEventListener('click', function (e) { var a = e.target.closest('.cs'); if (a) goal('razbor_case_open', { id: a.getAttribute('href') }); });
    document.querySelectorAll('.ind').forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) goal('razbor_industry_open'); }); });
  });
})();
