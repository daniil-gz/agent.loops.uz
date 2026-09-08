# Design QA — hero and logos v3

Date: 2026-09-08
final result: passed

## Target and evidence

User requested the original large yellow hero accent, a raised statement/note, moving client logos with color on click, color on hover in cases/projects, then supplied pixel-art Mr Krabs to replace the lower floating dollars, mirrored horizontally.

Source: the approved previous landing, fresh capture evidence/polish-v3/01-before-current.png (478 × 936); original yellow loop from commit c37ad27; user artwork codex-clipboard-0f03abf8-cbd8-49bb-9051-60eb028d2d4c.png. Existing typography, hierarchy, content and section order are the baseline.

Implementation: http://127.0.0.1:4188/leadgeneration/ (production build). Screenshots have CSS size = image size, density 1. Before 01 and after 14 were opened in the same comparison input at 478 × 936. The statement moves into the gap directly below the wordmark; the logo strip becomes a continuous horizontal row. Desktop 12-final-desktop.png (1280 × 900), mobile 16-final-mobile.png (390 × 844), narrow 05-mobile-360.png, and compiled tablet 17-compiled-tablet.png (768 × 1024). The narrow capture predates the last marker angle adjustment; 390/478 show the final mobile angle. Full viewport comparisons cover the edited hero; focused evidence 09-desktop-color.png, 10-directory-hover.png and 11-case-hover.png covers interactions below it.

## Iterations

| Finding | Before | After |
|---|---|---|
| P2: loop stroke too close to text | 03-desktop-accent.png | Rotated original loop 8 degrees around its ellipse center, adjusted local offsets; 09/12 show text inside the loop. |
| P2: tablet arrow clipped by viewport | 06-tablet.png | Constrained marker to the available half-column and adjusted copy inset/size; final compiled 17 shows complete accent and readable copy. |
| P2: original white logos invisible in color | Native NWL/Basalt and other white marks on pale page | Original-color state supplies a dark background only for these native white versions; 09 shows NWL red/white, 10 shows Dental green/cream. |

The initial JSX edit caused a local Vite parser error and was corrected before any deploy; build passes. A historical Vite log remains attached to that development tab, not the compiled route. Live-release console checks are recorded separately.

## Fidelity and scope

- Fonts: TikTok Sans and Caveat retained, existing weights and hierarchy preserved. Tablet hero statement is 20 px for clearance; mobile statement enlarged and moved above services.
- Layout: statement plus note raised, original marker locally anchored; 360/390/478/768/1280 responsive checks, no horizontal page overflow. Project grid sizes and row rhythm preserved.
- Colors: paper/ink/yellow retained. Native client colors appear on interaction; no invented recoloring of monochrome source logos.
- Assets: original supplied Krabs file copied unchanged; CSS crop removes surrounding transparent padding, scaleX(-1) mirrors the presentation, pixelated rendering preserves edges. The float remains on its outer wrapper. Original yellow loop resized/compressed to WebP; no redraw or new generated artwork.
- Content: services, case metrics, links and brief flow unchanged. Directory coverage remains 38 of 44, with six previously documented source gaps.

## Interaction verification

- Marquee transform advances; pause control sets animation-play-state paused. NWL click sets aria-pressed and filter none; original red/white version remains readable. Resume clears color selection and restarts movement.
- Hover pauses the strip; keyboard focus also pauses it. Duplicated visual group is hidden from accessibility navigation.
- Dental directory logo hover shows original green/cream; click keeps color after pointer leaves. Logo buttons support keyboard/touch.
- ViaMed case hover changes grayscale(1) to grayscale(0), existing click/modal behavior retained.
- Reduced motion emulated through browser developer capability: animation none, duplicate group hidden, manual horizontal scrolling available. Emulation reset after check.
- Mobile menu opens and closes after navigation to contacts.
- No completed broken images or page overflow in checked states. New compiled assets load; production build passes.

No remaining actionable P0/P1/P2 findings for this scoped revision. Public verification, backup and file hashes are appended to deployment.md.


## Published verification

Public 19-live-final.png (478 × 936) shows the corrected image, loop and compact composition; 18-live.png records the initial 403 failure before repair. Asset permissions were corrected to 0644 and the file purged. Five changed files return 200 and match local SHA-256, new JS index-BEfPlCi2.js loaded, no broken images or page overflow. Live NWL color/pause/resume passed, console empty. Public tab retained; temporary viewport/media overrides reset.
