#!/usr/bin/env bash
# Deploy on the VPS: pulls latest code and rebuilds the stack.
# Run from the project root on the server (e.g. /opt/vo-70-anos).
#   ./scripts/deploy-vps.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env.prod ]]; then
  echo "ERROR: .env.prod not found. Copy .env.prod.example and fill in secrets."
  exit 1
fi

echo "▶ Pulling latest code..."
git pull --ff-only

echo "▶ Building and starting containers..."
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build --remove-orphans

echo "▶ Pruning dangling images..."
docker image prune -f

echo "▶ Container status:"
docker compose -f docker-compose.prod.yml ps

echo "✓ Deploy complete → https://jstomm.com"
