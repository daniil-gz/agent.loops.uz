# Design QA — clinic ads landing

## Evidence

- Source visual truth: `/Users/daniilgazizov/.codex/generated_images/01a03d66-c1b1-7452-84f4-5f8784f2fd5f/exec-59c0f5cb-306a-4087-82fc-cf7f1cac6b58.png`
- Source pixels: `853 × 1844`. The source is a tall concept board rather than a browser capture, so it is used as the art-direction and hero-composition target.
- Browser-rendered implementation: `http://127.0.0.1:8765/clinic-ads/`
- Mobile implementation screenshot: `_handoff/clinic-ads/mobile-top-pass-2.png`
- Desktop implementation screenshot: `_handoff/clinic-ads/desktop-top.png`
- Mobile viewport and implementation pixels: `390 × 844` CSS px and `390 × 844` screenshot pixels.
- Desktop viewport and implementation pixels: `1440 × 900` CSS px and `1440 × 900` screenshot pixels.
- Density normalization: the source was scaled proportionally to 390 px width for the comparison board; no browser or device frame was included.
- State: initial hero after entry animation; mobile sticky CTA hidden while the hero CTA is visible.
- Full-view comparison: `_handoff/clinic-ads/comparison-pass-2.jpg`
- Focused evidence: `_handoff/clinic-ads/mobile-metrics.png`, `_handoff/clinic-ads/mobile-roi.png`, `_handoff/clinic-ads/mobile-offer.png`, `_handoff/clinic-ads/mobile-faq-open.png`.

## Required fidelity surfaces

- Fonts and typography: Oswald reproduces the condensed uppercase display treatment; Manrope preserves the existing Loops body system. Weight, line height, wrapping, and hierarchy remain readable at 390 px.
- Spacing and layout rhythm: mobile gutters are 18 px, controls meet touch-size expectations, cards and section spacing are consistent. Desktop layout has no horizontal overflow at 1440 px.
- Colors and visual tokens: black, ivory, and restrained gold match the selected direction. Contrast remains strong across body copy and controls.
- Image quality and asset fidelity: a dedicated 1800 × 1126 generated clinic-reception photograph is used, compressed to a 361 KB JPEG. The subject, warm lighting, and black/gold art direction match the reference; no placeholder imagery or code-drawn asset substitutes remain.
- Copy and content: the approved clinic promise, accumulated performance metrics, two current clinic projects, monthly prices, separate Meta budget, free diagnostic, and Telegram-bot path are present.

## Comparison history

### Pass 1

- [P2] The fixed mobile CTA duplicated the main CTA in the initial hero viewport.
  - Fix: the sticky CTA now starts hidden, appears only after the hero leaves view, and hides again when the final diagnostic section is visible.
  - Post-fix evidence: `_handoff/clinic-ads/mobile-top-pass-2.png`.

### Pass 2

- No actionable P0/P1/P2 differences remain.
- The source concept places more proof content into the same tall board. The implementation intentionally treats that board as art direction, keeps the first mobile viewport legible, and presents the animated proof immediately on the next scroll. This is an acceptable conversion/readability constraint rather than unresolved drift.

## Interaction and technical checks

- Hero, pricing, diagnostic, and sticky CTA links resolve to the Telegram bot with source-specific `start` parameters.
- Logo resolves to `/`; service and case links resolve to `/target/` and `/cases.html`.
- Animated counters reached `1 000`, `250`, `200`, and `7` once the proof section entered view.
- FAQ disclosure opened and exposed its answer.
- Mobile and desktop screenshots were captured in the in-app browser.
- Browser console errors: none.
- Broken images: none.
- Empty links: none.
- Mobile horizontal overflow: none (`390 = 390`).

## Follow-up polish

- [P3] Replace the temporary bot username if the final scoring bot receives a different public handle.

final result: passed
