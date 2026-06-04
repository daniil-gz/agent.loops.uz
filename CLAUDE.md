# loops.uz — Guide for AI Sessions

This repo (`~/loops.uz`) is the **single source of truth** for the loops.uz website. Read this before reading, editing, or deploying. Any Claude Code / Cursor / agent session opening this folder should follow it.

---

## What this is

Static marketing site — **Loops** (личный бренд Даниила: реклама с ИИ-агентом, консалтинг, продукты Adstat/Selgram; Ташкент). **No build step** — what's in the repo IS what ships. The homepage is an umbrella / personal-brand page that links external `styles.css` + `site.js` + `cases-data.js` (it is **no longer** all-inline). Font: **Manrope**. Accent: `--gold #f3c866`.

Lead form posts to `https://api.adstat.uz/api/public/leads` (wired in `site.js`) → Telegram. The PHP files in `api/` (`chat.php`, `telegram.php`) are **inert** (no FastCGI on the server) — the form does NOT depend on them.

---

## Layout

```
index.html      homepage-зонтик (~22 KB) — подключает styles.css + site.js + cases-data.js
styles.css      все стили сайта (Manrope, акцент --gold #f3c866)
site.js         общее поведение: reveal, sticky-header, форма → api.adstat.uz/api/public/leads
cases-data.js   данные кейсов + рендер (window.LOOPS_CASES) — общий для index.html и cases.html
cases.html      полная страница кейсов (рендерит cases-data.js)
target/         СТАРАЯ богатая агентская страница (таргет+ИИ-агент) — перенесена сюда с прежней главной
ai-bot/         агентский лендинг (более старый клон)
cases/*         legacy — теперь 301-редирект-заглушки → /cases.html (контента нет)
articles/       блог (контент пока офф-топик/заглушки)
404.html  images/  api/  llms.txt  robots.txt  sitemap.xml
scripts/deploy.sh   ← деплой
```

Files NOT shipped to the server (dev-only, auto-excluded by deploy): `README*`, `*.md`, `CLAUDE.md`, `netlify.toml`, `vercel.json`, `.htaccess`, `scripts/`, `.agent/`, `_handoff/`, backups, `api/`.

---

## How to READ / understand before changing

- `index.html` is small; bulk of styling is in `styles.css`. Homepage section anchors: `#directions`, `#cases`, `#about`, `#contact`.
- Cases are **data-driven**: edit `cases-data.js` (`window.LOOPS_CASES`), not per-case HTML. They render on both `index.html` and `cases.html`.
- `sitemap.xml` / `robots.txt` / `llms.txt` are hand-maintained (all on `loops.uz`) — update when adding pages.
- Check git log for context: `git log --oneline -15`.

## How to CHANGE

1. Edit files in `~/loops.uz` (never edit the server directly).
2. Preview locally: open `index.html` in a browser, or `python3 -m http.server` in the repo.
3. Commit with a clear message:
   ```bash
   git add -A && git commit -m "..."
   ```
4. Deploy (see below).

## How to DEPLOY

```bash
bash scripts/deploy.sh --dry-run   # see what would change
bash scripts/deploy.sh             # backup server → rsync → purge CF cache
```
The script: (1) tars the current server site into `/root/backups/`, (2) rsyncs repo→server excluding dev files, (3) purges Cloudflare cache. ⚠️ Шаг 3 сейчас падает (`Authentication error` — токен в `~/.cloudflare-loops.env` протух). И покупка edge-кэша всё равно не чистит браузерный immutable-кэш — поэтому при правке `styles.css`/`site.js`/`cases-data.js` **обязательно бампай `?v=`** (см. Gotchas).

After deploying, verify:
```bash
curl -sk -o /dev/null -w '%{http_code}\n' https://loops.uz   # expect 200
```

Then push so GitHub stays in sync:
```bash
git push origin main
```

## ROLLBACK

```bash
git log --oneline -5
git checkout HEAD~1 -- index.html      # or whole tree: git checkout HEAD~1 .
bash scripts/deploy.sh
```
Server tar backups are in `/root/backups/loops-www-*.tar.gz` on the VPS.

---

## Access / infrastructure

- **Server:** VPS `95.130.227.146`, site dir `/var/www/loops`, served by nginx (`/etc/nginx/sites-available/loops`). Reach it only via `ssh adstat-deploy` (Cloudflare Tunnel + Access service token) — **never** `ssh root@95.130.227.146` (port 22 is firewalled; direct attempts hang).
- **DNS / CDN:** Cloudflare zone `loops.uz` (id `f41fb8f4fbfda243650e27e0f7db5bc8`), proxied, Flexible SSL, self-signed origin cert. Cache-purge token expected at `~/.cloudflare-loops.env` (`CF_LOOPS_TOKEN=...`).
- **GitHub:** `github.com/daniil-gz/agent.loops.uz`, branch `main`. Branch `backup/downloads-copy` holds an old divergent dev line (already merged into main — reference only).

---

## Gotchas (важно — не наступи)

1. **Версионирование ассетов из-за immutable-кэша.** `styles.css` / `site.js` / `cases-data.js` отдаются с `Cache-Control: immutable, max-age=30d` — кэш сидит и в браузере у вернувшихся посетителей (CF-purge его НЕ чистит). После правки любого из них **подними `?v=N` в `index.html` И `cases.html`** (`styles.css?v=2` → `?v=3` и т.д.), иначе изменения не увидят. HTML отдаётся `cf-cache-status: DYNAMIC` (не кэшируется) — поэтому новый `?v=` подхватывается сразу.
2. **CF cache-purge токен протух** (`~/.cloudflare-loops.env`, `Authentication error`) — авто-очистка edge на деплое не работает. Чинить токен (CF → My Profile → API Tokens; права Zone → Cache Purge + DNS Edit для loops.uz) или чистить вручную (CF → Caching → Purge Everything).
3. **Добавить кейс:** объект в `cases-data.js` (`LOOPS_CASES`) + картинка в `images/` + бамп `?v=` → появляется на главной и `/cases.html`. Иконки ниш: `ICON.box/car/heart/factory/truck`. Подробный чек-лист — в Obsidian: `25_Loops/site/how-to-add-case.md`.
4. **Домен:** всё каноническое на `loops.uz`. `agent.loops.uz` → **301** → `loops.uz` (CF Redirect Rule, Dynamic `concat("https://loops.uz", http.request.uri.path)`). Не плодить ссылки на agent.
5. **ИИ-краулеры РАЗРЕШЕНЫ** (CF «Managed robots.txt» выключен) — нужно для GEO (цитирование в ChatGPT/Gemini/Perplexity). **Не включай обратно.**
6. **`/target/` = старая агентская страница** (полный таргет+бот контент с прежней главной). Карточка «Трафик + ИИ» на главной ведёт сюда. Не путать с новой главной-зонтиком.

## Rules

1. **Never edit `/var/www/loops` directly** — always repo → commit → deploy. The server must never be ahead of git.
2. **Always `git push`** after deploying — keep repo, server, and GitHub identical.
3. **Don't commit new secrets** — `api/*.php` historically held tokens (rotated, now dead). If you wire up PHP, put secrets in env/config outside git.
4. **Update `sitemap.xml`** when adding/removing pages.
5. **Purge cache after every deploy** (the script does this automatically; if it skips for a missing token, purge manually in the CF dashboard or users see stale pages).
6. **Don't touch the adstat stack** — loops.uz shares the VPS with the Adstat app (`/root/adstat`, Docker). They're unrelated; stay in `/var/www/loops`.
