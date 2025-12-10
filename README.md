# SWStarter - Star Wars API Search Application

A full-stack web application that provides a user-friendly interface to search and explore Star Wars characters and movies using the SWAPI (Star Wars API). Built with Laravel backend and React frontend, featuring asynchronous statistics computation and caching for optimal performance.

## 🌟 Features

### Core Functionality
- **Character Search**: Search for Star Wars characters with real-time results
- **Movie Information**: Browse and view detailed information about Star Wars films
- **Character Details**: View comprehensive character information including:
  - Physical attributes (height, mass, hair color, eye color, etc.)
  - Associated movies
  - Homeworld information
- **Movie Details**: Access complete movie information with:
  - Episode details
  - Opening crawl text
  - Associated characters

### Technical Features
- **API Rate Limiting**: 60 requests per minute to prevent abuse
- **Response Caching**: 1-hour cache for SWAPI responses to improve performance
- **Search Query Tracking**: All searches are logged for analytics
- **Asynchronous Statistics**: Background job processing with Redis queue
- **Statistics Dashboard**: Real-time analytics on:
  - Most popular search terms
  - Average response times
  - Total searches by type
  - Search trends over time
- **Error Handling**: Robust error handling with automatic retries
- **Docker Support**: Fully containerized application for easy deployment

## 🏗️ Architecture

### Backend (Laravel 12)
- **Framework**: Laravel 12 with PHP 8.2
- **Database**: MySQL 8.0
- **Queue System**: Redis with Supervisor for background job processing
- **API Client**: Guzzle HTTP client for SWAPI integration
- **Web Server**: Nginx with PHP-FPM

### Frontend (React)
- **Framework**: React 18 with React Router
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Development Server**: Vite dev server on port 3000

### Infrastructure
- **Containerization**: Docker with Docker Compose
- **Services**: 
  - Nginx (port 8080)
  - PHP-FPM with Supervisor
  - MySQL (port 3307)
  - Redis (port 6380)
  - React Frontend (port 3000)

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (for cloning the repository)

### Verify Installation

```bash
docker --version
docker compose version
```

> **Note on Docker Compose Commands:**  
> This documentation uses `docker compose` (Docker Compose V2, integrated into Docker CLI).  
> If you're using the standalone version, replace `docker compose` with `docker-compose` in all commands.  
> Example: `docker compose up` → `docker-compose up`

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lawnstarter-assignment
```

### 2. Environment Configuration

The application uses Docker environment variables defined in `docker-compose.yml`. The default configuration includes:

- **Database**: `swstarter` (user: `swstarter`, password: `secret`)
- **Redis**: Running on default port 6379 (exposed as 6380)

The `.env` file for Laravel is automatically created from `.env.example` during the Docker build process.

### 3. Build and Start the Application

```bash
# Build and start all containers
docker compose up -d --build

After execution, run the command below to check if the `swstarter_php` container is running:

```bash
docker ps
```

- If the `swstarter_php` container is running, everything is set and the application is ready to use.
- If it is not running, execute:

```bash
docker compose up -d
```

This will start all required containers and ensure the application is working correctly.
```

This command will:
- Build the PHP-FPM container with all dependencies
- Install Composer dependencies
- Generate Laravel application key
- Run database migrations
- Start the queue worker for background jobs
- Build and start the React frontend
- Start Nginx web server
- Initialize MySQL and Redis containers

**First-time build typically takes 3-5 minutes.**

### 4. Verify Installation

Once all containers are running, verify each service:

```bash
# Check container status
docker compose ps

# All containers should show "Up" or "healthy" status
```

### 5. Access the Application

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/v1
- **MySQL Database**: localhost:3307
- **Redis**: localhost:6380

## 🧪 Testing the Application

### Frontend Testing

1. Open your browser and navigate to http://localhost:3000
2. Use the search bar to search for Star Wars characters (e.g., "Luke", "Vader", "Leia")
3. Click on a character to view detailed information
4. Browse movies and view their details
5. Check the statistics section for search analytics

### API Testing

You can test the API endpoints directly using curl or tools like Postman:

```bash
# Search for people
curl "http://localhost:8080/api/v1/search" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "luke", "type": "people"}'

# Get person details by ID
curl "http://localhost:8080/api/v1/people/1"

# Get film details by ID
curl "http://localhost:8080/api/v1/films/1"

