# ILVI QA — 2026-09-14
- Source content: cases/_content/ilvi.json. Cover: user-supplied ILVI.png, resized/encoded as JPEG, artwork preserved. Official logo from ilvi.com/wholesales.
- 13 renderer tests pass: exact ROAS computation independent of display rounding, invalid denominator rejection, duplicate market rejection, existing funnel/escaping/editorial privacy tests.
- Vite production build passes. Dry-run: exactly 11 public files, removes only two superseded bundles. Other full case HTML pages unchanged.
- Browser local: first curated card ILVI; top card and lower project open native preview; close/reopen and full-case CTA verified. Official logo loaded and aligned in shared slot.
- Full page at 1280, 390 and 320 px: document scroll width equals viewport. Modules and headings do not overflow. CTA background intentionally extends into gutter. No clipped paragraphs.
- Visual review: desktop hero, geography, result; mobile result, project logo and preview. Evidence screenshots alongside this file. Mobile full screenshot precedes non-breaking spaces in exact totals; layout otherwise unchanged.
- Monthly results, best months and private scoring thresholds not in public output. Rounded $120 тыс. / $5 тыс. labels explicit, no plus. Full methodology and return infographic show exact totals, ROAS20.73. No Meta API calls in implementation.
