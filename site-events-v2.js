/* Loops interaction goals. No brief text, contact data, query strings or cookies. */
(function () {
  'use strict';
  if (window.loopsTrack) return;
  var allowed = new Set(['contact_click', 'lead_sent', 'brief_prepared', 'case_preview_open', 'case_full_open', 'audit_link']);
  var production = /^(www\.)?loops\.uz$/.test(location.hostname);
  window.loopsTrack = function (name, caseId) {
    if (!allowed.has(name)) return;
    var params = {page: location.pathname};
    if (typeof caseId === 'string' && /^[a-z0-9-]{1,64}$/.test(caseId)) params.case_id = caseId;
    // Local QA can observe exactly what would be sent, without contacting analytics.
    window.dispatchEvent(new CustomEvent('loops:interaction', {detail: {name: name, params: params}}));
    if (!production) return;
    try { if (typeof window.ym === 'function') window.ym(101239870, 'reachGoal', name, params); } catch (_) {}
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params); } catch (_) {}
  };
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    if (url.hostname === 't.me' && url.pathname.replace(/\/$/, '') === '/dani_gzv') {
      window.loopsTrack('contact_click');
    }
    var match = url.pathname.match(/^\/cases\/case-([a-z0-9-]+)\/$/);
    // Preview links prevent the default navigation; only actual full-case links count here.
    if (url.origin === location.origin && match && !event.defaultPrevented) window.loopsTrack('case_full_open', match[1]);
  });
  // Ready-made first message: Daniil sees which page the person came from (16.11.2026).
  function prefillTelegram() {
    if (typeof document.querySelector !== 'function' || typeof document.querySelectorAll !== 'function') return;
    var h1 = document.querySelector('h1');
    var name = ((h1 && h1.innerText) || document.title || '').replace(/\s+/g, ' ').replace(/ — Loops$/, '').trim().replace(/[.\s]+$/, '').slice(0, 90);
    var text = 'Здравствуйте! Я с сайта loops.uz' + (location.pathname === '/' ? '' : ', страница «' + name + '»') + '. Хочу обсудить задачу на бесплатном созвоне.';
    document.querySelectorAll('a[href^="https://t.me/dani_gzv"]').forEach(function (a) {
      try {
        var u = new URL(a.href);
        if (u.pathname.replace(/\/$/, '') !== '/dani_gzv' || u.searchParams.has('text')) return;
        u.searchParams.set('text', text);
        a.href = u.toString();
      } catch (_) {}
    });
  }
  try {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prefillTelegram);
    else prefillTelegram();
    // React pages render after load: repeat once the app has mounted.
    window.addEventListener('load', function () { setTimeout(prefillTelegram, 800); });
  } catch (_) {}
})();
