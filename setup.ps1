# SWStarter Setup Script
# Run this script to set up the application

Write-Host "=====================================" -ForegroundColor Green
Write-Host "  SWStarter - Setup Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "[1/7] Checking Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✓ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed or not running" -ForegroundColor Red
    Write-Host "Please install Docker Desktop and try again" -ForegroundColor Red
    exit 1
}

# Copy environment file
Write-Host ""
Write-Host "[2/7] Setting up environment..." -ForegroundColor Yellow
if (!(Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✓ Created backend/.env file" -ForegroundColor Green
} else {
    Write-Host "✓ backend/.env already exists" -ForegroundColor Green
}

# Build containers
Write-Host ""
Write-Host "[3/7] Building Docker containers..." -ForegroundColor Yellow
Write-Host "This may take several minutes on first run..." -ForegroundColor Cyan
docker-compose build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Containers built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to build containers" -ForegroundColor Red
    exit 1
}

# Start containers
Write-Host ""
Write-Host "[4/7] Starting containers..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Containers started successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start containers" -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host ""
Write-Host "[5/7] Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "✓ Services should be ready" -ForegroundColor Green

# Install backend dependencies
Write-Host ""
Write-Host "[6/7] Installing backend dependencies..." -ForegroundColor Yellow
docker-compose exec -T php composer install --no-interaction
docker-compose exec -T php php artisan key:generate
docker-compose exec -T php php artisan config:clear
docker-compose exec -T php php artisan cache:clear
docker-compose exec -T php php artisan migrate --force

# Fix storage permissions
Write-Host "Setting up storage permissions..." -ForegroundColor Cyan
docker-compose exec -T php chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
docker-compose exec -T php chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Verify supervisor is running
Write-Host "Checking supervisor status..." -ForegroundColor Cyan
docker-compose exec -T php supervisorctl status

Write-Host "✓ Backend setup complete" -ForegroundColor Green

# Install frontend dependencies
Write-Host ""
Write-Host "[7/7] Installing frontend dependencies..." -ForegroundColor Yellow
docker-compose exec -T frontend npm install
Write-Host "✓ Frontend setup complete" -ForegroundColor Green

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Setup Complete! 🎉" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application is running at:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs:      docker-compose logs -f" -ForegroundColor White
Write-Host "  Stop app:       docker-compose down" -ForegroundColor White
Write-Host "  Restart app:    docker-compose restart" -ForegroundColor White
Write-Host ""
