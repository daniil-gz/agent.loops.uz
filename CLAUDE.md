# loops.uz — Guide for AI Sessions

This repo (`~/loops.uz`) is the **single source of truth** for the loops.uz website. Read this before reading, editing, or deploying. Any Claude Code / Cursor / agent session opening this folder should follow it.

---

## What this is

Static marketing site — **Loops** (личный бренд Даниила: реклама с ИИ-агентом, консалтинг, продукты Adstat/Selgram; Ташкент). **No build step** — what's in the repo IS what ships. The homepage is an umbrella / personal-brand page that links external `styles.css` + `site.js` + `cases-data.js` (it is **no longer** all-inline). Font: **Manrope**. Accent: `--gold #f3c866`.

Lead form posts (same-origin) to **`/api/lead`** → handled by a **Cloudflare Worker** (`loops-lead`, route `loops.uz/api/lead`) that calls the Telegram bot. The bot token lives ONLY as a Worker secret (`TG_TOKEN`) — never in the repo or the shipped JS. Chat id is `TG_CHAT` var in `wrangler.toml`. The old PHP files in `api/` (`chat.php`, `telegram.php`) are **inert** (no FastCGI) and unused.

---

## Layout

```
index.html      homepage-зонтик (~22 KB) — подключает styles.css + site.js + cases-data.js
styles.css      все стили сайта (Manrope, акцент --gold #f3c866)
site.js         общее поведение: reveal, sticky-header, форма → api.adstat.uz/api/public/leads
cases-data.js   ГЕНЕРИРУЕТСЯ scripts/build-cases.py из cases/cases.json — НЕ править руками. Карточки (window.LOOPS_CASES) для index.html, cases.html, блока «Другие кейсы»
cases.html      полная страница кейсов (рендерит cases-data.js)
cases/cases.json + cases/_bodies/<id>.html   ← ЕДИНЫЙ ИСТОЧНИК кейсов (реестр + тексты). dev-only, исключены из deploy
cases/case-<id>/index.html   ГЕНЕРИРУЮТСЯ build-cases.py (9 реальных кейсов на основной дизайн-системе). estate/legal — старые редирект-заглушки
clinics/        нишевый лендинг «Маркетинг для клиник» (Service+Person+FAQPage schema, голос «я»), ссылается на /cases/case-viamed/
about/          страница «Обо мне» (E-E-A-T, Person/BreadcrumbList schema)
consulting/     консалтинг (отдел продаж/CRM): hero+портрет, айсберг-скроллителлинг, тарифы с гантом, лента лого
target/         СТАРАЯ богатая агентская страница (таргет+ИИ-агент); JSON-LD Person+Service+FAQPage
ai-bot/         агентский лендинг (более старый клон) — canonical → /target/
articles/       блог. 3 клиниковые статьи на ОСНОВНОЙ системе (.art-* в styles.css, голос «я»); старые 4 (antigravity/google-skills/career-dreamer/manus) на LEGACY /css/style.css
images/iceberg.svg, images/clients/*   ← ассеты консалтинга (айсберг + лого клиентов, вытащены из КП)
consulting/{lab,iceberg-lab}.html, consulting/annotate.js   ← ЛОКАЛЬНАЯ дизайн-песочница (noindex, исключены из deploy)
404.html  images/  api/  llms.txt  robots.txt  sitemap.xml
scripts/deploy.sh   ← деплой статики
worker/index.js  wrangler.toml   ← Cloudflare Worker формы (НЕ деплоится статикой; деплой через wrangler)
```

