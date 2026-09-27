/* Loops interaction goals. No brief text, contact data, query strings or cookies. */
(function () {
  'use strict';
  if (window.loopsTrack) return;
  var allowed = new Set(['contact_click', 'brief_prepared', 'case_preview_open', 'case_full_open']);
  var production = /^(www\.)?loops\.uz$/.test(location.hostname);
  if (production) {
    window.datafast = window.datafast || function () { (window.datafast.q = window.datafast.q || []).push(arguments); };
  }
  window.loopsTrack = function (name, caseId) {
    if (!allowed.has(name)) return;
    var params = {page: location.pathname};
    if (typeof caseId === 'string' && /^[a-z0-9-]{1,64}$/.test(caseId)) params.case_id = caseId;
    // Local QA can observe exactly what would be sent, without contacting analytics.
    window.dispatchEvent(new CustomEvent('loops:interaction', {detail: {name: name, params: params}}));
    if (!production) return;
    try { if (typeof window.ym === 'function') window.ym(101239870, 'reachGoal', name, params); } catch (_) {}
    try { if (typeof window.datafast === 'function') window.datafast(name, params); } catch (_) {}
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
})();
