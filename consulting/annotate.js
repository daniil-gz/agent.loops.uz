/* ============================================================
   LAB Annotate — клик по элементу → метка + комментарий.
   Dev-only. Сохраняет в localStorage + POST /feedback (сервер
   пишет .lab-feedback.json, который читает Claude).
   ============================================================ */
(function () {
  "use strict";
  // dev-only: never активируется на проде
  if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
  var LS_KEY = "loops_lab_annotations_v1";
  var notes = [];
  var mode = false;
  var hovered = null;

  try { notes = JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch (e) { notes = []; }

  /* ---------- styles ---------- */
  var css = document.createElement("style");
  css.textContent = [
    "#annUI,#annUI *{box-sizing:border-box;font-family:Manrope,system-ui,sans-serif}",
    "#annBar{position:fixed;right:18px;bottom:18px;z-index:2147483600;display:flex;flex-direction:column;gap:8px;align-items:flex-end}",
    "#annBar .row{display:flex;gap:8px}",
    ".annBtn{cursor:pointer;border:none;border-radius:11px;padding:11px 15px;font-weight:800;font-size:13.5px;letter-spacing:-.01em;box-shadow:0 8px 28px rgba(0,0,0,.45)}",
    ".annBtn.main{background:#f3c866;color:#1a1408}",
    ".annBtn.main.on{background:#ff5a4d;color:#fff}",
    ".annBtn.sub{background:#1a1a18;color:#f3f2ec;border:1px solid rgba(245,243,235,.18);font-size:12.5px;padding:9px 12px}",
    ".annBtn.sub:hover{border-color:#f3c866;color:#f3c866}",
    "#annCount{background:#0e0e0d;border:1px solid rgba(245,243,235,.14);color:#f3c866;border-radius:99px;padding:6px 11px;font-size:12px;font-weight:800}",
    "#annHL{position:fixed;z-index:2147483500;pointer-events:none;border:2px solid #f3c866;border-radius:6px;background:rgba(243,200,102,.12);display:none;transition:all .05s linear}",
    ".annPin{position:absolute;z-index:2147483550;width:26px;height:26px;border-radius:50% 50% 50% 2px;background:#f3c866;color:#1a1408;font-weight:800;font-size:13px;display:grid;place-items:center;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.5);transform:translate(-50%,-100%)}",
    ".annPin:hover{transform:translate(-50%,-100%) scale(1.12)}",
    "#annPanel{position:fixed;right:18px;bottom:74px;width:340px;max-height:62vh;overflow:auto;z-index:2147483580;background:#0e0e0d;border:1px solid rgba(245,243,235,.16);border-radius:16px;padding:14px;display:none;box-shadow:0 20px 60px rgba(0,0,0,.6)}",
    "#annPanel.show{display:block}",
    "#annPanel h4{margin:0 0 10px;color:#f3f2ec;font-size:14px}",
    ".annItem{border:1px solid rgba(245,243,235,.1);border-radius:11px;padding:10px 11px;margin-bottom:8px;background:#141413}",
    ".annItem .t{display:flex;justify-content:space-between;gap:8px;align-items:center}",
    ".annItem .nn{width:20px;height:20px;border-radius:50%;background:#f3c866;color:#1a1408;font-weight:800;font-size:11px;display:grid;place-items:center;flex:none}",
    ".annItem .loc{color:#9a978e;font-size:11px;line-height:1.3;flex:1;cursor:pointer}",
    ".annItem .loc:hover{color:#f3c866}",
    ".annItem .del{cursor:pointer;color:#6c6a62;font-size:15px;border:none;background:none}",
    ".annItem .del:hover{color:#ff5a4d}",
    ".annItem .cm{color:#f3f2ec;font-size:13px;margin-top:7px;line-height:1.4;white-space:pre-wrap}",
    "#annPop{position:fixed;z-index:2147483600;background:#0e0e0d;border:1px solid #f3c866;border-radius:13px;padding:12px;width:300px;box-shadow:0 18px 50px rgba(0,0,0,.6);display:none}",
    "#annPop .loc{color:#9a978e;font-size:11px;margin-bottom:8px;line-height:1.3}",
    "#annPop textarea{width:100%;height:84px;resize:vertical;background:#141413;border:1px solid rgba(245,243,235,.18);border-radius:9px;color:#f3f2ec;padding:9px;font-size:13px;font-family:inherit}",
    "#annPop textarea:focus{outline:none;border-color:#f3c866}",
    "#annPop .pa{display:flex;gap:8px;margin-top:9px;justify-content:flex-end}",
    "#annPop button{cursor:pointer;border:none;border-radius:9px;padding:8px 13px;font-weight:800;font-size:12.5px}",
    "#annPop .save{background:#f3c866;color:#1a1408}",
    "#annPop .cancel{background:#1a1a18;color:#9a978e}",
    "#annToast{position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:2147483600;background:#0e0e0d;border:1px solid #f3c866;color:#f3f2ec;padding:11px 18px;border-radius:12px;font-size:13.5px;font-weight:700;display:none;box-shadow:0 14px 40px rgba(0,0,0,.6)}",
    "html.ann-mode, html.ann-mode *{cursor:crosshair!important}",
    "#annUI, #annUI *{cursor:default!important}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- UI ---------- */
  var ui = document.createElement("div"); ui.id = "annUI";
  ui.innerHTML =
    '<div id="annHL"></div>' +
    '<div id="annBar">' +
      '<div id="annCount">0 заметок</div>' +
      '<div class="row">' +
        '<button class="annBtn sub" id="annList">Список</button>' +
        '<button class="annBtn sub" id="annClear">Очистить</button>' +
        '<button class="annBtn sub" id="annSend">💾 Отправить</button>' +
        '<button class="annBtn main" id="annToggle">✏️ Разметка</button>' +
      '</div>' +
    '</div>' +
    '<div id="annPanel"><h4>Заметки</h4><div id="annItems"></div></div>' +
    '<div id="annPop"><div class="loc"></div><textarea placeholder="Комментарий к элементу…"></textarea><div class="pa"><button class="cancel">Отмена</button><button class="save">Добавить</button></div></div>' +
    '<div id="annToast"></div>';
  document.body.appendChild(ui);

  var hl = ui.querySelector("#annHL");
  var pop = ui.querySelector("#annPop");
  var popTa = pop.querySelector("textarea");
  var popLoc = pop.querySelector(".loc");
  var panel = ui.querySelector("#annPanel");
  var items = ui.querySelector("#annItems");
  var countEl = ui.querySelector("#annCount");
  var toggleBtn = ui.querySelector("#annToggle");
  var pendingTarget = null;
  var pins = [];

  /* ---------- helpers ---------- */
  function isUI(el) { return el && el.closest && el.closest("#annUI"); }

  function selectorOf(el) {
    if (!el || el === document.body) return "body";
    var path = [];
    while (el && el.nodeType === 1 && el !== document.body && path.length < 6) {
      var part = el.tagName.toLowerCase();
      if (el.id) { part += "#" + el.id; path.unshift(part); break; }
      var par = el.parentNode;
      if (par) {
        var sibs = Array.prototype.filter.call(par.children, function (c) { return c.tagName === el.tagName; });
        if (sibs.length > 1) part += ":nth-of-type(" + (sibs.indexOf(el) + 1) + ")";
      }
      path.unshift(part);
      el = el.parentNode;
    }
    return path.join(" > ");
  }

  function describe(el) {
    var sec = el.closest ? el.closest("section,header,footer") : null;
    var secName = "";
    if (sec) {
      secName = sec.getAttribute("aria-label") || sec.id || "";
      if (!secName) { var h = sec.querySelector("h1,h2,h3"); if (h) secName = h.textContent.trim().slice(0, 30); }
    }
    var tag = el.tagName.toLowerCase();
    var snippet = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50);
    var cls = (el.className && typeof el.className === "string") ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    return (secName ? "[" + secName + "] " : "") + tag + cls + (snippet ? " — “" + snippet + "”" : "");
  }

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(notes)); } catch (e) {}
    render();
  }

  function render() {
    countEl.textContent = notes.length + (notes.length === 1 ? " заметка" : " заметок");
    // pins
    pins.forEach(function (p) { p.remove(); });
    pins = [];
    items.innerHTML = "";
    notes.forEach(function (n, i) {
      n.n = i + 1;
      // pin
      var target = null;
      try { target = document.querySelector(n.sel); } catch (e) {}
      if (target) {
        var r = target.getBoundingClientRect();
        var pin = document.createElement("div");
        pin.className = "annPin";
        pin.textContent = n.n;
        pin.style.left = (r.left + window.scrollX + 14) + "px";
        pin.style.top = (r.top + window.scrollY + 4) + "px";
        pin.title = n.text;
        pin.onclick = function () { panel.classList.add("show"); var it = document.getElementById("annItem" + n.id); if (it) it.scrollIntoView({ block: "center" }); };
        ui.appendChild(pin); pins.push(pin);
      }
      // list item
      var div = document.createElement("div");
      div.className = "annItem"; div.id = "annItem" + n.id;
      div.innerHTML =
        '<div class="t"><span class="nn">' + n.n + '</span><span class="loc">' + escapeHtml(n.loc) + '</span><button class="del">✕</button></div>' +
        '<div class="cm">' + escapeHtml(n.text) + '</div>';
      div.querySelector(".del").onclick = function () { notes = notes.filter(function (x) { return x.id !== n.id; }); save(); };
      div.querySelector(".loc").onclick = function () { var t = null; try { t = document.querySelector(n.sel); } catch (e) {} if (t) t.scrollIntoView({ behavior: "smooth", block: "center" }); };
      items.appendChild(div);
    });
  }

  function escapeHtml(s) { return (s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function toast(msg) {
    var t = ui.querySelector("#annToast"); t.textContent = msg; t.style.display = "block";
    clearTimeout(t._tm); t._tm = setTimeout(function () { t.style.display = "none"; }, 2600);
  }

  /* ---------- mode ---------- */
  function setMode(on) {
    mode = on;
    document.documentElement.classList.toggle("ann-mode", on);
    toggleBtn.classList.toggle("on", on);
    toggleBtn.textContent = on ? "✓ Готово" : "✏️ Разметка";
    hl.style.display = "none";
    if (on) toast("Кликай по элементам и пиши комментарии");
  }

  document.addEventListener("mousemove", function (e) {
    if (!mode) return;
    var el = e.target;
    if (isUI(el)) { hl.style.display = "none"; return; }
    hovered = el;
    var r = el.getBoundingClientRect();
    hl.style.display = "block";
    hl.style.left = r.left + "px"; hl.style.top = r.top + "px";
    hl.style.width = r.width + "px"; hl.style.height = r.height + "px";
  }, true);

  document.addEventListener("click", function (e) {
    if (!mode) return;
    if (isUI(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    pendingTarget = e.target;
    popLoc.textContent = describe(e.target);
    popTa.value = "";
    pop.style.display = "block";
    var px = Math.min(e.clientX, window.innerWidth - 320);
    var py = Math.min(e.clientY, window.innerHeight - 200);
    pop.style.left = px + "px"; pop.style.top = py + "px";
    setTimeout(function () { popTa.focus(); }, 30);
  }, true);

  pop.querySelector(".cancel").onclick = function () { pop.style.display = "none"; pendingTarget = null; };
  pop.querySelector(".save").onclick = addNote;
  popTa.addEventListener("keydown", function (e) { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote(); });

  function addNote() {
    if (!pendingTarget) return;
    var txt = popTa.value.trim();
    if (!txt) { popTa.focus(); return; }
    notes.push({
      id: Date.now() + "" + Math.floor(performance.now()),
      sel: selectorOf(pendingTarget),
      loc: describe(pendingTarget),
      text: txt
    });
    pop.style.display = "none"; pendingTarget = null;
    save();
    panel.classList.add("show");
  }

  /* ---------- buttons ---------- */
  toggleBtn.onclick = function () { setMode(!mode); };
  ui.querySelector("#annList").onclick = function () { panel.classList.toggle("show"); };
  ui.querySelector("#annClear").onclick = function () {
    if (!notes.length) return;
    if (confirm("Удалить все заметки (" + notes.length + ")?")) { notes = []; save(); }
  };
  ui.querySelector("#annSend").onclick = function () {
    if (!notes.length) { toast("Заметок пока нет"); return; }
    var payload = {
      page: location.pathname,
      ts: new Date().toString(),
      count: notes.length,
      notes: notes.map(function (n, i) { return { n: i + 1, where: n.loc, selector: n.sel, comment: n.text }; })
    };
    fetch("/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (j) { toast(j.ok ? "✓ Отправлено Claude (" + notes.length + ")" : "Ошибка сохранения"); })
      .catch(function () {
        // fallback: copy to clipboard
        navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        toast("Сервер не принял — скопировал в буфер, вставь Claude");
      });
  };

  window.addEventListener("scroll", function () { if (notes.length) render(); }, { passive: true });
  window.addEventListener("resize", function () { if (notes.length) render(); });

  render();
  console.log("[LAB annotate] готово. Нажми «✏️ Разметка».");
})();
