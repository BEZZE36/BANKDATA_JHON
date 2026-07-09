#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install composer dependencies
composer install --no-dev --optimize-autoloader

# Clear caches
php artisan optimize:clear

# Run database migrations
# php artisan migrate --force
