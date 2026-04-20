FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    git

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        gd \
        zip \
        exif \
        opcache \
        pcntl

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Configure PHP
COPY php.ini /usr/local/etc/php/conf.d/app.ini

WORKDIR /var/www/html

# Install dependencies first (layer caching)
COPY backend/composer.json backend/composer.lock* ./
RUN composer install --no-scripts --no-autoloader --prefer-dist

# Copy application
COPY backend/ .

# Complete composer setup
RUN composer dump-autoload --optimize

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
