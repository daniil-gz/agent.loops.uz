# Публикация /leadgeneration/ — 8 сентября 2026

URL: https://loops.uz/leadgeneration/
Коммит страницы: `c37ad27` (GitHub main синхронизирован).
Резерв перед публикацией: `/root/backups/loops-www-20260908-154414.tar.gz` на VPS.

Публикация штатным `scripts/deploy.sh`: добавлен только каталог `/leadgeneration/`, существующие страницы не изменены; nginx, Worker и DNS не менялись. Исходники сохранены в `_handoff/leadgeneration-source/` и включены в Git явным добавлением, поскольку общий `_handoff/` находится в .gitignore.

CLI-очистка кэша вернула Authentication error. Через подключённый Cloudflare API успешно выполнен точечный purge URL страницы, fonts.css и двух файлов сборки; ответ 200 success=true. Локальный purge token не изменялся. Это известное ограничение следующего штатного deploy, а не незавершённая публикация текущей страницы.

## Подтверждения

- `/leadgeneration` → 301 на `/leadgeneration/`, конечный URL → HTTPS 200.
- Все 50 опубликованных файлов скачаны и совпадают по SHA-256 с локальными (`evidence/live-assets.json`).
- Все 17 ссылок на существующие страницы Loops возвращают 200 (`evidence/link-check.json`).
- Публичная страница визуально проверена на 1280×720 и 390×844 (`22-public-desktop.png`, `23-public-mobile.png`). Переполнения по ширине нет, битых загруженных изображений нет.
- На публичной версии проверены B2B-фильтр, BTS-модалка, подготовка и редактирование брифа, мобильное меню и переход к контактам. Telegram-ссылка содержит текст брифа; сообщения не отправлялись.
- Консоль успешной публичной загрузки: 0 errors/warnings.
- Во время проверки встроенный браузер сначала показал пустую страницу и ERR_QUIC_PROTOCOL_ERROR, отдельные curl-запросы также завершались тайм-аутом. Повторное открытие в новой вкладке завершилось HTTPS-загрузкой и рабочими интеракциями; повторные скачивания через HTTP/1.1 прошли. Настройки HTTP/3/TLS/браузера не изменялись.
- Публичная вкладка отмечена как deliverable; временный viewport override сброшен.

## Границы теста

Страница открыта по прямой ссылке, `noindex,follow`; sitemap и llms.txt не менялись. Форма готовит личное сообщение, автоматической отправки на backend нет. В исходник не добавлены Метрика/Datafast; при live-загрузке Cloudflare автоматически вставляет свой beacon. Подключение измерения конверсий и полноценный SEO-релиз — отдельный следующий шаг.


## Polish v2 — 8 сентября 2026

Коммит оформления: `c78b15d`. Опубликован по тому же URL. Бэкап перед заменой: `/root/backups/loops-www-20260908-174704.tar.gz`.

Три формата жёлтых пометок привязаны к тексту/фото/кнопке. Компас и парус заменены на коллажи Франклина и долларов с сохранением плавной анимации. Единая сетка 12 направлений, 38 логотипов на 44 проекта, действующая кнопка раскрытия пятого ресторана. Источники и 6 пробелов — logos-inventory.md.

Dry run и deploy изменили только /leadgeneration/. Первая SSH-попытка оборвалась на Cloudflare handshake до изменения сайта; повторная завершилась с backup OK. CLI purge снова вернул 10000; через подключённый Cloudflare API успешно очищены 122 точных URL тремя пакетами (200, success=true). Один неиспользуемый старый файл tmz.png временно отдавал 522: повторный точечный purge и загрузка базового URL дали 200 и совпадающий хеш.

Проверка после публикации: все 76/76 файлов совпадают по SHA-256 (evidence/polish-v2/live-assets-v2.json); URL без слеша → 301, конечный HTTPS → 200. Свежая публичная вкладка загрузила index-DoBnfy2a.js, новые Franklin/dollars; B2B-фильтр, BTS-модалка, закрытие и сброс фильтра прошли. Нет переполнения, битых загруженных изображений, ошибок или предупреждений консоли. Публичные снимки: 24-live-desktop.png и 25-live-grid.png. Адаптивная локальная проверка: 360, 390, 768 и 1280 px; подробнее design-qa.md.

Границы тестового лендинга сохранены: noindex,follow; бриф готовит личное Telegram-сообщение. Полноценный SEO-релиз и backend формы не включены в эту визуальную правку.


## Hero and logos v3 — 8 сентября 2026

Опубликован коммит `1eff8d9` по прежнему адресу https://loops.uz/leadgeneration/. Восстановлена исходная жёлтая петля с локальной привязкой к поднятому тексту. Нижние доллары заменены пользовательским пиксельным Мистером Крабсом: оригинальный файл сохранён, отражение выполнено CSS. Логотипы под хиро движутся, останавливаются для выбора и показывают оригинальные цвета при нажатии. В каталоге логотипы раскрывают цвет при наведении/нажатии, изображения кейсов — при наведении на компьютере. Режим уменьшенного движения проверен и сброшен.

