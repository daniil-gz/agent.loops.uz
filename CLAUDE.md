# loops.uz — правила работы с сайтом

Сайт Даниила Газизова и команды Loops: таргет, чат-боты, продажи и CRM. Ташкент, только русский язык.
Это репозиторий — единственный источник сайта. Сервер напрямую не правь. Обновлено 04.11.2026.
SEO/GEO, решения Даниила, журнал работ — `~/loops-seo` (читать `decisions.md`, `state.md`).

## Главные команды

```bash
python3 scripts/build-all.py             # собрать весь сайт и проверить
python3 scripts/build-all.py --check     # только проверки
python3 scripts/release.py --dry-run     # что уедет на сервер, сверка сервера
python3 scripts/release.py               # выкладка (только с main, всё закоммичено)
```

`build-all` = кейсы → маркетинг → редакция → тесты → аудит. Ошибка аудита = выкладки нет.
`release` = изменённые с тега `deployed` публичные файлы, без удалений на сервере, сверка md5 сервера, копия в `/root/backups/loops-release-*.tgz`, сначала ресурсы, потом HTML, очистка кэша Cloudflare по адресам, проверка живого сайта, тег `deployed`, push, IndexNow.
`scripts/deploy.sh` не запускать: он удаляет на сервере kp/, reports/, razbor/.

## Что где правится

Сгенерированные HTML руками не правь: сборка перезапишет.

| Страницы | Источник | Сборщик |
|---|---|---|
| `/`, `/target/`, `/ai-bot/`, `/consulting/`, `/analytics/` | `_handoff/leadgeneration-source/src/services.js`, `App.jsx`, `ServicePage.jsx`, `data.js` | `scripts/build-marketing.py` (React + пререндер, разметка — `_handoff/leadgeneration-source/scripts/prerender.mjs`) |
| `/b2b/ /clinics/ /manufacturing/ /auto/ /horeca/ /fitness/` | `_handoff/leadgeneration-source/src/industries.json` | то же |
| `/cases/case-<id>/` | `cases/_content/<id>.json` + id в `cases/cases.json`. Формат — `cases/FORMAT.md` | `scripts/build-cases.py` (шаблон `scripts/case_format.py`) |
| `/articles/…`, `/cases.html`, `/about/`, `/privacy/`, `/404.html` | `content/articles.json`, тексты в `scripts/build-editorial.py`, общий блок цен и FAQ — `scripts/offer_block.py` | `scripts/build-editorial.py` |
| `sitemap.xml` | Собирается из источников: `scripts/sitemap.py`. lastmod — дата git | вызывает build-editorial |
| `llms.txt` | `scripts/build-editorial.py` | то же |
| `robots.txt`, `/razbor/`, `/clinic-ads/` | Вручную. razbor и clinic-ads — noindex, вне sitemap | — |

Новые файлы в `_handoff/` добавляй `git add -f` (папка в .gitignore). Карточка Даниила (Person) — `content/person.json`.

## Публикация

- Статья: запись в `content/articles.json` → `build-all` → `release`. Порядок и SEO — `~/loops-seo/playbooks/publish-article.md`.
- Кейс: `cases/_content/<id>.json` со `status: "draft"` → согласование с Даниилом → `"published"` → `build-all` → `release`. Черновик не попадает ни на одну страницу, в sitemap и llms.txt. Подробно — `~/loops-seo/playbooks/publish-case.md`.
- Цены живут в нескольких местах (`services.js`, `industries.json`, `offer_block.py`, `prerender.mjs`, `build-editorial.py`, `articles.json`). Меняешь цену — `grep -rn "млн сум" _handoff/leadgeneration-source/src scripts content`. Аудит сверяет `offer_block.PRICES` с `services.js` и число кейсов в текстах.
- Цифры кейсов — только из опубликованных кейсов. Не придумывай сроки, цены, результаты.

## Инфраструктура

- Сервер: `ssh adstat-deploy` (Cloudflare Tunnel), сайт `/var/www/loops`. Рабочий nginx — `/etc/nginx/sites-enabled/loops`: это отдельный файл, не ссылка на `sites-available/loops` (тот не используется). Правка: копия в `/root/backups/`, `nginx -t`, `systemctl reload nginx`. Регулярки с `{}` — в кавычках. Порт 22 напрямую закрыт. Рядом Adstat (`/root/adstat`, Docker) — не трогать.
- Cloudflare, зона loops.uz `f41fb8f4fbfda243650e27e0f7db5bc8`, SSL Full. Ключ `CF_LOOPS_TOKEN` в `~/.cloudflare-loops.env`: очистка кэша, DNS, настройки зоны. У ключа фильтр IP: ошибка 9109 — Даниил добавляет новый IP. Ключи не выводить.
- Выключено и не включать: HTTP/3 (ошибка QUIC в Chrome), ECH (провайдер в Узбекистане рвёт соединение → ERR_CONNECTION_RESET).
- Боты ИИ разрешены (Managed robots.txt выключен) — нужно для ответов ChatGPT и других.
- `agent.loops.uz` → 301 на `loops.uz`. Всё каноническое — на `loops.uz`.
- Кэш (с 04.11.2026): JS/CSS сборки с хешем в имени — год, `immutable`; остальные CSS/JS — `public, max-age=0, must-revalidate, s-maxage=604800` (Cloudflare хранит 7 дней, браузер сверяется с Cloudflare, `release.py` очищает изменённые адреса); картинки и шрифты — 30 дней `immutable`; HTML — правило кэша Cloudflare. В Cloudflare: Browser Cache TTL = «уважать заголовки сервера», Smart Tiered Cache включён. Новая картинка — новое имя файла (браузеры держат старую до 30 дней). Не добавляй `?v=`.
- Сеть хостинга теряет ~3% пакетов (04.11): первый запрос нового файла к серверу иногда идёт 30–60 с. Поэтому всё статичное должно храниться в Cloudflare, а не идти на сервер.
- Форма с главной готовит бриф в Telegram локально. `/api/lead` — Cloudflare Worker `loops-lead` (`worker/`, `wrangler.toml`), выкладка отдельно: `npx wrangler deploy` (вход Даниила). Токен бота — только секрет воркера.
- Аналитика: Метрика 101239870 и DataFast, события — `site-events-v1.js`, см. `ANALYTICS.md`. Вне loops.uz аналитика выключена.
- Картинки: `/usr/bin/python3 scripts/build-image-variants.py` (Pillow живёт в системном python).

## Проверка

- До выкладки: `build-all` без ошибок. Вид на телефоне 375 px и на компьютере — встроенный браузер, `python3 -m http.server`.
- После: `release` сам проверяет живые страницы. Индексация в Google — вручную, `~/loops-seo/playbooks/indexing.md`.

## Старое

`css/`, `js/`, корневые `styles.css` и `site.js` (нужны только razbor и clinic-ads), `cases-data.js`, `cases/_bodies/`, `images/og-*.jpg`, `api/*.php` — наследие прежнего сайта. Новые страницы их не используют. `README.md`, `DNS_SETUP.md`, `design-qa.md` — история, не инструкции.
