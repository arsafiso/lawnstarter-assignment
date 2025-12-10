# Diagnostic Script - Laravel Workers

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Diagnostic Script - Laravel Workers" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/5] Testing manual queue:work command..." -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray
docker-compose exec php php artisan queue:work redis --sleep=3 --tries=3 --once
Write-Host ""

Write-Host "[2/5] Testing manual schedule:work command..." -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray
Write-Host "Running for 5 seconds..." -ForegroundColor Cyan
$job = Start-Job { docker-compose exec php php artisan schedule:work }
Start-Sleep -Seconds 5
Stop-Job $job
Remove-Job $job
Write-Host ""

Write-Host "[3/5] Checking Redis connection..." -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray
docker-compose exec php php artisan tinker --execute="echo 'Redis: ' . Redis::ping();"
Write-Host ""

Write-Host "[4/5] Checking database connection..." -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray
docker-compose exec php php artisan migrate:status
Write-Host ""

Write-Host "[5/5] Checking storage permissions..." -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray
Write-Host "Storage directory:" -ForegroundColor Cyan
docker-compose exec php ls -la /var/www/html/storage
Write-Host ""
Write-Host "Storage logs directory:" -ForegroundColor Cyan
docker-compose exec php ls -la /var/www/html/storage/logs
Write-Host ""
Write-Host "Bootstrap cache directory:" -ForegroundColor Cyan
docker-compose exec php ls -la /var/www/html/bootstrap/cache
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Checking Laravel logs for errors..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
docker-compose exec php tail -n 30 /var/www/html/storage/logs/laravel.log
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Checking if worker log files exist..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
docker-compose exec php test -f /var/www/html/storage/logs/queue-worker.log
if ($LASTEXITCODE -eq 0) {
    Write-Host "queue-worker.log exists" -ForegroundColor Green
} else {
    Write-Host "queue-worker.log does NOT exist" -ForegroundColor Red
}
docker-compose exec php test -f /var/www/html/storage/logs/schedule-worker.log
if ($LASTEXITCODE -eq 0) {
    Write-Host "schedule-worker.log exists" -ForegroundColor Green
} else {
    Write-Host "schedule-worker.log does NOT exist" -ForegroundColor Red
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Diagnostics Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
