# Logo system QA — 2026-09-08

final result: passed

## Visual target and comparison

The source is the approved live Loops landing captured in evidence/polish-v4/02-before-grid.png, plus the five original client logos supplied by Daniil (exact filenames in logos-inventory.json). This is a scoped update: add those marks and make every logo frame, default palette, radius and spacing consistent. Preserve typography, content, hero and interaction behavior.

Full-view comparison: 02-before-grid.png and 10-compiled-desktop.png were opened together. Both are 1280 × 1000 pixels at a 1280 × 1000 CSS viewport, density 1; no density scaling. State: all sectors collapsed, default monochrome logos. Section heading aligned near y=42; minor capture offset was aligned in the focused comparison. Focused evidence: 12-focused-comparison.png contains the same first two cards from both captures side by side, at native scale. New color states: 05-new-logos-color.png and 06-lower-color.png. Browser-compiled hover evidence: 11-hover-color.png.

## Findings and iteration history

- [P2, resolved] Source: mixed logo canvases, unframed artwork and inconsistent dark/colored square backgrounds; five missing supplied logos. Implemented shared LogoArt and .logo-frame, with a per-source crop of external empty canvas only. All five supplied files are preserved byte for byte.
- [P2, resolved] First implementation 03-grid-first.png left a dark rectangle behind Dental’s Kingdom in monochrome. Changed its source-specific CSS luminance filter. 04-desktop-final.png and the final compiled 10-compiled-desktop.png show the actual crest on the same light frame as the others. The final focused comparison confirms the fix.
- No actionable P0/P1/P2 issues in the final comparison.

## Required fidelity surfaces

- Fonts/typography: approved font families, weights and hierarchy preserved. Labels remain readable, aligned and unclipped at desktop, tablet and phone widths. Source small logo lettering remains part of the original artwork; readable project names are provided beside each mark.
- Spacing/layout rhythm: common 48 × 48 desktop frames, 40 × 40 phone frames; radius 8, border 1; equal columns and row cadence. Directory keeps 4 / 3 / 2 columns. Source fields are compensated without stretching the mark.
- Colors/tokens: uniform neutral default background #f4f5ef and border #e3e5dc. Original colors restore on the existing interactions, with native dark/light backing where the source requires it. The strip uses the same tokens.
- Image quality/asset fidelity: actual supplied Traffic Legal, DM Energy, InterCargo, Burger & Lounge and Pervaya Chaynaya; no redraws or generated brand marks. Existing verified artwork retained. No broken images observed. Public files explicitly 0644.
- Copy/content: all 44 projects retained. 43 logo assignments, 41 unique original files. Resto Kids continues using parent Resto. Корпорация волшебства remains without an invented logo.

## Browser validation

- Desktop 1280 × 1000: compiled Vite build, default and pointer hover; NWL shows native dark background and filter:none while aria-pressed remains false.
- Phone 390 × 844: 07-mobile-grid.png; no viewport overflow or overflowing project rows. 08-mobile-strip.png proves original-color selection and preserved hero detail.
- Tablet 768 × 1024: 09-tablet-grid.png; three columns, no clipped labels or overflowing rows.
- All five added logo buttons tested in selected color state. NWL strip selection pauses motion; resume clears selection and animation returns to running.
- prefers-reduced-motion tested: animation:none, duplicate group hidden; emulation reset afterwards.
- Expanded restaurant section shows FeedUp and all 43 available logo buttons. No broken images after expansion.
- Browser warning/error log empty. npm run build passed; git diff --check passed.

## Residual content gap

Only Корпорация волшебства has no supplied/verified original. Separate Resto Kids artwork may replace parent Resto when provided. These are source-material gaps, not invented placeholders or blockers for this scoped update.

## Published verification

Public 1280 × 1000 capture `13-live-grid.png` matches the compiled layout. All 83 shipped files return 200 and match local SHA-256. `14-live-color.png` verifies native Traffic Legal artwork and selection on the public page. Public browser has no broken images, overflow, warnings or errors. Viewport restored after QA.

## Feedback polish — 2026-09-14

Source truth: current approved leadgeneration at HEAD 8d40186, captured before edits in `evidence/polish-v5/hero-before-desktop.jpg`, `hero-before-mobile.jpg`, `process-before-desktop.jpg`; user's annotated screenshots and explicit follow-up corrections. Old /target and homepage used only for video/social references.

Full-view side-by-side evidence (before left, after right): `evidence/polish-v5/hero-desktop-comparison.jpg` (2560×720 from 1280×720 CSS captures), `hero-mobile-comparison.jpg` (780×844 from 390×844), `process-desktop-comparison.jpg` (2560×720). DPR 1; comparisons inspected together. Native-size captures also inspected for small labels, avatar, logo and social controls. Desktop comparison viewer downscaled to 2048 wide; native source captures used for focused details.

