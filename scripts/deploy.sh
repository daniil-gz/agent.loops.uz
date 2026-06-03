#!/bin/bash
# Deploy loops.uz static site: local repo → server /var/www/loops
# Usage: bash scripts/deploy.sh [--dry-run]
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVER="adstat-deploy"           # ~/.ssh/config alias (CF tunnel + service token)
DEST="/var/www/loops"
DRY="${1:-}"

EXCLUDES=(
  --exclude='.git' --exclude='.gitignore' --exclude='.DS_Store'
  --exclude='README*' --exclude='DNS_SETUP.md' --exclude='*.md'
  --exclude='netlify.toml' --exclude='vercel.json' --exclude='.htaccess'
  --exclude='scripts/' --exclude='.agent/' --exclude='_handoff/'
  --exclude='*.backup-*' --exclude='index.old.html'
  --exclude='*.resolved' --exclude='*.resolved.*' --exclude='*.metadata.json'
  --exclude='api/'       # secrets live server-side; PHP not executed here. Deploy api separately.
)

RSYNC_OPTS=(-rcv --delete-after --no-perms --no-owner --no-group)
[ "$DRY" = "--dry-run" ] && RSYNC_OPTS+=(--dry-run) && echo ">>> DRY RUN (no changes) <<<"

echo "Deploying $REPO_DIR/ → $SERVER:$DEST/"
rsync "${RSYNC_OPTS[@]}" "${EXCLUDES[@]}" -e "ssh -o BatchMode=yes" "$REPO_DIR/" "$SERVER:$DEST/"
echo "Done."
