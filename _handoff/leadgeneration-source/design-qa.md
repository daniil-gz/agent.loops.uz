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
