#!/bin/bash
# Deploy loops.uz static site: local repo → server /var/www/loops, then purge Cloudflare cache.
# Usage: bash scripts/deploy.sh [--dry-run]
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVER="adstat-deploy"            # ~/.ssh/config alias (CF tunnel + service token)
DEST="/var/www/loops"
ZONE_ID="f41fb8f4fbfda243650e27e0f7db5bc8"   # CF zone: loops.uz
CF_ENV="$HOME/.cloudflare-loops.env"         # must define CF_LOOPS_TOKEN (Cache Purge + DNS)
DRY="${1:-}"

EXCLUDES=(
  --exclude='.git' --exclude='.gitignore' --exclude='.DS_Store'
  --exclude='README*' --exclude='DNS_SETUP.md' --exclude='*.md'
  --exclude='CLAUDE.md' --exclude='netlify.toml' --exclude='vercel.json' --exclude='.htaccess'
  --exclude='scripts/' --exclude='.agent/' --exclude='_handoff/'
  --exclude='worker/' --exclude='wrangler.toml' --exclude='node_modules/'
  --exclude='.wrangler/' --exclude='package.json' --exclude='package-lock.json'
  --exclude='*.backup-*' --exclude='index.old.html'
  --exclude='*.resolved' --exclude='*.resolved.*' --exclude='*.metadata.json'
  --exclude='api/'        # secrets live server-side; PHP not executed. Deploy api manually.
)

RSYNC_OPTS=(-rcv --delete-after --no-perms --no-owner --no-group)
if [ "$DRY" = "--dry-run" ]; then
  RSYNC_OPTS+=(--dry-run); echo ">>> DRY RUN (no changes) <<<"
fi

# 1) Backup current server state
if [ "$DRY" != "--dry-run" ]; then
  echo "[1/3] Backing up server site..."
  ssh -o BatchMode=yes "$SERVER" 'tar czf /root/backups/loops-www-$(date +%Y%m%d-%H%M%S).tar.gz -C /var/www loops' \
    && echo "      backup OK"
fi

# 2) Sync files
echo "[2/3] Syncing $REPO_DIR/ → $SERVER:$DEST/"
rsync "${RSYNC_OPTS[@]}" "${EXCLUDES[@]}" -e "ssh -o BatchMode=yes" "$REPO_DIR/" "$SERVER:$DEST/"

# 3) Purge Cloudflare cache (so users get fresh content, not stale edge copies)
if [ "$DRY" = "--dry-run" ]; then
  echo "[3/3] (dry-run) would purge Cloudflare cache for loops.uz"
elif [ -f "$CF_ENV" ]; then
  # shellcheck disable=SC1090
  . "$CF_ENV"
  echo "[3/3] Purging Cloudflare cache..."
  resp=$(curl -sS -X POST \
    -H "Authorization: Bearer ${CF_LOOPS_TOKEN}" -H "Content-Type: application/json" \
    "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
    --data '{"purge_everything":true}')
  echo "$resp" | grep -q '"success":true' \
    && echo "      cache purged ✓" \
    || { echo "      cache purge FAILED: $resp"; echo "      (site is deployed; purge manually in CF dashboard)"; }
else
  echo "[3/3] SKIP cache purge — $CF_ENV not found."
  echo "      Create it with CF_LOOPS_TOKEN=... (Zone.Cache Purge on loops.uz), or purge manually in CF dashboard."
fi

echo "Done."