Iteration findings and fixes:
- P2 hero: portrait annotation overlapped photo; moved outside circular crop. Latest user-selected close-up replaces the initial supplied wide portrait. Existing copy retained.
- P2 hero: 1600-wide display placement approached/overlapped service text; moved wordmark top from 115px to 83px at >=1450. `hero-after-wide.jpg` verified clear text.
- P2 decoration: Krabs sat on arrow. Moved above it, scaled to remaining space on smaller widths. Yellow loop retained. At 320px loop crossed the final line; enlarged/shifted its vertical extent and reduced Franklin/Krabs to avoid adjacent artwork collisions.
- P2 video: old mobile CSS hid process art; explicitly reveal video before the timeline, hide only redundant sticky display label. Final `process-after-mobile.jpg` shows poster, handwritten caption and first step together.
- P2 socials: natural wrapping produced 3+1; now an even 2×2 grid, verified in `socials-after-desktop.jpg` and `socials-after-mobile.jpg`.
- Missing logo supplied: 44/44 projects, native logo and shared frame. `logo-after-mobile.jpg` verifies selected native pink color, no empty slots or broken loaded logo images.

Fidelity surfaces: existing font families, weights and hierarchy retained; existing section order, spacing and paper/ink/yellow tokens preserved apart from intentional local fixes. Original artwork used, avatar optimized to 640×640 WebP and CSS-framed. Copy unchanged except adding video/social controls and removing the deferred about-page CTA. Case data/cover selection and service links remain unchanged.

Responsive states inspected: 320×740, 390×844, 768×1024, 1280×720, 1600×900; no horizontal page overflow observed. Video poster is lazy, iframe absent before click; native button supports keyboard and passes focus to iframe. The iframe was created with correct video URL on click, but local embedded playback did not load in IAB; standalone YouTube requested sign-in to confirm non-bot. Playback/audio is an external verification gap, not claimed as passed. Direct YouTube fallback remains available, plus a loading-state fallback instead of a blank surface. No application errors/warnings in local console.

Visual final result: passed
Remaining verification: actual YouTube playback in a normal signed-in visitor browser. No unconfirmed claims about sound or full video playback.

### Final steering: remove Franklin
User explicitly requested keeping only Krabs. Removed the Franklin image element; layout and all other updates preserved. Final desktop evidence: `evidence/polish-v5/hero-final-desktop.jpg`; DOM has zero Franklin and one Krabs. This removal supersedes the earlier character composition in before/after comparisons.

### Public verification resolved video gap
The public embed loaded and played the supplied video, showing the YouTube player and current speech subtitles (“творчеством. Сначала мы проводим / глубокое интервью с вами или”). Captured `evidence/polish-v5/video-live-playing.jpg`. Earlier local blank/sign-in results remain historical observations; public playback now confirmed. Audio listening not separately assessed. Final public hero: live-final-desktop.jpg.

final result: passed

## Case system v2 — 2026-09-14
NWL first migration uses existing landing font/paper/ink/yellow system; separate static HTML at existing URL. Browser localhost:8770 verified desktop 1280 and phone 390: project row → NWL full page → anchor navigation to results/work → return to #projects. All 8 explicit project links present after expanding FeedUp; no invented Dors/BTS equivalence. All 9 top cards direct links. No horizontal overflow; directory row heights remain 56px desktop /64px mobile; native focus outlines and logo color on focus. New cover intrinsic height corrected to square desktop and 1.3 ratio mobile. Screenshots: evidence/case-system-v2/desktop-work.jpg, mobile-results.jpg, mobile-project-links.jpg. New renderer escapes text and excludes editorial fields. Six renderer tests pass; build deterministic; other 8 case pages byte-identical. No test messages sent.

## Case preview + grid polish — 2026-09-14
Local verification at 1280, 768, 390 and stress at 320. Native dialog opens from both rail and lower NWL row without navigation; CTA opens full page. Escape and close restore triggering-link focus; explicit Tab/Shift+Tab containment verified. Mobile dialog fits 390x844. Full case now has identical six heading x=80/width352 and content x=464/width736 at 1280. Work cards share heading and paragraph baseline via subgrid (different copy lengths); two cards in first row height326.19, second row300.59. Stress fixture: first paragraph x5, long/short titles, long metric label; both first-row cards height920.28, paragraph/title baselines match, no clipping. No page/content overflow at320. Initial tablet heading wrapped within a word; fixed stack breakpoint900, visually rechecked768. Funnel bar ratios 1, .19325, .13497; denominator labels 19.3%,69.8% between stages and13.5% final/all correctly separated. 10 renderer tests pass. Evidence case-polish-v3. No messages/forms submitted.

## Metadata + CTA correction — 2026-09-14
Metadata spacing reduced; shared label/value baselines retained on desktop, 96px label rail and flexible values on phones. Closing CTA uses the story grid: eyebrow x80, copy and button x464 at 1280px. Transparent inline SVG marker replaces opaque raster underline. Local screenshots checked at 1280 and 390; 320px no document overflow. 10 renderer tests pass.