Files NOT shipped to the server (dev-only, auto-excluded by deploy): `README*`, `*.md`, `CLAUDE.md`, `netlify.toml`, `vercel.json`, `.htaccess`, `scripts/`, `.agent/`, `_handoff/`, backups, `api/`, `consulting/{lab,iceberg-lab}.html`, `consulting/annotate.js`, `.lab-feedback.json`, `_recovered/`, `cases/_bodies/`, `cases/cases.json`.

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
The script: (1) tars the current server site into `/root/backups/`, (2) rsyncs repo→server excluding dev files, (3) purges Cloudflare cache. CSS/JS отдаются как `private, no-cache` (revalidate по ETag, на edge НЕ кэшируются) — правки видны сразу после деплоя, **никакого `?v=` не нужно**. Purge на деплое нужен только для картинок (см. Gotchas).

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
- **DNS / CDN:** Cloudflare zone `loops.uz` (id `f41fb8f4fbfda243650e27e0f7db5bc8`), proxied, Flexible SSL, self-signed origin cert. Cache-purge token в `~/.cloudflare-loops.env` (`CF_LOOPS_TOKEN`, права Zone→Cache Purge + DNS Edit). ⚠️ У токена включён **Client IP filtering** — он работает только с разрешённых IP. Если деплой/purge падает с `9109 (location ...)` или `Authentication error` — добавь текущий IP в фильтр токена (CF → My Profile → API Tokens → этот токен → Client IP Address Filtering). Домашний IP динамический, так что это будет повторяться; можно вообще убрать фильтр.
- **Кэш-заголовки (nginx, `/etc/nginx/sites-available/loops`):** CSS/JS → `Cache-Control: private, no-cache` (Cloudflare пропускает без перезаписи, browser ревалидирует по ETag); картинки/шрифты → `public, immutable, max-age=30d`. Менял картинку под тем же именем — переименуй или сделай purge. Бэкапы конфига: `/etc/nginx/sites-available/loops.bak-*`. Правка nginx: `ssh adstat-deploy` → бэкап → `nginx -t` → `systemctl reload nginx`. Несуществующие URL → честный 404 (`error_page 404 /404.html`).
- **GitHub:** `github.com/daniil-gz/agent.loops.uz`, branch `main`. Branch `backup/downloads-copy` holds an old divergent dev line (already merged into main — reference only).

---

## Gotchas (важно — не наступи)