# Get statistics
curl "http://localhost:8080/api/v1/statistics"
```

## 📁 Project Structure

```
lawnstarter-assignment/
├── backend/                    # Laravel backend application
│   ├── app/
│   │   ├── Exceptions/        # Custom exception classes
│   │   ├── Http/
│   │   │   ├── Controllers/   # API controllers
│   │   │   ├── Middleware/    # Custom middleware
│   │   │   ├── Requests/      # Form request validation
│   │   │   └── Resources/     # API resources
│   │   ├── Jobs/              # Queue jobs (statistics computation)
│   │   ├── Models/            # Eloquent models
│   │   └── Services/          # Business logic services
│   ├── config/                # Configuration files
│   ├── database/
│   │   └── migrations/        # Database migrations
│   ├── routes/
│   │   └── api.php           # API routes
│   └── composer.json         # PHP dependencies
│
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   └── App.jsx           # Main app component
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
│
├── docker/                    # Docker configuration
│   ├── nginx/
│   │   └── default.conf      # Nginx server configuration
│   └── php/
│       ├── Dockerfile        # PHP-FPM Dockerfile
│       └── supervisord.conf  # Supervisor configuration for queue workers
│
└── docker-compose.yml        # Docker Compose orchestration
```

## 🔧 Configuration

### Backend Configuration

Key configuration files in `backend/config/`:

- `swapi.php`: SWAPI base URL and settings
- `queue.php`: Redis queue configuration
- `database.php`: MySQL connection settings
- `cache.php`: Redis cache configuration

### Environment Variables

The following environment variables can be modified in `docker-compose.yml`:

```yaml
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=swstarter
DB_USERNAME=swstarter
DB_PASSWORD=secret

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8080/api
```

## 🛠️ Common Commands

### Container Management

```bash
# Start all containers
docker compose up

# Start in detached mode (background)
docker compose up -d

# Stop all containers
docker compose down

# Rebuild containers
docker compose up --build

# View container logs
docker compose logs -f

# View specific service logs
docker compose logs -f php
docker compose logs -f frontend
```

### Backend Commands

```bash
# Access PHP container shell
docker exec -it swstarter_php bash

# Run artisan commands
docker exec swstarter_php php artisan migrate
docker exec swstarter_php php artisan cache:clear
docker exec swstarter_php php artisan queue:work

# View Laravel logs
docker exec swstarter_php tail -f storage/logs/laravel.log
```

### Database Commands

```bash
# Access MySQL shell
docker exec -it swstarter_mysql mysql -u swstarter -psecret swstarter

# Backup database
docker exec swstarter_mysql mysqldump -u swstarter -psecret swstarter > backup.sql

# Restore database
docker exec -i swstarter_mysql mysql -u swstarter -psecret swstarter < backup.sql
```

### Redis Commands

```bash
# Access Redis CLI
docker exec -it swstarter_redis redis-cli

# Monitor Redis commands
docker exec -it swstarter_redis redis-cli MONITOR

# Flush all Redis data
docker exec -it swstarter_redis redis-cli FLUSHALL
```

## 📊 API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Rate Limiting
All endpoints are rate-limited to **60 requests per minute**.

### Endpoints

#### 1. Search People
**POST** `/search`

Search for Star Wars characters.

**Request Body:**
```json
{
  "query": "luke",
  "type": "people"
}
```

**Response:**
```json
{
  "data": {
    "count": 1,
    "results": [
      {
        "name": "Luke Skywalker",
        "height": "172",
        "mass": "77",
        "hair_color": "blond",
        "eye_color": "blue",
        "birth_year": "19BBY",
        "gender": "male",
        "url": "https://swapi.py4e.com/api/people/1/"
      }
    ]
  }
}
```

#### 2. Get Person Details
**GET** `/people/{id}`

Get detailed information about a specific character.

**Response:**
```json
{
  "data": {
    "name": "Luke Skywalker",
    "height": "172",
    "mass": "77",
    "films": [...],
    "homeworld": "https://swapi.py4e.com/api/planets/1/"
  }
}
```

#### 3. Get Film Details
**GET** `/films/{id}`

Get detailed information about a specific movie.

**Response:**
```json
{
  "data": {
    "title": "A New Hope",
    "episode_id": 4,
    "opening_crawl": "It is a period of civil war...",
    "director": "George Lucas",
    "characters": [...]
  }
}
```

#### 4. Get Statistics
**GET** `/statistics`

Retrieve aggregated search statistics.

**Response:**
```json
{
  "data": {
    "total_searches": 150,
    "most_popular_terms": [
      {"search_term": "luke", "count": 25},
      {"search_term": "vader", "count": 20}
    ],
    "average_response_time": 0.45
  }
}
```

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker compose logs php

# Common issue: Port already in use
# Solution: Stop conflicting services or change ports in docker-compose.yml
```

### Database Connection Errors

```bash
# Ensure MySQL container is healthy
docker compose ps

# Check MySQL logs
docker compose logs mysql

# Verify database credentials in docker-compose.yml
```

### Queue Jobs Not Processing

```bash
# Check if supervisor is running
docker exec swstarter_php supervisorctl status

# Restart queue worker
docker exec swstarter_php supervisorctl restart laravel-worker:*

# Check queue worker logs
docker exec swstarter_php tail -f /var/log/supervisor/laravel-worker.log
```

### Frontend Not Loading

```bash
# Check frontend container logs
docker compose logs frontend

# Verify API URL in frontend environment
# Should be: http://localhost:8080/api
```

### Cache Issues

```bash
# Clear Laravel cache
docker exec swstarter_php php artisan cache:clear
docker exec swstarter_php php artisan config:clear

# Clear Redis cache
docker exec swstarter_redis redis-cli FLUSHALL
```

## 🧹 Cleanup

To completely remove all containers, volumes, and data:

```bash
# Stop and remove containers, networks
docker compose down

# Remove all volumes (WARNING: This deletes all data)
docker compose down -v

# Remove all images
docker compose down --rmi all
```
