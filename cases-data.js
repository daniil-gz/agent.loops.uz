/* ===========================================================
   Loops — shared case data + unified card renderer
   Used by both index.html (preview) and cases.html (full list)
   =========================================================== */
(function () {
  // niche line-icons (drawn-in on reveal, gold)
  var ICON = {
    box:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M3 7.5 12 3l9 4.5-9 4.5z"/><path pathLength="1" d="M3 7.5V16l9 4.5 9-4.5V7.5"/><path pathLength="1" d="M12 12v8.5"/></svg>',
    car:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M3.5 13l2-5.5h13l2 5.5"/><path pathLength="1" d="M3 13h18v4.5H3z"/><path pathLength="1" d="M6.5 17.5v1.5M17.5 17.5v1.5"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M12 20S4.5 15.5 4.5 10.2A3.7 3.7 0 0 1 12 7.3a3.7 3.7 0 0 1 7.5 2.9C19.5 15.5 12 20 12 20Z"/></svg>',
    factory:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M3 21V10l5.5 3.5V10l5.5 3.5V6.5L20.5 9.5V21z"/><path pathLength="1" d="M3 21h18"/></svg>',
    truck:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M2.5 6.5h11.5v9.5H2.5z"/><path pathLength="1" d="M14 9.5h4l3.5 3.5V16H14z"/><path pathLength="1" d="M6.5 16.5v1.5M17 16.5v1.5"/></svg>'
  };

  window.LOOPS_CASES = [
    {
      id: "tak",
      img: "tak-card.png",
      client: "TAK Fulfillment",
      cat: "E-comm логистика",
      niche: ICON.box,
      metric: "2 831",
      unit: "диалога в месяц с потенциальными клиентами",
      tags: ["500 квал. лидов", "$4.8 за лид", "75% конверсия"],
      note: "Поток заявок вырос в&nbsp;<b>3 раза</b> — без новых сотрудников."
    },
    {
      id: "chery",
      img: "chery-main.png",
      client: "Chery",
      cat: "Автобизнес",
      niche: ICON.car,
      metric: "$15 → $4.5",
      unit: "цена лида — в 3 раза дешевле",
      tags: ["450+ заявок в месяц"],
      note: ""
    },
    {
      id: "viamed",
      img: "viamed-card.png",
      client: "ViaMed",
      cat: "Клиника",
      niche: ICON.heart,
      metric: "150",
      unit: "пациентов за месяц при бюджете $500",
      tags: ["$3.3 за пациента"],
      note: "Воронка: <b>1000+ заявок → 320 лидов → 150 пациентов.</b>"
    },
    {
      id: "basalt",
      img: "basalt-main.png",
      client: "Basalt",
      cat: "Производство · B2B",
      niche: ICON.factory,
      metric: "3 млрд сум",
      unit: "сделка, пришедшая через LinkedIn",
      tags: ["4+ встречи в месяц", "2500+ карточек на маркетплейсах"],
      note: ""
    },
    {
      id: "nwl",
      img: "nwl-card.png",
      client: "NWL",
      cat: "3PL-логистика",
      niche: ICON.truck,
      metric: "88",
      unit: "целевых B2B-лидов по $21",
      tags: ["70% в квалификацию"],
      note: "Было: <b>1000 заявок → 3 продажи.</b>"
    }
  ];

  var ARROW =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Build one unified case card. opts:
  //   href     — link target ("{id}" is replaced with the case id)
  //   goLabel  — footer link label
  window.caseCardHTML = function (c, opts) {
    opts = opts || {};
    var href = (opts.href || "cases.html#case-{id}").replace("{id}", c.id);
    var goLabel = opts.goLabel || "Смотреть кейс";
    var tags = (c.tags || [])
      .map(function (t) { return '<span class="case-tag">' + t + "</span>"; })
      .join("");
    var note = c.note ? '<p class="case-note">' + c.note + "</p>" : "";
    return (
      '<div class="card hoverable case-card reveal" id="case-' + c.id + '">' +
        '<div class="case-photo">' +
          '<img class="case-img" src="images/' + c.img + '" alt="' + c.client + '" loading="lazy" />' +
          '<span class="case-niche">' + (c.niche || "") + c.cat + "</span>" +
        "</div>" +
        '<div class="case-body">' +
          '<span class="case-client">' + c.client + "</span>" +
          '<div class="case-metric"><span class="case-num">' + c.metric +
            '<span class="unit">' + c.unit + "</span></span></div>" +
          '<div class="case-tags">' + tags + "</div>" +
          note +
          '<a class="case-go" href="' + href + '">' + goLabel + ARROW + "</a>" +
        "</div>" +
      "</div>"
    );
  };

  // Render all cases into a container.
  window.renderCases = function (container, opts) {
    if (!container) return;
    container.innerHTML = window.LOOPS_CASES
      .map(function (c) { return window.caseCardHTML(c, opts); })
      .join("");
  };
})();
