/* «Давайте познакомимся» — окно только для заинтересованных (Даниил 16.11.2026).
   Показывается один раз, когда человек долго читает или смотрит несколько страниц.
   Не закрывает страницу: карточка в углу (компьютер) или снизу (телефон), без затемнения.
   После «Не сейчас» молчит 7 дней, после контакта или заявки — 30 дней. */
(function () {
  'use strict';
  if (window.__loopsPopup) return;
  window.__loopsPopup = true;
  if (/^\/(razbor|razbor-kp|razbor-new|kp|reports|studio|clinic-ads|privacy)(\/|$)/.test(location.pathname)) return;
  if (location.pathname === '/404.html') return;

  var KEY = 'loops_popup_until', SK = 'loops_popup_session';
  var DAY = 864e5;
  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  function quiet(days) { lsSet(KEY, String(Date.now() + days * DAY)); }
  if (Number(lsGet(KEY) || 0) > Date.now()) return;

  // Session: pages viewed and active seconds across pages.
  var s = {pages: 0, active: 0, shown: false};
  try { s = JSON.parse(sessionStorage.getItem(SK)) || s; } catch (_) {}
  if (s.shown) return;
  s.pages += 1;
  function save() { try { sessionStorage.setItem(SK, JSON.stringify(s)); } catch (_) {} }
  save();

  var pageActive = 0, lastInput = Date.now(), maxScroll = 0, done = false;
  ['scroll', 'mousemove', 'keydown', 'touchstart', 'click'].forEach(function (ev) {
    window.addEventListener(ev, function () { lastInput = Date.now(); }, {passive: true});
  });
  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (h > 0) maxScroll = Math.max(maxScroll, scrollY / h);
  }, {passive: true});
  // Contact or lead already happened — do not ask again.
  window.addEventListener('loops:interaction', function (e) {
    var n = e.detail && e.detail.name;
    if (n === 'contact_click' || n === 'lead_sent' || n === 'brief_prepared') { quiet(30); done = true; close(); }
  });

  function blocked() {
    var a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return true; // typing
    var form = document.querySelector('#contact');
    if (form) { var r = form.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) return true; } // form on screen
    var dlg = document.querySelector('dialog[open]');
    return !!dlg;
  }
  function interested() {
    if (s.pages >= 2 && s.active >= 60) return true;          // walks the site
    if (pageActive >= 90 && maxScroll >= 0.5) return true;   // reads one page carefully
    return false;
  }

  var timer = setInterval(function () {
    if (done) return clearInterval(timer);
    if (document.visibilityState !== 'visible' || Date.now() - lastInput > 30000) return;
    pageActive += 1; s.active += 1;
    if (s.active % 5 === 0) save();
    if (interested() && !blocked()) show();
  }, 1000);
  // Computer: leaving the tab after real reading.
  document.addEventListener('mouseout', function (e) {
    if (done || e.relatedTarget || e.clientY > 0) return;
    if (s.active >= 40 && maxScroll >= 0.3 && !blocked()) show();
  });

  var box;
  function track(name) { if (window.loopsTrack) window.loopsTrack(name); }
  function close() { if (box) { box.classList.remove('lp-in'); setTimeout(function () { box && box.remove(); box = null; }, 250); } }
  function pageName() {
    var h1 = document.querySelector('h1');
    return ((h1 && h1.innerText) || document.title || '').replace(/\s+/g, ' ').replace(/ — Loops$/, '').trim().replace(/[.\s]+$/, '').slice(0, 90);
  }
  function show() {
    if (done) return;
    done = true; s.shown = true; save(); quiet(7); clearInterval(timer);
    var text = 'Здравствуйте! Я с сайта loops.uz' + (location.pathname === '/' ? '' : ', страница «' + pageName() + '»') + '. Давайте познакомимся — хочу обсудить задачу на бесплатном созвоне.';
    var tg = 'https://t.me/dani_gzv?text=' + encodeURIComponent(text);
    var formHref = document.querySelector('#contact') ? '#contact' : '/#contact';
    var css = document.createElement('style');
    css.textContent = '.lp{position:fixed;right:24px;bottom:24px;z-index:60;width:min(380px,calc(100vw - 32px));background:#fffef6;color:#20201e;border:1px solid #e3e0c8;border-radius:16px;box-shadow:0 18px 50px rgba(32,32,30,.18);padding:22px 22px 18px;font:15px/1.5 "TikTok Sans",Arial,sans-serif;opacity:0;transform:translateY(16px);transition:opacity .25s,transform .25s}'
      + '.lp.lp-in{opacity:1;transform:none}.lp-head{display:flex;gap:12px;align-items:center;margin-bottom:12px}.lp-head img{width:48px;height:48px;border-radius:50%;object-fit:cover}.lp-eyebrow{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#686862}'
      + '.lp h2{font-size:21px;line-height:1.2;letter-spacing:-.02em;margin:2px 0 0}.lp p{margin:0 0 16px;color:#3c3c38}.lp-actions{display:grid;gap:10px}'
      + '.lp-tg{display:flex;align-items:center;justify-content:center;min-height:48px;background:#f2df35;color:#20201e;font-weight:600;border-radius:10px;text-decoration:none}'
      + '.lp-row{display:flex;justify-content:space-between;align-items:center;font-size:14px}.lp-row a{color:#20201e;text-decoration:underline;text-underline-offset:4px}.lp-row button,.lp-x{background:none;border:0;color:#686862;font:inherit;cursor:pointer;padding:6px 0}'
      + '.lp-x{position:absolute;top:8px;right:12px;font-size:22px;line-height:1;padding:6px}'
      + '@media(max-width:760px){.lp{right:8px;left:8px;width:auto;bottom:calc(64px + env(safe-area-inset-bottom));padding:18px}.lp h2{font-size:19px}}';
    document.head.appendChild(css);
    box = document.createElement('aside');
    box.className = 'lp';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Давайте познакомимся');
    box.innerHTML = '<button class="lp-x" type="button" aria-label="Закрыть">×</button>'
      + '<div class="lp-head"><img src="/images/daniil-gazizov.jpg" alt="Даниил Газизов" width="48" height="48"><div><div class="lp-eyebrow">Даниил Газизов · Loops</div><h2>Давайте познакомимся?</h2></div></div>'
      + '<p>Если задача актуальна, предлагаю короткий бесплатный созвон. Посмотрю вашу ситуацию и подскажу, что можно сделать с рекламой и заявками. Ни к чему не обязывает.</p>'
      + '<div class="lp-actions"><a class="lp-tg" href="' + tg + '" target="_blank" rel="noopener">Договориться в Telegram ↗</a>'
      + '<div class="lp-row"><a class="lp-form" href="' + formHref + '">Оставить контакт</a><button type="button" class="lp-later">Не сейчас</button></div></div>';
    document.body.appendChild(box);
    requestAnimationFrame(function () { box && box.classList.add('lp-in'); });
    track('popup_shown');
    box.querySelector('.lp-tg').addEventListener('click', function () { track('popup_click'); quiet(30); close(); });
    box.querySelector('.lp-form').addEventListener('click', function () { track('popup_click'); quiet(30); close(); });
    box.querySelector('.lp-later').addEventListener('click', close);
    box.querySelector('.lp-x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }
})();
