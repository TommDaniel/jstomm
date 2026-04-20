#!/usr/bin/env bash
# Dump Postgres to a timestamped file. Run from the project root.
# Cron example (daily at 03:00):
#   0 3 * * * cd /opt/vo-70-anos && ./scripts/backup-db.sh >> /var/log/vo-backup.log 2>&1

set -euo pipefail

cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-/opt/vo-70-anos/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

# shellcheck disable=SC1091
set -a; source .env.prod; set +a

OUT="$BACKUP_DIR/vo_app-$TIMESTAMP.sql.gz"

echo "▶ Dumping $DB_DATABASE to $OUT ..."
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$DB_USERNAME" -d "$DB_DATABASE" --no-owner --no-privileges \
  | gzip -9 > "$OUT"

echo "▶ Pruning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -maxdepth 1 -name 'vo_app-*.sql.gz' -mtime +"$RETENTION_DAYS" -delete

echo "✓ Backup done: $(du -h "$OUT" | cut -f1) → $OUT"
