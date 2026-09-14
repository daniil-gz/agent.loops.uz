# Decorative assets — polish v2

Date: 2026-09-08. Generated with built-in ImageGen using the approved Loops hero screenshot as composition reference for the money collages and the prior yellow marker as the style reference for the arrow. Client logos were never generated; see logos-inventory.md.

| Shipping asset | Original generated file | Art direction |
|---|---|---|
| franklin-v2.webp | exec-63af8929-5a2b-4422-9502-a766c7bbd873.png | Engraved Benjamin Franklin head and chest, torn off-white paper, charcoal engraving, muted sage fragment, compact premium editorial cutout, transparent; no full banknote or text. |
| dollars-v2.webp | exec-3d974d9f-f631-4e70-ae15-694282d6adcc.png | Two folded stylized dollar-like notes and a small gold coin, charcoal/sage/warm paper, tactile editorial cutout, transparent; no purple, starburst or text. |
| marker-arrow-v2.webp | exec-77662d6c-893d-4dc5-b499-bede3a05903b.png | Short down-left curved yellow dry-marker arrow, tight square crop, transparent; no loop. CSS orientation attaches it to each target. |
| marker-oval-v2.webp | exec-34dbf8aa-faef-4984-98cd-34402362c689.png | Wide low lemon-yellow dry-marker ellipse, slightly open upper right, pure white background, 3:1; no checkerboard, texture or arrow. |
| marker-underline-v2.webp | exec-18287ebf-9338-451d-aa1f-6bad06c5d47c.png | Lemon-yellow dry-marker underline with short echo at right, pure white background, 3:1; no checkerboard or paper texture. |

Original directory: /Users/daniilgazizov/.codex/generated_images/01a08073-1d39-7251-bf0c-f5ebd3b88d6c/. Compressed/resized to WebP without redrawing. Oval and underline use multiply blending on the warm page background. Initial checkerboard-background candidates were rejected. Existing compass, sail and obsolete marker-loop were removed from shipping assets.


## v3 — original loop and supplied Mr Krabs

- `marker-hero-loop.webp`: the user's original preferred yellow loop from commit c37ad27, source `public/assets/marker-loop.png`; resized to 1100 px width, WebP quality 95. Local hero-statement anchor and 8-degree presentation rotation.
- `krabs-original.png`: exact copy of user attachment `/var/folders/8r/1yycq5gs161bq6v9glngmxcr0000gn/T/codex-clipboard-0f03abf8-cbd8-49bb-9051-60eb028d2d4c.png`. Pixel art not redrawn or edited. Transparent padding is framed in CSS; horizontal reflection is `scaleX(-1)` on the inner crop wrapper. Existing outer float animation retained.
- Client color states remove only CSS monochrome filters. Native white logo versions use a dark interaction background; naturally monochrome brand originals remain monochrome.

## Logo presentation v4 — 2026-09-08

Five user-provided original PNG/JPEG files are stored under public/assets/clients: trafficlegal.png, dmenergy.png, intercargo.jpg, burgerlounge.jpg, pervayachaynaya.jpg. Exact clipboard source filenames are recorded in logos-inventory.json. No image regeneration, bitmap crop or recoloring was applied. Cropping empty source margins, optical fitting and monochrome/color states are CSS presentation. The same LogoArt component and frame tokens serve the directory and moving strip. Runtime screenshots and checks: evidence/polish-v4/.

## 2026-09-14 assets
- Hero avatar: user PNG `codex-clipboard-e1b7d21f-19ff-4cb9-9033-bd288029fc66.png`; delivery `daniil-avatar-2026.webp`, 640×640. Same artwork, delivery resize/compression; face framed via CSS. Original color/yellow outline preserved.
- Korporatsiya Volshebstva: user JPG `codex-clipboard-9a6f3875-1086-44c4-9f60-eb214a4ab887.jpg`, copied unchanged to `clients/volshebstvo.jpg` (640×640). CSS crop [168,122,336,397].
- Video poster: official https://i.ytimg.com/vi/Q-RmwcYpya0/maxresdefault.jpg, supplied video “Этапы работ”, downloaded for local lazy poster. YouTube iframe only created on play; direct video link remains available.
- Social icons: existing @phosphor-icons/react library, no hand-drawn approximations.
