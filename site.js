/* ===========================================================
   Loops — shared site behaviour
   Safe reveal (never hides content permanently), cursor
   spotlight, sticky-header state, photo fallback, lead form.
   Loaded at end of <body>, after any case cards are rendered.
   =========================================================== */
(function () {
  var motionOK = true;
  try {
    motionOK = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  } catch (e) {}

  /* ---- sticky header shadow ---- */
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- reveal on scroll (safe: content visible unless .anim is on <html>) ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var animOn = document.documentElement.classList.contains("anim");
  if (animOn && reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 3, 2) * 70 + "ms";
      io.observe(el);
    });
    // failsafe: whatever happens, never leave content hidden
    window.addEventListener("load", function () {
      setTimeout(function () {
        reveals.forEach(function (el) { el.classList.add("in"); });
      }, 1100);
    });
  } else {
    // animation disabled — make sure everything is visible
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- cursor-following gold spotlight on cards ---- */
  if (motionOK) {
    var raf = null;
    var pending = null;
    window.addEventListener(
      "pointermove",
      function (e) {
        var card = e.target.closest && e.target.closest(".card.hoverable, .case-card");
        if (!card) return;
        pending = { card: card, x: e.clientX, y: e.clientY };
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          if (!pending) return;
          var r = pending.card.getBoundingClientRect();
          pending.card.style.setProperty("--mx", ((pending.x - r.left) / r.width) * 100 + "%");
          pending.card.style.setProperty("--my", ((pending.y - r.top) / r.height) * 100 + "%");
        });
      },
      { passive: true }
    );
  }

  /* ---- hero photo fallback ---- */
  Array.prototype.slice.call(document.querySelectorAll(".hero-photo")).forEach(function (hp) {
    var img = hp.querySelector(".ph-img");
    if (!img) return;
    var miss = function () { hp.classList.add("no-img"); };
    if (img.complete && img.naturalWidth === 0) miss();
    img.addEventListener("error", miss);
  });

  /* ---- lead form → Telegram (via edge Worker at /api/lead) ---- */
  var form = document.getElementById("leadForm");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = form.name.value.trim();
      var contact = form.contact.value.trim();
      var company = form.company ? form.company.value.trim() : "";
      if (!name || !contact) {
        (!name ? form.name : form.contact).focus();
        return;
      }
      fetch('/api/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, contact: contact, source: 'loops.uz', company: company }),
        keepalive: true
      }).catch(function () {});
      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.style.display = "none";
      var note = form.querySelector(".form-note");
      if (note) note.style.display = "none";
      var ok = document.getElementById("formOk");
      if (ok) ok.style.display = "block";
    });
  }
})();
