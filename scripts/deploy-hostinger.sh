#!/usr/bin/env bash
# Deploy frontend to Hostinger shared hosting (public_html)
# Usage: ./scripts/deploy-hostinger.sh [user@host] [remote_path]
# Example: ./scripts/deploy-hostinger.sh u123456789@srv1.hostinger.com ~/public_html

set -euo pipefail

REMOTE="${1:-}"
REMOTE_PATH="${2:-~/public_html}"
FRONTEND_DIR="$(cd "$(dirname "$0")/../frontend" && pwd)"

# ── Validate ──────────────────────────────────────────────────────────────────
if [[ -z "$REMOTE" ]]; then
  echo "Usage: $0 user@host [remote_path]"
  exit 1
fi

if [[ ! -f "$FRONTEND_DIR/.env.production" ]]; then
  echo "ERROR: $FRONTEND_DIR/.env.production not found."
  echo "Copy .env.production.example and fill in your VITE_MAPBOX_TOKEN."
  exit 1
fi

# ── Build ─────────────────────────────────────────────────────────────────────
echo "▶ Building frontend..."
cd "$FRONTEND_DIR"
npm ci --silent
NODE_ENV=production npm run build

# ── Upload ────────────────────────────────────────────────────────────────────
echo "▶ Uploading dist/ to $REMOTE:$REMOTE_PATH ..."
rsync -avz --delete \
  --exclude='.git' \
  "$FRONTEND_DIR/dist/" \
  "$REMOTE:$REMOTE_PATH/"

echo "✓ Deploy complete → $REMOTE:$REMOTE_PATH"
