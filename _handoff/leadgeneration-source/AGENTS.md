# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Approved polish direction — 2026-09-08
Preserve the approved paper/ink landing, typography, section order and subtle motion. User likes yellow handwritten accents, but each must attach to its actual text/photo/button with responsive local coordinates. Use separate underline, oval and short curved-arrow assets. Replace compass/sail imagery with money-themed collage; working choice Franklin and dollars unless user steers toward Scrooge/Mr Krabs. All directions must have consistent logo slots, header heights and row rhythm. Use real verified client logos; do not invent missing marks.


## Hero and logos follow-up — 2026-09-08
Restore the original large yellow loop, anchored to the hero statement rather than viewport coordinates. Raise the complete statement including handwritten note to reduce empty space. Client strip moves continuously, pauses on interaction and exposes original colors on click; project logos and case imagery reveal original colors on hover. Preserve reduced-motion behavior. Replace lower money collage with the user-supplied pixel-art Mr Krabs, mirrored horizontally through CSS; preserve the supplied artwork.

## Unified logo presentation — 2026-09-08
User provided Traffic Legal, DM Energy, InterCargo, Burger & Lounge and Pervaya Chaynaya. Preserve original brand artwork and original interaction colors. All project and strip logos share the same frame, radius, border and neutral default palette. Compensate source canvas whitespace through src/logos.json and LogoArt; do not redraw brands. Corpus: 43 of 44 project assignments (41 unique marks); only Корпорация волшебства remains unprovided, with parent Resto still used for Resto Kids.

## Confirmed feedback scope — 2026-09-14
Use the updated leadgeneration design as the source of truth. Old pages are only sources for video functionality and social URLs; do not carry over their visual system or claims. “Fix copy” means resolve text/image collisions, not rewrite wording. New supplied avatar is for the hero. Preserve existing cases/covers and service destinations: selection and other-page work are deferred. Add supplied Korporatsiya Volshebstva logo in the shared frame. Process video: Q-RmwcYpya0, responsive click-to-play with native controls and YouTube fallback. Socials in about: Telegram/Instagram/YouTube/Threads from the old homepage; remove “Больше обо мне” link.

Latest hero decision (2026-09-14): remove Benjamin Franklin entirely; keep only the supplied mirrored Mr Krabs as the hero decorative character.

## Case system — 2026-09-14
User moved on to unifying cases and gradually migrating old case/article designs. Implement one common structured case format, with first example NWL at its existing /cases/case-nwl/ URL. Existing project rows now link to a real case using explicit fourth tuple field caseId; never infer case identity from shared logoId. Projects without a written case retain normal logo interaction, no fabricated placeholder case. Top case cards open full pages directly. Source format and migration workflow: /cases/FORMAT.md; structured content under /cases/_content, generated with scripts/build-cases.py. New design remains the reference. Articles will share visual primitives but have a separate editorial schema. Preserve existing URLs during gradual migration.

## Corrected case interaction and layout — 2026-09-14
User explicitly requires two steps: clicking a project/card opens its preview; only the preview CTA opens the full case. This supersedes the previous direct-navigation decision. Keep real hrefs for modified clicks/fallback, intercept ordinary clicks with CasePreview native dialog. Full case: shared heading/content grid, aligned metric labels and work-card title/body rows independent of copy length, natural height growth without clipping. Add factual infographics that explain the case (process route and numerical funnel), no invented proof or numbers. Tablet reading layout stacks at 900px to avoid breaking long Russian words.

NWL cover follow-up: user supplied nwl-warehouse-2026.png (681x900) and asked to replace cover while preserving existing overlays. Use it in curated rail, preview, full case and legacy card registry. Preserve original file; full case coverRatio681/900, mobile preview poster height300/top alignment preserves embedded headline.

## ILVI pilot — 2026-09-14
ILVI is the first newly written v2 case, pinned first in the curated rail and added to Products/Retail projects. Preserve preview → full case. User supplied ILVI.png cover; web encoding keeps artwork intact, portrait preview and full case show it completely. Card values: $120 тыс. revenue and $5 тыс. ad spend, no plus sign, labeled rounded. Exact owner-confirmed totals $118,758/$5,728 drive ROAS 20.73 (not 24 or former 29). Never publish monthly results, best months or internal scoring thresholds. No duplicate Meta extraction: consult cached Adstat sources for future case work, with bounded reads only. Other cases remain deferred.
