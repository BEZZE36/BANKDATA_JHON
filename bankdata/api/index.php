<?php

// === Vercel Serverless Fix ===
// Vercel filesystem is read-only except /tmp.
// We redirect all Laravel write operations to /tmp before the app boots.

try {
    // 1. Force logging to stderr (no file writes needed)
    putenv('LOG_CHANNEL=stderr');
    $_ENV['LOG_CHANNEL'] = 'stderr';
    $_SERVER['LOG_CHANNEL'] = 'stderr';

    // 2. Create all required writable directories in /tmp
    $tmpDirs = [
        '/tmp/storage/logs',
        '/tmp/storage/framework/cache/data',
        '/tmp/storage/framework/sessions',
        '/tmp/storage/framework/views',
        '/tmp/storage/app/public',
        '/tmp/bootstrap/cache',
    ];
    foreach ($tmpDirs as $dir) {
        if (!is_dir($dir)) {
            if (!@mkdir($dir, 0775, true) && !is_dir($dir)) {
                throw new \Exception("Failed to create directory: $dir");
            }
        }
    }

    // 3. Redirect Blade compiled views to /tmp (via VIEW_COMPILED_PATH env)
    putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
    $_ENV['VIEW_COMPILED_PATH'] = '/tmp/storage/framework/views';
    $_SERVER['VIEW_COMPILED_PATH'] = '/tmp/storage/framework/views';

    // 4. Redirect Laravel's internal bootstrap cache files
    $bootstrapCacheEnv = [
        'APP_PACKAGES_CACHE' => '/tmp/bootstrap/cache/packages.php',
        'APP_SERVICES_CACHE' => '/tmp/bootstrap/cache/services.php',
        'APP_CONFIG_CACHE' => '/tmp/bootstrap/cache/config.php',
        'APP_EVENTS_CACHE' => '/tmp/bootstrap/cache/events.php',
        'APP_ROUTES_CACHE' => '/tmp/bootstrap/cache/routes-v7.php',
        'APP_SCHEDULE_CACHE' => '/tmp/bootstrap/cache/schedule-v7.php',
    ];
    foreach ($bootstrapCacheEnv as $key => $value) {
        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }

    // 5. Forward request to Laravel
    require __DIR__ . '/../public/index.php';

} catch (\Throwable $e) {
    http_response_code(500);
    echo "<h1>Vercel Serverless Error</h1>";
    echo "<p><strong>Message:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>File:</strong> " . htmlspecialchars($e->getFile()) . ":" . $e->getLine() . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}
