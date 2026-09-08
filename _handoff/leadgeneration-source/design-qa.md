# Design QA — Loops /leadgeneration/

Date: 2026-09-08
final result: passed

## Visual truth and comparison

Source URL: https://targeteria.ru/
Source captures: `/Users/daniilgazizov/loops-landing-reference/targeteria/`.
User reference: `/Users/daniilgazizov/loops-landing-reference/loops-handwriting-reference.jpg` (853 × 1280).
Implementation: http://127.0.0.1:4187/leadgeneration/

Full-view source and implementation were opened together in the same tool comparison input:
- Desktop hero: source `01-desktop-top.png` and implementation `evidence/20-desktop-1280x720.png`, both 1280 × 720 pixels and CSS viewport, density 1.
- Mobile hero: source `10-mobile-top.png` and implementation `evidence/18-mobile-final.png`, both 390 × 844 pixels and CSS viewport, density 1.
- Process: source `04-process.png` (1280 × 720) and implementation `evidence/13-process.png` (1280 × 900). Compare structure/typography at the same width; differing screenshot height is explicitly not a spacing defect.
- User handwriting reference and implementation case intro were opened together. The supplied full-page image and browser section have different widths/crops; this is an art-direction comparison, not a pixel equality claim. Current post-fix case intro: `evidence/21-cases-final.png`.

Focused evidence: desktop modal `evidence/05-desktop-modal.png`, mobile modal `09-mobile-modal.png`, about `14-about.png` and `19-about-mobile.png`, contact `15-contact-desktop.png` and `17-contact-mobile.png`; later refinement widens the mobile note to keep its last line together.

## Findings and iteration history

- [P1, fixed] Fonts fell back despite the CSS family name. Root stylesheet path had a doubled Vite base. Changed index link to `/assets/fonts.css`; verified the actual requested path and visibly correct TikTok Sans/Caveat in 20/18/21.
- [P1, fixed] Initial hero compass asset showed the wrong subject. Replaced with the real compass asset from source; verified both desktop/mobile final screenshots.
- [P2, fixed] Carousel snapped the first card to the viewport edge. Added scroll-padding matching section padding. Earlier evidence 04; corrected evidence 21.
- [P2, fixed] Mobile handwritten contact note overlapped heading. Moved note into document flow and widened it. Evidence 07 before / 17 after positioning; final style also removes orphaned emoticon wrap.
- [P2, fixed] Narrow hero CTA and supporting copy could overlap. Added a 380px breakpoint; evidence 16 shows separate boxes with a visible gap at 360px.
- [P2, fixed] Rotated about portrait caused a few pixels of horizontal overflow. Reduced mobile heading size and moved note inward. Evidence 19 and document width check: 390 = 390; desktop 1280 = 1280.
- [P2, fixed] Directory small type was too small. Increased labels and descriptions. Removed fabricated initial-letter logos; only available real marks remain.
- [P2, fixed] Rail controls allowed clicks when no scrolling was possible. Added observed scroll bounds, disabled states and hidden desktop article controls. Browser readback confirms previous cases disabled / next enabled at start.
- [P2, fixed] Brief edit discarded values. Preserve submitted draft state; tested name, company and message after edit, all retained.

No actionable P0/P1/P2 findings remain for this blended test landing.

## Required fidelity surfaces

- Fonts/typography: source TikTok Sans loaded locally, Caveat for handwritten annotations. Major hierarchy and compact navigation preserved. Loops wordmark scale intentionally responds to its shorter name. Body labels, wrapping and modal metrics visually checked.
- Spacing/layout: expansive hero, horizontal cases, dense industry directory, service rows, vertical process timeline, large personal section, dark form, FAQ/articles/footer. Checks at 360, 390, 768 and 1280 CSS widths. Source four-float/magenta composition intentionally simplified into Loops portrait, two source cut-outs and yellow marker to blend user reference.
- Colors/tokens: warm paper/ink from user image; yellow replaces source magenta; subdued sage secondary text and dark contact/footer. No claim of a full WCAG audit.
- Image quality: real Loops cases/client logos/person photo; source compass/sail cut-outs; generated transparent yellow raster arrow. No invented client marks, handcrafted SVG illustrations or fake team portraits. Phosphor library supplies UI icons.
- Copy/content: Loops identity, existing case metrics with their definitions, 12 sectors from supplied screenshot; no imported Targeteria achievements or testimonials. FAQ takes the place of unverifiable third-party reviews. Specific results are not presented as guarantees.

## Interaction verification

- Header anchors, mobile menu open/close, menu closes on selection, Escape.
- B2B filter returns TAK/NWL/BTS; Education returns useful empty state; reset returns all nine cases.
- Case rail arrows scroll, boundaries disabled; case modals open, close button/Escape, focus returned, Tab trapped.
- Sector expansion works, direction CTA applies filter.
- Required form fields block empty submission. Populated form prepares brief. Edit preserves values. Encoded Telegram URL includes the prepared text; no real message sent.
- FAQ expands/collapses. Article links and existing-case links present.
- Browser image check: no completed broken images. Earlier console error check: none. Fresh public route remains a separate deployment verification.
- Reduced-motion CSS and scroll helper reviewed; native device motion/Telegram-app handoff not independently exercised.

## Implementation checklist

- [x] Fix observed issues and compare final hero captures at matching desktop/mobile viewports.
- [x] Verify core interactive states in browser.
- [x] Build succeeds; 4/4 template packaging tests pass.
- [x] Prepare isolated route and reproducible sources.
- [ ] Verify deployed route, asset hashes and fresh public browser state (record in deployment.md).

P3 future polish: more unique portrait/process imagery; dedicated share cover and SEO rendering when the test design becomes a search landing. These are outside the visual test acceptance.
