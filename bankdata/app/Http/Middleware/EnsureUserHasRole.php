<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware akses berbasis role.
 * Contoh pemakaian di routes: ->middleware('role:admin,operator-kepegawaian')
 *
 * Kenapa dibuat custom (bukan langsung pakai middleware bawaan Spatie di semua route)?
 * Supaya pesan error & redirect bisa disesuaikan dengan UX aplikasi (flash message bahasa Indonesia),
 * dan supaya setiap percobaan akses ditolak otomatis tercatat di activity log untuk audit.
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !$user->isActive()) {
            abort(403, 'Akun Anda tidak aktif. Hubungi administrator.');
        }

        if (!$user->hasAnyRole($roles)) {
            activity('akses-ditolak')
                ->causedBy($user)
                ->withProperties([
                    'url' => $request->fullUrl(),
                    'role_dibutuhkan' => $roles,
                    'ip' => $request->ip(),
                ])
                ->log('Percobaan akses tanpa izin ke ' . $request->path());

            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}
