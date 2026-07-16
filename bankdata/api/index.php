<?php

// === Vercel Serverless Fix ===
// Vercel filesystem is read-only except /tmp.
// We redirect all Laravel write operations to /tmp before the app boots.

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
        mkdir($dir, 0775, true);
    }
}

// 3. Redirect Blade compiled views to /tmp (via VIEW_COMPILED_PATH env)
putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
$_ENV['VIEW_COMPILED_PATH'] = '/tmp/storage/framework/views';
$_SERVER['VIEW_COMPILED_PATH'] = '/tmp/storage/framework/views';

// 4. Forward request to Laravel
require __DIR__ . '/../public/index.php';
