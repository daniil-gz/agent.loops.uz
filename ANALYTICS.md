# Website interaction measurement

`site-events-v2.js` is shared by all sitemap pages. It sends goals to Metrika 101239870 (reachGoal) and Google Analytics 4 G-BCDRRJZBWF (gtag event). DataFast removed 2026-11-06 (owner).

| Goal | Meaning |
|---|---|
| contact_click | Click on the personal Telegram link; NOT a received lead |
| lead_sent | Homepage form delivered to /api/lead (worker answered ok) — a real lead in Telegram |
| brief_prepared | Form could not be sent; fallback brief shown with a Telegram button |
| case_preview_open | Preview opened through normal homepage/service click |
| case_full_open | Click that navigates to a full case, including modified clicks |
| audit_link | Click on «Бесплатный разбор рекламы» on a service page |

Only pathname and validated case slug are custom parameters. No form values, Telegram query text, phone, email or financial values. Localhost custom goals never transmit; `loops:interaction` is a local QA event. Production analytics can be blocked by the visitor and are not a delivery guarantee.

The owner chose to keep the existing Metrika automatic goals on 2026-09-27. Do not create additional manual goals. Existing custom event calls remain in code, but should not be represented as configured/received Metrika goals without account readback. GA4 records events automatically. Verify received events in both accounts before using the funnel for decisions. Existing automatic link/page tracking configuration is unchanged.

Sources: https://yandex.ru/support/metrica/ru/objects/reachgoal and https://developers.google.com/analytics/devguides/collection/ga4/events

Canonical routing: `scripts/canonical-host.py` backs up and tests only the Loops nginx virtual host. Requires Cloudflare SSL Full or Strict; the HTTP visitor protocol is supplied by Cloudflare. Public canonical is https://loops.uz/. 308 preserves request method, path and query.

Local preview: Metrika script/init are disabled outside loops.uz and www.loops.uz in generated marketing, case and editorial pages. GA4 tag loads only on loops.uz and www.loops.uz too. Tag snippet: `src/analytics.html` (marketing, editorial) and `scripts/build-cases.py` YM (cases).
