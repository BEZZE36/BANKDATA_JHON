<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $throttleKey = strtolower($credentials['email']) . '|' . $request->ip();

        // Lindungi dari brute-force: maksimal 5 percobaan / 5 menit per email+IP.
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $detik = RateLimiter::availableIn($throttleKey);

            activity('login')->withProperties(['email' => $credentials['email'], 'ip' => $request->ip()])
                ->log('Akun diblokir sementara karena terlalu banyak percobaan login');

            throw ValidationException::withMessages([
                'email' => "Terlalu banyak percobaan gagal. Coba lagi dalam {$detik} detik.",
            ]);
        }

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($throttleKey, 300); // kunci 5 menit setelah gagal
            activity('login')->withProperties(['email' => $credentials['email'], 'ip' => $request->ip()])
                ->log('Percobaan login gagal');

            throw ValidationException::withMessages([
                'email' => 'Email atau kata sandi salah.',
            ]);
        }

        $user = Auth::user();

        if (!$user->isActive()) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => 'Akun Anda tidak aktif. Hubungi administrator sistem.',
            ]);
        }

        RateLimiter::clear($throttleKey);
        $request->session()->regenerate(); // cegah session fixation

        activity('login')->causedBy($user)->withProperties(['ip' => $request->ip()])
            ->log('Login berhasil');

        // Jika 2FA diaktifkan untuk user ini, arahkan ke halaman verifikasi kode dulu
        if (config('services.google2fa.enabled') && $user->two_factor_secret) {
            Auth::logout();
            $request->session()->put('2fa:user:id', $user->id);
            return redirect()->route('2fa.verify');
        }

        return redirect()->intended(route('dashboard'));
    }

    public function logout(Request $request)
    {
        activity('login')->causedBy(Auth::user())->log('Logout');

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
