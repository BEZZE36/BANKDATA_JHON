@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  Install otomatis: Laravel 11 + file custom Bank Data
REM  Cara pakai: taruh script ini SATU LEVEL DI ATAS folder
REM  "bankdata" hasil ekstrak zip, lalu double-click.
REM ============================================================

REM Paksa direktori kerja = lokasi file .bat ini sendiri,
REM supaya tetap benar walau dijalankan dari shortcut/CMD lain.
cd /d "%~dp0"
echo Bekerja di folder: %cd%

set CUSTOM_DIR=bankdata
set PROJECT_DIR=bankdata-laravel

echo.
echo === LANGKAH 1: Membuat instalasi Laravel 11 baru ===
where composer >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Composer tidak ditemukan di PATH. Install dulu dari https://getcomposer.org/
    pause
    exit /b 1
)

if exist "%PROJECT_DIR%" (
    echo [SKIP] Folder %PROJECT_DIR% sudah ada, lewati instalasi Laravel baru.
) else (
    echo Menonaktifkan sementara pemblokiran advisory keamanan Composer...
    composer config --global policy.advisories.block false

    composer create-project laravel/laravel:^11.0 %PROJECT_DIR%
    if errorlevel 1 (
        echo [ERROR] Gagal membuat project Laravel. Cek koneksi internet / Composer.
        pause
        exit /b 1
    )
)

echo.
echo === LANGKAH 2: Menyalin file custom Bank Data ===
if not exist "%CUSTOM_DIR%" (
    echo [ERROR] Folder "%CUSTOM_DIR%" tidak ditemukan di sebelah script ini.
    echo Pastikan hasil ekstrak zip bernama "bankdata" ada di folder yang sama dengan install.bat
    pause
    exit /b 1
)

xcopy "%CUSTOM_DIR%\app\Models" "%PROJECT_DIR%\app\Models\" /E /Y /I
xcopy "%CUSTOM_DIR%\app\Http\Controllers" "%PROJECT_DIR%\app\Http\Controllers\" /E /Y /I
xcopy "%CUSTOM_DIR%\app\Http\Middleware" "%PROJECT_DIR%\app\Http\Middleware\" /E /Y /I
xcopy "%CUSTOM_DIR%\app\Http\Requests" "%PROJECT_DIR%\app\Http\Requests\" /E /Y /I
xcopy "%CUSTOM_DIR%\database\migrations" "%PROJECT_DIR%\database\migrations\" /E /Y /I
xcopy "%CUSTOM_DIR%\database\seeders" "%PROJECT_DIR%\database\seeders\" /E /Y /I
xcopy "%CUSTOM_DIR%\resources\views" "%PROJECT_DIR%\resources\views\" /E /Y /I
copy /Y "%CUSTOM_DIR%\routes\web.php" "%PROJECT_DIR%\routes\web.php"
copy /Y "%CUSTOM_DIR%\bootstrap\app.php" "%PROJECT_DIR%\bootstrap\app.php"

echo.
echo === LANGKAH 3: Install package tambahan (Spatie, DomPDF, Excel, 2FA) ===
cd "%PROJECT_DIR%"
composer require spatie/laravel-permission spatie/laravel-activitylog barryvdh/laravel-dompdf maatwebsite/excel pragmarx/google2fa-laravel
if errorlevel 1 (
    echo [ERROR] Gagal install package tambahan. Cek koneksi internet.
    pause
    exit /b 1
)

echo.
echo === LANGKAH 4: Publish migration package pihak ketiga ===
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"

echo.
echo === LANGKAH 5: Konfigurasi .env ===
if not exist ".env" (
    copy /Y ".env.example" ".env"
)
findstr /C:"APP_KEY=" ".env" | findstr /C:"APP_KEY=base64" >nul
if errorlevel 1 (
    php artisan key:generate
)

echo.
echo ============================================================
echo  SETENGAH JALAN LAGI - Lakukan manual sebelum lanjut:
echo  1. Buka file .env di %PROJECT_DIR%, isi DB_DATABASE,
echo     DB_USERNAME, DB_PASSWORD sesuai MySQL/XAMPP kamu.
echo  2. Pastikan database "bankdata" sudah dibuat di phpMyAdmin.
echo  3. Setelah itu tekan tombol apa saja di sini untuk lanjut
echo     migrasi database.
echo ============================================================
pause

php artisan migrate
php artisan db:seed --class=Database\Seeders\RoleAndAdminSeeder
php artisan storage:link

echo.
echo ============================================================
echo  SELESAI! Menjalankan server...
echo  Login: [email protected] / GantiSegera!2026
echo  (WAJIB ganti password setelah login pertama)
echo ============================================================
php artisan serve

pause
