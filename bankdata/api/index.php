<?php

// === Vercel Serverless Fix with Error Catcher ===
// Vercel filesystem is read-only except /tmp.
// We redirect all Laravel write operations to /tmp before the app boots.

try {
    // 1. Force logging to stderr (no file writes needed)
    putenv('LOG_CHANNEL=stderr');
    $_ENV['LOG_CHANNEL'] = 'stderr';
    $_SERVER['LOG_CHANNEL'] = 'stderr';

    // Prevent IpUtils::checkIp4 TypeError when REMOTE_ADDR is null (CLI or Serverless)
    $_SERVER['REMOTE_ADDR'] = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

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
            mkdir($dir, 0775, true);
        }
    }

    // 3. Redirect Blade compiled views to /tmp
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
        'LARAVEL_STORAGE_PATH' => '/tmp/storage',
    ];
    foreach ($bootstrapCacheEnv as $key => $value) {
        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }

    // 5. Forward request to Laravel
    require __DIR__ . '/../public/index.php';

} catch (\Throwable $e) {
    // If Laravel fails to boot (e.g. missing APP_KEY, missing vendor, db error),
    // we catch it here instead of crashing the serverless function.
    http_response_code(500);
    echo "<div style='font-family: sans-serif; padding: 2rem; background: #fee2e2; color: #991b1b; border: 1px solid #ef4444; border-radius: 8px; margin: 2rem;'>";
    echo "<h1 style='margin-top: 0;'>🚨 Vercel Serverless Error</h1>";
    echo "<p><strong>Message:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>File:</strong> " . htmlspecialchars($e->getFile()) . " on line <strong>" . $e->getLine() . "</strong></p>";
    echo "<h3>Stack Trace:</h3>";
    echo "<pre style='background: #f87171; color: white; padding: 1rem; border-radius: 4px; overflow-x: auto;'>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    echo "</div>";
}
