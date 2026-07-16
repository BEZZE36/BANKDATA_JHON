<?php

// Force log to stderr (read-only filesystem on Vercel)
putenv('LOG_CHANNEL=stderr');
$_ENV['LOG_CHANNEL'] = 'stderr';
$_SERVER['LOG_CHANNEL'] = 'stderr';

// Create required writable directories in /tmp
$dirs = [
    '/tmp/storage/logs',
    '/tmp/storage/framework/cache/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/framework/views',
    '/tmp/bootstrap/cache',
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
}

// Symlink storage to /tmp so Laravel can write there
if (!is_dir('/tmp/storage/app')) {
    mkdir('/tmp/storage/app/public', 0775, true);
}

// Forward Vercel serverless requests to Laravel's front controller
require __DIR__ . '/../public/index.php';
