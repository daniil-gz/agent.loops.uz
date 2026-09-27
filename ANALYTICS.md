# Website interaction measurement

`site-events-v1.js` is shared by all sitemap pages. It uses existing Metrika 101239870 and DataFast configuration.

| Goal | Meaning |
|---|---|
| contact_click | Click on the personal Telegram link; NOT a received lead |
| brief_prepared | Valid local brief prepared; NOT submitted to a backend |
| case_preview_open | Preview opened through normal homepage/service click |
| case_full_open | Click that navigates to a full case, including modified clicks |

Only pathname and validated case slug are custom parameters. No form values, Telegram query text, phone, email or financial values. Localhost custom goals never transmit; `loops:interaction` is a local QA event. Production analytics can be blocked by the visitor and are not a delivery guarantee.

Metrika requires matching JavaScript-event goals in the account. Account setup/readback is separate from deploying event calls. DataFast records custom goals automatically after genuine interactions. Verify received events in both accounts before using the funnel for decisions. Existing automatic link/page tracking configuration is unchanged.

Sources: https://yandex.ru/support/metrica/ru/objects/reachgoal and https://datafa.st/docs/custom-goals

Canonical routing: `scripts/canonical-host.py` backs up and tests only the Loops nginx virtual host. Requires Cloudflare SSL Full or Strict; the HTTP visitor protocol is supplied by Cloudflare. Public canonical is https://loops.uz/. 308 preserves request method, path and query.
