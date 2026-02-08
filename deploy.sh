#!/bin/bash
set -e

echo "=== WoW Guild Sync SaaS - Deploy ==="

# Run database migrations
echo "Running database migrations..."
cd packages/database
bunx prisma migrate deploy
cd ../..

# Build and restart containers
echo "Building and starting containers..."
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Wait for health check
echo "Waiting for health check..."
sleep 10

if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "Health check passed!"
else
  echo "WARNING: Health check failed"
  docker compose -f docker-compose.prod.yml logs --tail 50
  exit 1
fi

echo "=== Deploy complete ==="
