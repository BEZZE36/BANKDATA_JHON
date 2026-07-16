<?php

use App\Http\Middleware\EnsureUserHasRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Override storage path to /tmp for read-only filesystems (e.g. Vercel)
$storagePath = getenv('APP_STORAGE') ?: (is_writable('/tmp') ? '/tmp/storage' : dirname(__DIR__).'/storage');

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Percayai proxy dari Vercel/Load Balancer agar HTTPS dan Session berjalan normal
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);

        // Header keamanan tambahan di setiap response (defense in depth di luar CSRF bawaan Laravel)
        $middleware->append(\App\Http\Middleware\AddSecurityHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

$app->useStoragePath($storagePath);

return $app;

