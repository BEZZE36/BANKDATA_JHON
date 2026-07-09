#!/bin/bash
set -e

CUSTOM_DIR="bankdata"
PROJECT_DIR="bankdata-laravel"

echo "=== LANGKAH 1: Membuat instalasi Laravel 11 baru ==="
if ! command -v composer &> /dev/null; then
    echo "[ERROR] Composer tidak ditemukan. Install dulu dari https://getcomposer.org/"
    exit 1
fi

if [ -d "$PROJECT_DIR" ]; then
    echo "[SKIP] Folder $PROJECT_DIR sudah ada, lewati instalasi Laravel baru."
else
    echo "Menonaktifkan sementara pemblokiran advisory keamanan Composer..."
    composer config --global policy.advisories.block false
    composer create-project laravel/laravel:^11.0 "$PROJECT_DIR"
fi

echo ""
echo "=== LANGKAH 2: Menyalin file custom Bank Data ==="
if [ ! -d "$CUSTOM_DIR" ]; then
    echo "[ERROR] Folder '$CUSTOM_DIR' tidak ditemukan di sebelah script ini."
    exit 1
fi

cp -R "$CUSTOM_DIR/app/Models/." "$PROJECT_DIR/app/Models/"
cp -R "$CUSTOM_DIR/app/Http/Controllers/." "$PROJECT_DIR/app/Http/Controllers/"
cp -R "$CUSTOM_DIR/app/Http/Middleware/." "$PROJECT_DIR/app/Http/Middleware/"
cp -R "$CUSTOM_DIR/app/Http/Requests/." "$PROJECT_DIR/app/Http/Requests/"
cp -R "$CUSTOM_DIR/database/migrations/." "$PROJECT_DIR/database/migrations/"
cp -R "$CUSTOM_DIR/database/seeders/." "$PROJECT_DIR/database/seeders/"
cp -R "$CUSTOM_DIR/resources/views/." "$PROJECT_DIR/resources/views/"
cp "$CUSTOM_DIR/routes/web.php" "$PROJECT_DIR/routes/web.php"
cp "$CUSTOM_DIR/bootstrap/app.php" "$PROJECT_DIR/bootstrap/app.php"

echo ""
echo "=== LANGKAH 3: Install package tambahan ==="
cd "$PROJECT_DIR"
composer require spatie/laravel-permission spatie/laravel-activitylog barryvdh/laravel-dompdf maatwebsite/excel pragmarx/google2fa-laravel

echo ""
echo "=== LANGKAH 4: Publish migration package pihak ketiga ==="
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"

echo ""
echo "=== LANGKAH 5: Konfigurasi .env ==="
if [ ! -f ".env" ]; then
    cp .env.example .env
fi
if ! grep -q "APP_KEY=base64" .env; then
    php artisan key:generate
fi

echo ""
echo "============================================================"
echo " SETENGAH JALAN LAGI - Lakukan manual sebelum lanjut:"
echo " 1. Buka file .env di $PROJECT_DIR, isi DB_DATABASE,"
echo "    DB_USERNAME, DB_PASSWORD sesuai MySQL kamu."
echo " 2. Pastikan database 'bankdata' sudah dibuat."
echo " 3. Tekan ENTER untuk lanjut migrasi database."
echo "============================================================"
read -r

php artisan migrate
php artisan db:seed --class=Database\\Seeders\\RoleAndAdminSeeder
php artisan storage:link

echo ""
echo "============================================================"
echo " SELESAI! Menjalankan server..."
echo " Login: [email protected] / GantiSegera!2026"
echo " (WAJIB ganti password setelah login pertama)"
echo "============================================================"
php artisan serve
