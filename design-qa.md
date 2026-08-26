# Design QA — clinic ads landing

## Evidence

- Primary source visual: `/Users/daniilgazizov/.codex/generated_images/01a03d66-c1b1-7452-84f4-5f8784f2fd5f/exec-59c0f5cb-306a-4087-82fc-cf7f1cac6b58.png` (`853 × 1844`).
- Pricing reference: `https://potapovfx.com/`, captured at `_handoff/clinic-ads-audit2/04-potapov-price.png`.
- Implementation: `http://127.0.0.1:8765/clinic-ads/`.
- Mobile viewport: `390 × 844` CSS px; screenshot `_handoff/clinic-ads-audit2/05-revised-hero.png`.
- Desktop viewport: `1280 × 720` CSS px; screenshot `_handoff/clinic-ads-audit2/08-revised-desktop-hero.png`.
- Revised pricing evidence: `_handoff/clinic-ads-audit2/07-revised-plan-action.png` and `_handoff/clinic-ads-audit2/10-revised-desktop-plan-actions.png`.
- Normalized comparisons: `_handoff/clinic-ads-audit2/11-hero-comparison.jpg` and `_handoff/clinic-ads-audit2/12-pricing-comparison.jpg`.
- State: entry animation complete; counters tested after entering viewport; mobile sticky CTA hidden while the hero CTA is visible.

## Required fidelity surfaces

- Fonts and typography: every rendered element uses `Manrope, sans-serif`. Display hierarchy comes from weights 400–800, scale, line height, and tracking rather than a second font. Mobile and desktop headings retain the black/gold reference character.
- Spacing and layout rhythm: header, hero, every section, cards, pricing, diagnostic, FAQ, and footer share one container. Left edge is exactly `18 px` at `390 px` and `80 px` at `1280 px`. Plan cards are equal at `552 × 516 px` on desktop; price/action bands are both `72 px` high.
- Colors and visual tokens: black, ivory, and restrained gold match the selected direction. The pricing band borrows the reference’s gold-action/white-price contrast without copying its discount device.
- Image quality and asset fidelity: dedicated `1800 × 1126` clinic-reception photograph, compressed to a `361 KB` JPEG, with the approved warm black/gold art direction.
- Copy and content: approved clinic promise, metrics, two clinic projects, monthly prices, separate Meta budget, diagnostic, and Telegram route are preserved.

## Comparison history

### Initial build

- [P2] Sticky mobile CTA duplicated the hero CTA on load.
  - Fixed by hiding it while the hero or final diagnostic CTA is visible.

### Typography and pricing revision

- [P2] Mixed Oswald and Manrope made headings and body feel like two systems.
  - Fixed by removing Oswald and using Manrope weights and optical spacing everywhere.
- [P2] Header and footer did not share the exact section grid.
  - Fixed by applying the same `1120 px` shell and responsive gutters to all regions.
- [P2] Pricing cards buried the price below a long feature list and did not use the reference’s strongest price treatment.
  - Fixed with a single action/price band on both plans, equal card heights, clearer plan summaries, and an explicit Meta-budget panel.
- [P1] The first desktop font pass pushed the hero CTA below a `1280 × 720` viewport.
  - Fixed by tuning the desktop hero to a `720 px` composition and reducing display scale while keeping the selected hierarchy.
- [P2] Tight headline tracking visually collapsed the space in `Без пустых` on mobile.
  - Fixed with explicit line grouping and word spacing.

## Interaction and technical checks

- All CTA links resolve to the Telegram bot with source-specific `start` parameters.
- Logo, service, and case links resolve correctly.
- Animated counters reach `1 000`, `250`, `200`, and `7`.
- FAQ disclosure opens and shows its answer.
- Browser console errors: none.
- Broken images: none.
- Empty links: none.
- Horizontal overflow: none at `390 px` or `1280 px`.
- Accessibility limit: screenshots and DOM checks confirm hierarchy, focus styling, contrast, and touch sizing, but do not establish full WCAG compliance.

final result: passed