1. **НЕ добавляй `?v=` к CSS/JS.** Раньше был костыль `styles.css?v=N` поверх `immutable`-кэша. Теперь nginx отдаёт CSS/JS как `private, no-cache` → браузер ревалидирует по ETag, edge не кэширует (`cf-cache: BYPASS`), правки видны сразу после деплоя. Версионировать URL больше не нужно — ссылайся на голые `styles.css` / `site.js` / `cases-data.js`.
2. **Картинки кэшируются на 30 дней (`immutable`).** Поменял картинку под тем же именем — либо переименуй файл, либо сделай purge: `. ~/.cloudflare-loops.env && curl -X POST -H "Authorization: Bearer $CF_LOOPS_TOKEN" https://api.cloudflare.com/client/v4/zones/f41fb8f4fbfda243650e27e0f7db5bc8/purge_cache -d '{"purge_everything":true}'` (или CF → Caching → Purge Everything). Если purge даёт `9109/Authentication error` — IP-фильтр токена (см. Access).
3. **Добавить/править кейс = ЕДИНЫЙ ИСТОЧНИК + генератор.** Правишь `cases/cases.json` (карточка+мета+KPI) и `cases/_bodies/<id>.html` (текст) → `python3 scripts/build-cases.py` → генерит `cases-data.js` + `cases/case-<id>/index.html`. Синхронизируется везде (главная, /cases.html, детальная, «Другие кейсы»). **НЕ редактируй `cases-data.js` и `cases/case-*/index.html` руками — перезатрёт генератор.** Картинка в `images/`. Иконки ниш: `box/car/heart/factory/truck`.
4. **Домен:** всё каноническое на `loops.uz`. `agent.loops.uz` → **301** → `loops.uz` (CF Redirect Rule, Dynamic `concat("https://loops.uz", http.request.uri.path)`). Не плодить ссылки на agent.
5. **ИИ-краулеры РАЗРЕШЕНЫ** (CF «Managed robots.txt» выключен) — нужно для GEO (цитирование в ChatGPT/Gemini/Perplexity). **Не включай обратно.**
6. **`/target/` = старая агентская страница** (полный таргет+бот контент с прежней главной). Карточка «Трафик + ИИ» на главной ведёт сюда. Не путать с новой главной-зонтиком.
7. **Форма заявки = Cloudflare Worker `loops-lead`** (`worker/index.js`, route `loops.uz/api/lead`). Деплой Воркера ОТДЕЛЬНО от статики:
   - `npx wrangler deploy` (нужен `wrangler login`, OAuth-аккаунт `scribble.mgc@gmail.com`, account id `cd78e545061aea8625dbb86116fe6bb5`).
   - Сменить токен бота: `printf '%s' '<TOKEN>' | npx wrangler secret put TG_TOKEN` (токен — Worker secret, **никогда** не в репо/в коде сайта). Сменить чат: правка `TG_CHAT` в `wrangler.toml` → `wrangler deploy`.
   - Тест: `curl -X POST https://loops.uz/api/lead -H 'Content-Type: application/json' -d '{"name":"t","contact":"t"}'` → `{"ok":true}` + сообщение в TG.
   - Бот сейчас `@isikava_bot` («Ассистент Loop`s»), чат `183174525`. `worker/` + `wrangler.toml` исключены из `deploy.sh` (не попадают на статик-сервер).
8. **styles.css: базовые правила в КОНЦЕ файла** (после медиа-запросов ~стр.825). Мобильный override для селектора, объявленного в конце (напр. `.talks-grid`), НЕЛЬЗЯ класть в `@media` выше по файлу — базовое правило ниже его перебьёт. Клади такие override в `@media` в самом конце. (Так словили баг: talks-grid стоял 2-в-ряд на мобиле.)
9. **Картинки кейсов квадратные (640×640).** `.case-photo` = `aspect-ratio: 1/1` + `object-fit: cover` (фото заполняет карточку край-в-край, без полей). Новые картинки делай ~квадратными, иначе обрежет.
10. **Визуальная проверка.** chrome-devtools-mcp (`new_page`/`navigate_page` + `resize_page` для мобайла + `take_screenshot fullPage`) РАБОТАЕТ на проде loops.uz (этой сессией снимал главную/clinics/кейсы). Мобайл-ширина 390×844 — основной трафик с телефонов. На проде также сверяй `curl`-ом (статусы/заголовки/контент).
11. **Локальный дизайн-ревью с разметкой:** `python3 scripts/lab-serve.py` (статика на :8765 + POST `/feedback` → `.lab-feedback.json`). Страница с `consulting/annotate.js` даёт клик-разметку (кнопка «✏️ Разметка»), «Отправить» пишет заметки в `.lab-feedback.json` — Claude читает оттуда. annotate.js само-отключается вне localhost.
12. **lab-страницы держат CSS инлайн, боевые тянут внешний `/styles.css`.** При переносе lab→прод стили уезжают в styles.css, а браузер агрессивно кэширует `/styles.css` на localhost → если после правок «вёрстка поехала», это почти всегда старый CSS: **Cmd+Shift+R**. (lab-serve уже отдаёт `no-store`.)
13. **Ассеты из КП/PDF:** растровые лого — `pdfimages -png` (пары image+smask склеить через Pillow: `alpha = smask`); векторное (айсберг) — экспорт SVG из исходника либо `pdftoppm -r 300` + кроп. Лого на тёмном фоне подаём **моно-белыми** (CSS `filter:brightness(0) invert(1)`, по наведению — ярче, НЕ возврат в цвет: тёмные лого исчезают). Готовое — в `images/clients/*`, `images/iceberg.svg`. Pillow живёт в `/usr/bin/python3` (не в дефолтном — там dylib-конфликт в iCloud-воркетри).
15. **Единый хедер = «Направления» (дропдаун) + гамбургер на ≤980px.** Хардкодится на каждой странице основной системы (генератор кейсов вставляет сам; статьи/лендинги — вручную). При правке меню — менять во ВСЕХ: index, cases.html, about, consulting, clinics, 3 статьи, `scripts/build-cases.py` (→ regen), и отдельно `target/` (у него СВОЙ bespoke-хедер `.hd/.nav/.drw` с инлайн-CSS — там правится контент, не дизайн). Подсветка текущей страницы — автоматом в site.js по `location.pathname`.
16. **`position:fixed` внутри `#site-header` НЕ привязывается к вьюпорту.** У хедера `backdrop-filter: blur()` — это создаёт containing block для fixed-потомков (как `transform`/`filter`). Поэтому моб-панель `.nav-mobile` позиционируется относительно хедера, а не экрана. Высоту задавать через `height:calc(100dvh - 60px)` (НЕ `bottom:0` — даст ~44px). Тот же подвох для любых fixed-оверлеев внутри хедера.
14. **Подстраницы ДОЛЖНЫ подключать `/site.js`** — иначе `.reveal`-элементы (hero-карточка, вставляемые карточки кейсов) остаются `opacity:0` у пользователей с включёнными анимациями (`.anim` на `<html>`), хотя в headless-браузере (reduced-motion) видны. Порядок в конце `<body>`: `cases-data.js` → инлайн-скрипт, вставляющий `.reveal`-карточки → **потом** `site.js` (его IntersectionObserver один раз сканит `.reveal`, поэтому карточки должны быть в DOM до него). Кейс-генератор это уже делает.

## Rules

1. **Never edit `/var/www/loops` directly** — always repo → commit → deploy. The server must never be ahead of git.
2. **Always `git push`** after deploying — keep repo, server, and GitHub identical.
3. **Don't commit new secrets** — `api/*.php` historically held tokens (rotated, now dead). If you wire up PHP, put secrets in env/config outside git.
4. **Update `sitemap.xml`** when adding/removing pages.
5. **Purge cache after every deploy** (the script does this automatically; if it skips for a missing token, purge manually in the CF dashboard or users see stale pages).
6. **Don't touch the adstat stack** — loops.uz shares the VPS with the Adstat app (`/root/adstat`, Docker). They're unrelated; stay in `/var/www/loops`.
