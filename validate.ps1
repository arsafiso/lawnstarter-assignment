# Validation Script - Run after setup to check everything is working

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  SWStarter - Validation Script           " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Function to check service
function Check-Service {
    param(
        [string]$ServiceName,
        [scriptblock]$CheckCommand
    )
    
    Write-Host "Checking $ServiceName... " -NoNewline
    try {
        $result = & $CheckCommand
        if ($LASTEXITCODE -eq 0 -or $result) {
            Write-Host "✓ OK" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ FAILED" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ FAILED" -ForegroundColor Red
        return $false
    }
}

# Check if containers are running
Write-Host "[1/8] Checking Docker containers..." -ForegroundColor Yellow
Check-Service "Nginx" { docker-compose ps nginx | Select-String "Up" }
Check-Service "PHP" { docker-compose ps php | Select-String "Up" }
Check-Service "MySQL" { docker-compose ps mysql | Select-String "Up" }
Check-Service "Redis" { docker-compose ps redis | Select-String "Up" }
Check-Service "Frontend" { docker-compose ps frontend | Select-String "Up" }
Write-Host ""

# Check supervisor processes
Write-Host "[2/8] Checking Supervisor processes..." -ForegroundColor Yellow
Write-Host "Expected: php-fpm, laravel-queue (2 workers), laravel-schedule" -ForegroundColor Cyan
docker-compose exec -T php supervisorctl status
Write-Host ""

# Check Laravel connection to MySQL
Write-Host "[3/8] Checking Laravel database connection..." -ForegroundColor Yellow
Check-Service "Database Connection" { docker-compose exec -T php php artisan migrate:status }
Write-Host ""

# Check Laravel connection to Redis
Write-Host "[4/8] Checking Laravel Redis connection..." -ForegroundColor Yellow
Check-Service "Redis Connection" { docker-compose exec -T php php artisan tinker --execute="echo Redis::ping();" }
Write-Host ""

# Check storage permissions
Write-Host "[5/8] Checking storage permissions..." -ForegroundColor Yellow
Check-Service "Storage writable" { docker-compose exec -T php test -w /var/www/html/storage/logs }
Write-Host ""

# Check if queue is working
Write-Host "[6/8] Testing queue system..." -ForegroundColor Yellow
Write-Host "Dispatching test job..." -ForegroundColor Cyan
docker-compose exec -T php php artisan tinker --execute="App\Jobs\ComputeStatistics::dispatch();"
Start-Sleep -Seconds 2
Write-Host "Checking if job was processed (check queue-worker.log)..." -ForegroundColor Cyan
docker-compose exec -T php tail -n 5 /var/www/html/storage/logs/queue-worker.log
Write-Host ""

# Check scheduled tasks
Write-Host "[7/8] Checking scheduled tasks..." -ForegroundColor Yellow
docker-compose exec -T php php artisan schedule:list
Write-Host ""

# Check API endpoints
Write-Host "[8/8] Testing API endpoints..." -ForegroundColor Yellow
Write-Host "Testing /api/v1/statistics... " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/statistics" -UseBasicParsing
    Write-Host "✓ OK" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Validation Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "If all checks passed, your application is ready!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access points:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor White
Write-Host ""
