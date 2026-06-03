# loops.uz — Guide for AI Sessions

This repo (`~/loops.uz`) is the **single source of truth** for the loops.uz website. Read this before reading, editing, or deploying. Any Claude Code / Cursor / agent session opening this folder should follow it.

---

## What this is

Static marketing site — **LOOPS SYSTEM** (таргет + AI-агент для продаж, Ташкент). Plain HTML with large inline `<style>` blocks + small vanilla JS. **No build step.** What's in the repo IS what ships.

Two PHP files in `api/` (`chat.php` = OpenAI proxy, `telegram.php` = lead form). ⚠️ PHP is currently **NOT executed** on the server (nginx has no FastCGI handler), so these are effectively inert. Don't assume the AI bot / form backend works until that's fixed.

---

## Layout

```
index.html          ← homepage (~194 KB, everything inline)
404.html
cases/              11 case studies (basalt, bts, chery, dco, estate, feedup,
                    izzy, legal, nwl, tak, viamed, clinic) + index.html
articles/           6 articles + index.html
target/  ai-bot/    SEO landing pages (clones of home)
css/  js/  images/  assets
api/                chat.php, telegram.php  (NOT deployed by the script — secrets)
llms.txt robots.txt sitemap.xml
scripts/deploy.sh   ← the deploy tool
```

Files NOT shipped to the server (dev-only, auto-excluded by deploy): `README*`, `*.md`, `CLAUDE.md`, `netlify.toml`, `vercel.json`, `.htaccess`, `scripts/`, `.agent/`, `_handoff/`, backups, `api/`.

---

## How to READ / understand before changing

- Start with `index.html` — it's the bulk. Sections are anchored: `#cases`, `#content`, `#quiz-nav`.
- Cases and articles are independent static pages; editing one doesn't affect others.
- `sitemap.xml` and `robots.txt` are hand-maintained — update sitemap when adding pages.
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
The script: (1) tars the current server site into `/root/backups/`, (2) rsyncs repo→server excluding dev files, (3) purges Cloudflare cache so users get fresh content.

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

## Rules

1. **Never edit `/var/www/loops` directly** — always repo → commit → deploy. The server must never be ahead of git.
2. **Always `git push`** after deploying — keep repo, server, and GitHub identical.
3. **Don't commit new secrets** — `api/*.php` historically held tokens (rotated, now dead). If you wire up PHP, put secrets in env/config outside git.
4. **Update `sitemap.xml`** when adding/removing pages.
5. **Purge cache after every deploy** (the script does this automatically; if it skips for a missing token, purge manually in the CF dashboard or users see stale pages).
6. **Don't touch the adstat stack** — loops.uz shares the VPS with the Adstat app (`/root/adstat`, Docker). They're unrelated; stay in `/var/www/loops`.
