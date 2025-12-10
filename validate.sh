#!/bin/bash

# Validation Script - Run after setup to check everything is working

echo "=========================================="
echo "  SWStarter - Validation Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service
check_service() {
    local service=$1
    local check_command=$2
    
    echo -n "Checking $service... "
    if eval "$check_command" &> /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Check if containers are running
echo "[1/8] Checking Docker containers..."
check_service "Nginx" "docker compose ps nginx | grep -q 'Up'"
check_service "PHP" "docker compose ps php | grep -q 'Up'"
check_service "MySQL" "docker compose ps mysql | grep -q 'Up'"
check_service "Redis" "docker compose ps redis | grep -q 'Up'"
check_service "Frontend" "docker compose ps frontend | grep -q 'Up'"
echo ""

# Check supervisor processes
echo "[2/8] Checking Supervisor processes..."
echo "Expected: php-fpm, laravel-queue (2 workers), laravel-schedule"
docker compose exec -T php supervisorctl status
echo ""

# Check Laravel connection to MySQL
echo "[3/8] Checking Laravel database connection..."
check_service "Database Connection" "docker compose exec -T php php artisan migrate:status"
echo ""

# Check Laravel connection to Redis
echo "[4/8] Checking Laravel Redis connection..."
check_service "Redis Connection" "docker compose exec -T php php artisan tinker --execute='echo Redis::ping();'"
echo ""

# Check storage permissions
echo "[5/8] Checking storage permissions..."
check_service "Storage writable" "docker compose exec -T php test -w /var/www/html/storage/logs"
echo ""

# Check if queue is working
echo "[6/8] Testing queue system..."
echo "Dispatching test job..."
docker compose exec -T php php artisan tinker --execute='App\Jobs\ComputeStatistics::dispatch();'
sleep 2
echo "Checking if job was processed (check queue-worker.log)..."
docker compose exec -T php tail -n 5 /var/www/html/storage/logs/queue-worker.log
echo ""

# Check scheduled tasks
echo "[7/8] Checking scheduled tasks..."
docker compose exec -T php php artisan schedule:list
echo ""

# Check API endpoints
echo "[8/8] Testing API endpoints..."
echo -n "Testing /api/v1/statistics... "
if curl -s http://localhost:8080/api/v1/statistics > /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi
echo ""

echo "=========================================="
echo "         Validation Complete!"
echo "=========================================="
echo ""
echo "If all checks passed, your application is ready!"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8080"
echo ""
