#!/bin/bash

# SWStarter Setup Script for Mac/Linux
# Run this script to set up the application

echo "====================================="
echo "     SWStarter - Setup Script"
echo "====================================="
echo ""

# Check if Docker is running
echo "[1/7] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed"
    echo "Please install Docker Desktop and try again"
    exit 1
fi
echo "✓ Docker is installed"

# Copy environment file
echo ""
echo "[2/7] Setting up environment..."
if [ ! -f "backend/.env" ]; then
    cp "backend/.env.example" "backend/.env"
    echo "✓ Created backend/.env file"
else
    echo "✓ backend/.env already exists"
fi

# Build containers
echo ""
echo "[3/7] Building Docker containers..."
echo "This may take several minutes on first run..."
docker compose build --no-cache
if [ $? -eq 0 ]; then
    echo "✓ Containers built successfully"
else
    echo "✗ Failed to build containers"
    exit 1
fi

# Start containers
echo ""

echo "[4/7] Starting containers..."
docker compose up -d
if [ $? -eq 0 ]; then
    echo "✓ Containers started successfully"
else
    echo "✗ Failed to start containers"
    exit 1
fi

# Wait for services to be ready
echo ""
echo "[5/7] Waiting for services to be ready..."
sleep 10
echo "✓ Services should be ready"

# Install backend dependencies
echo ""
echo "[6/7] Installing backend dependencies..."
docker compose exec -T php composer install --no-interaction
docker compose exec -T php php artisan key:generate
docker compose exec -T php php artisan config:clear
docker compose exec -T php php artisan cache:clear
docker compose exec -T php php artisan migrate --force

# Fix storage permissions
echo "Setting up storage permissions..."
docker compose exec -T php chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
docker compose exec -T php chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "✓ Backend setup complete"

# Install frontend dependencies
echo ""
echo "[7/7] Installing frontend dependencies..."
docker compose exec -T frontend npm install
echo "✓ Frontend setup complete"

echo ""
echo "====================================="
echo "         Setup Complete! 🎉"
echo "====================================="
echo ""
echo "Application is running at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8080"
echo ""
echo "Useful commands:"
echo "  View logs:      docker compose logs -f"
echo "  Stop app:       docker compose down"
echo "  Restart app:    docker compose restart"
echo ""
