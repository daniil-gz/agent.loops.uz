# BioRise — 2026-09-14

Published commit ef546d9 to https://loops.uz/cases/case-biorise/ and the second curated card after ILVI. Existing BioRise project row opens preview; preview CTA opens full case. Source: cases/_content/biorise.json. Owner supplied aggregate Adstat results and confirmed 4–6k monthly incoming requests, bot first dialogue and administrator handoff. No Meta/Klientiks requests or new export.

Public content uses rounded financial/retention figures. No underlying monthly financial table, exact totals or methodology section. Instagram segment includes mixed sources; no profit, incrementality or medical outcome claims.

Validation: 17 case-format tests pass; Vite build succeeds; git diff --check passes. Local browser checked desktop 1280 and mobile 390/320, no horizontal overflow. Reviewed hero, cover, flow, repeated-visit graphic, growth chart and preview. Clicked BioRise from lower project list, then preview CTA to full case.

Backup: /root/backups/loops-www-20260914-215050.tar.gz. Dry-run reviewed; final deploy used explicit changed public paths with rsync -rcvR, without deletion, because unrelated ILVI gallery work appeared concurrently in the checkout. This deployment does not include those files or later shared-renderer edits. Old hashed JS retained on server for existing tabs.

Exact-URL Cloudflare purge succeeded through connected API (HTTP 200, success true). Public HTTP/1.1 readback: case HTML, landing HTML, shared CSS, cover and new hashed JS returned 200 and matched the deployed files byte-for-byte. Public IAB navigation still hits ERR_QUIC_PROTOCOL_ERROR; desktop/mobile visual QA was local. GitHub main pushed through ef546d9.
