#!/bin/sh
set -e

# Ensure Laravel storage skeleton exists in the mounted volume
mkdir -p \
  storage/app/public \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/framework/testing \
  storage/logs

# Rebuild caches against the live env (env is only known at runtime)
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Run migrations (idempotent). Set MIGRATE_ON_BOOT=false to skip.
if [ "${MIGRATE_ON_BOOT:-true}" = "true" ]; then
  php artisan migrate --force
fi

# Create public storage symlink (no-op if already linked)
php artisan storage:link || true

exec "$@"
