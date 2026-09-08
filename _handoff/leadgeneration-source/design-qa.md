# Design QA — Loops polish v2

Date: 2026-09-08
final result: passed

## Visual target and scope

Polish the approved live /leadgeneration/ landing: attach yellow marks to their subjects, replace compass/sail with money collage, populate and align the industry directory. Preserve typography, page structure and working conversion flow.

Source captures from the existing implementation before edits: evidence/polish-v2/01-before-hero.png, 02-before-cases.png, 03-before-directory.png. Original art references: /Users/daniilgazizov/loops-landing-reference/targeteria/ and loops-handwriting-reference.jpg. Local preview: http://127.0.0.1:4188/leadgeneration/ (production build).

## Visual comparisons and evidence

Desktop CSS viewport and image: 1280 × 900, density 1. Before/after hero images 01/17 were opened together; composition, typography and approved paper palette retained, with Franklin/dollars replacing old objects. Directory captures 03/22 were opened together at the same width; their vertical scroll positions differ, so alignment was judged at matching card boundaries. Final lower rows and CTA arrow: 23-final-lower-grid.png. Article images 10/19 were opened together at identical viewport and scroll position; fixed underlines now sit below 01/03, with oval around 02.

Focused final evidence: 09-process-arrow.png; 13-mobile-modal.png; 14-mobile-360.png; 15-tablet-hero.png; 16-tablet-grid.png; 17-final-hero.png; 19-articles-fixed.png; 22-compiled-grid.png; 23-final-lower-grid.png. Desktop full-page capture 18 and derivatives 20/21 were rejected because the browser capture stitched/scaled the page incorrectly; they are not evidence of layout quality. Individual viewport captures and DOM measurements were used instead.

## Findings and fixes

- P2 fixed: oversized yellow loops drifted independently of text. Added inline Mark wrappers and three distinct assets: underline, oval, short curved arrow. Photo arrow and invitation arrow use their own containing blocks.
- P2 fixed: white image background patches in nested stacking contexts. Added appropriate multiply blending to marks and their immediate decorative parents; verified cases/articles/process.
- P2 fixed: inherited article image top positioning crossed out 01/03. Removed obsolete generic image rules and reset underline top to auto. Compared 10 against 19 after correction.
- P2 fixed: sector cards, names and logo columns had inconsistent alignment. Fixed header and row rhythm, permanent logo slots and equal collapsed card heights; long names wrap without clipping.
- P2 fixed: opaque logos became solid blocks under blanket brightness filters. Added source-appropriate natural/inverted treatments, including final Buchet correction verified in 23.
- P2 fixed: wide whitespace in ViaMed source made mark unreadable. Scaled source within its clipped logo slot, retaining the actual logo.
- P2 fixed: mobile decoration touched viewport edge and narrow hero line wrapped awkwardly. Adjusted cash position and the smallest-width heading rule; no horizontal overflow at 360/390/768/1280.
- P2 fixed: hidden fifth restaurant was not directly discoverable. Added an explicit +1 project button; FeedUp expands and collapses correctly.

No remaining actionable P0/P1/P2 findings in the tested polish scope. P3 content gap: 6 of 44 projects still lack a reliable logo source. Resto Kids uses the verified parent Resto mark; dedicated Kids mark is a follow-up. See logos-inventory.md. Missing marks are not fabricated.

## Responsive and functional checks

- 360 × 800, 390 × 844, 768 × 1024, 1280 × 900: no horizontal page overflow or clipped sector text. Card heights 372 px on mobile, 338 px on tablet/desktop; responsive 2/3/4 columns.
- 38 logo assignments across 44 projects; collapsed DOM has 37 images because FeedUp is behind +1 project. No completed broken images; all assets local.
- All 11 filters exercised: all 9; medicine 1; restaurants 1; auto 1; B2B 3; production 1; fitness 0; home 1; products 0; education 0; other 1. Empty states provide a useful action.
- Sector expansion, +1 project and collapse passed. Mobile menu opens, navigation reaches contact and closes the menu.
- BTS modal: visible on mobile, close works, aria-modal true, body scroll locked, close button focused.
- Brief form: values prepared into encoded Telegram URL; editing preserves inputs. No message sent and no external test lead created.
- FAQ price answer expands. Browser console: zero errors/warnings on fresh compiled preview.
- TikTok Sans and Caveat loaded. Existing gentle float/parallax and reduced-motion code preserved; reduced-motion device preference was reviewed in code, not independently emulated.
- npm run build passes. Existing runtime packaging files retained. This is not a full accessibility or SEO audit; test route remains noindex,follow.

Public verification and backup are recorded in deployment.md after release.
