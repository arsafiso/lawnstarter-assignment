#!/bin/bash

echo "=========================================="
echo "  Diagnostic Script - Laravel Workers"
echo "=========================================="
echo ""

echo "[1/5] Testing manual queue:work command..."
echo "---"
docker compose exec php php artisan queue:work redis --sleep=3 --tries=3 --once
echo ""

echo "[2/5] Testing manual schedule:work command..."
echo "---"
timeout 5 docker compose exec php php artisan schedule:work || echo "Schedule work timed out (normal)"
echo ""

echo "[3/5] Checking Redis connection..."
echo "---"
docker compose exec php php artisan tinker --execute="echo 'Redis: ' . Redis::ping();"
echo ""

echo "[4/5] Checking database connection..."
echo "---"
docker compose exec php php artisan migrate:status
echo ""

echo "[5/5] Checking storage permissions..."
echo "---"
echo "Storage directory:"
docker compose exec php ls -la /var/www/html/storage
echo ""
echo "Storage logs directory:"
docker compose exec php ls -la /var/www/html/storage/logs
echo ""
echo "Bootstrap cache directory:"
docker compose exec php ls -la /var/www/html/bootstrap/cache
echo ""

echo "=========================================="
echo "  Checking Laravel logs for errors..."
echo "=========================================="
docker compose exec php tail -n 30 /var/www/html/storage/logs/laravel.log
echo ""

echo "=========================================="
echo "  Checking if queue-worker.log exists..."
echo "=========================================="
docker compose exec php test -f /var/www/html/storage/logs/queue-worker.log && echo "File exists" || echo "File does NOT exist"
docker compose exec php test -f /var/www/html/storage/logs/schedule-worker.log && echo "File exists" || echo "File does NOT exist"
echo ""

echo "=========================================="
echo "  Diagnostics Complete!"
echo "=========================================="
