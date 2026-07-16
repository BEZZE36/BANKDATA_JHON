<?php
// Temporary diagnostic endpoint - REMOVE AFTER USE
echo json_encode([
    'php_version' => PHP_VERSION,
    'extensions' => get_loaded_extensions(),
    'env_check' => [
        'APP_KEY' => !empty($_ENV['APP_KEY']) ? 'SET (' . strlen($_ENV['APP_KEY']) . ' chars)' : 'NOT SET',
        'DB_CONNECTION' => $_ENV['DB_CONNECTION'] ?? 'NOT SET',
        'APP_ENV' => $_ENV['APP_ENV'] ?? 'NOT SET',
    ],
    'writable' => [
        '/tmp' => is_writable('/tmp'),
    ],
], JSON_PRETTY_PRINT);
