FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    supervisor \
    default-mysql-client

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application code
COPY backend/ /var/www/html/

# Copy supervisor configuration
COPY docker/php/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create necessary directories
RUN touch /var/www/html/storage/logs/laravel.log \
    && touch /var/www/html/storage/logs/queue-worker.log \
    && touch /var/www/html/storage/logs/schedule-worker.log \
    && mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/cache/data \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html

# Setup environment and dependencies
RUN if [ ! -f ".env" ]; then cp .env.example .env; fi
RUN composer install --no-interaction
RUN php artisan key:generate
RUN php artisan config:clear
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 777 /var/www/html/storage/logs \
    && chmod -R 777 /var/www/html/storage/framework

# Create supervisor log directory
RUN mkdir -p /var/log/supervisor

# Expose port 9000 and start supervisor
EXPOSE 9000
CMD ["sh", "-c", "sleep 10 && php artisan migrate --force && /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf"]