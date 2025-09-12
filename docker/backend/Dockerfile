# Combined Nginx + PHP-FPM (Laravel) container
FROM php:8.2-fpm-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libxml2-dev \
    procps \
    curl \
  && docker-php-ext-install pdo pdo_mysql mbstring zip gd xml \
  && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j$(nproc) pdo pdo_mysql zip gd intl mbstring xml

# Configure PHP
COPY ./docker/backend/php/php.ini /usr/local/etc/php/php.ini

# Configure Nginx
COPY ./docker/backend/nginx/conf.d/ /etc/nginx/conf.d/
COPY ./docker/backend/nginx/nginx.conf /etc/nginx/nginx.conf

# Setup working directory
WORKDIR /var/www/html

# Supervisor configuration to run both php-fpm and nginx
COPY ./docker/backend/php/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose Nginx port
EXPOSE 80

# Start supervisord
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 