Бэкап: `/root/backups/loops-www-20260908-181444.tar.gz`. Dry run и deploy затронули только 5 новых/обновлённых файлов внутри leadgeneration, удалены два старых файла сборки. CLI purge не сработал с прежним кодом 10000; подключённый Cloudflare API успешно очистил точные URL. Первая dry-run попытка имела временный SSH handshake сбой, повторная прошла.

На публичной проверке PNG из буфера обмена первоначально вернул 403: его исходные права 0600 сохранились при копировании. Права только этого публичного изображения исправлены на 0644 в каноническом исходнике, build, shipping и на VPS, затем очищен точный URL. Изображение вернуло 200; браузер подтвердил naturalWidth 1152, reflection matrix(-1,0,0,1,0,0), отсутствие битых изображений/переполнения. Никакие права каталогов или других ресурсов не менялись.

Все 5 изменённых публичных файлов совпадают со сборкой по SHA-256: evidence/polish-v3/live-assets-v3.json. Свежий публичный снимок 19-live-final.png, 478 × 936. На live проверены пауза, цветной NWL и возобновление ленты, переход наверх. Консоль — без ошибок/предупреждений. Вкладка оставлена открытой, временные viewport/media overrides сброшены. Тестовый noindex,follow и способ подготовки брифа сохранены.

## Unified logos v4 — 2026-09-08

Published commit `073b486` to https://loops.uz/leadgeneration/ via the existing VPS deployment. Backup completed and verified: `/root/backups/loops-www-20260908-192223.tar.gz`. Dry run changed only this landing: HTML, hashed CSS/JS and five new client assets. Original source files copied exactly and set to 0644. Source registry: src/logos.json; inventory: 43/44 project assignments, 41 unique marks.

CLI purge again returned code 10000; exact-page/assets purge through the connected Cloudflare API returned HTTP 200, success=true. No credential or network settings changed. Live SHA-256 verification passed **83/83** public files, all HTTP 200 (`evidence/polish-v4/live-assets-v4.json`). The five supplied files also match the clipboard originals byte for byte (`original-assets.json`).

Fresh public browser capture: `13-live-grid.png`; original Traffic Legal color selected and loaded at natural width 1100: `14-live-color.png`. Correct new script `index-DbCHFY_a.js`, no broken images, no horizontal overflow, empty error/warning log. The old open IAB tab hit transient ERR_QUIC_PROTOCOL_ERROR; a fresh tab through the standard HTTP→HTTPS redirect loaded the public release successfully. Viewport override reset; working public tab kept as deliverable. GitHub main synced.

## 2026-09-14 — feedback polish
- Published implementation 913cb36: supplied avatar and final client logo, hero collision fixes, responsive process video, four social links, old about CTA removed. Backup `/root/backups/loops-www-20260914-123647.tar.gz` confirmed OK.
- Only leadgeneration shipped. CLI purge failed 10000 as before; exact-file Cloudflare MCP purge returned 200/success=true.
- Full public asset verification: 86/86 files returned 200 and matched local SHA-256 (`evidence/polish-v5/live-assets-v5.json`). This snapshot predates the subsequent user request to remove Franklin.
- Cases/covers/service pages deferred. YouTube iframe created on interaction; actual playback requires follow-up in a normal visitor browser because verification browser requested sign-in / did not render embed. Direct video fallback available.

### Final publication — 356b3ff
Franklin removed per latest user direction. Backup `/root/backups/loops-www-20260914-123825.tar.gz` confirmed OK. Exact MCP cache purge succeeded (200). Only index.html and new JS bundle changed; both public bytes match locally (live-final-delta.json), supplementing the prior full 86/86 verification. Public browser confirms zero Franklin, one Krabs, latest avatar and bundle index-DQHzreKc.js. Public YouTube embed successfully started and displayed advancing Russian subtitles (the earlier local IAB limitation did not reproduce after public load); screenshot video-live-playing.jpg. Final public page left open.

## Case format v2 — 2026-09-14
Published commit 82c77bc. NWL migrated at existing /cases/case-nwl/, direct project links and top-card navigation on /leadgeneration/. Cases generator selects structured v2 content where published; other 8 detail pages verified unchanged. Six renderer tests and deterministic rebuild passed. Dry-run only 6 public files; backup /root/backups/loops-www-20260914-130301.tar.gz. CLI purge returned 10000; exact-URL Cloudflare MCP purge succeeded. All 6 changed public files HTTP 200 and byte-identical; /cases/_content/nwl.json returns 404. Public browser confirmed lower NWL row opens new template, overflow 0; screenshot evidence/case-system-v2/live-nwl-desktop.jpg. No infrastructure or Worker change. Pushed origin/main.

## Preview + infographic deployment — 2026-09-14
Commit3f16c35 deployed with backup /root/backups/loops-www-20260914-133454.tar.gz. Five changed public files HTTP200 and byte-identical. CLI and connected Cloudflare purge both returned10000; content readback was current regardless. Public browser hit ERR_QUIC_PROTOCOL_ERROR (not a security warning); local scenario and render verified. Superseded immediately by user's supplied NWL warehouse cover below.
