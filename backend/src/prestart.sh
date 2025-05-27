#!/usr/bin/env sh

set -e

echo "Run migrations..."
cd ./src
alembic upgrade head
cd ..
echo "Migrations applied!"

exec "$@"