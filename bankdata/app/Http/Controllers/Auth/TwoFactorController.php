<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PragmaRX\Google2FALaravel\Support\Authenticator;

class TwoFactorController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->session()->has('2fa:user:id')) {
            return redirect()->route('login');
        }

        return view('auth.2fa');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'one_time_password' => 'required|digits:6',
        ]);

        $userId = $request->session()->get('2fa:user:id');
        $user = User::find($userId);

        if (!$user) {
            return redirect()->route('login')->withErrors(['email' => 'Sesi login tidak valid.']);
        }

        $authenticator = app(Authenticator::class)->boot($request);
        
        // Cek validitas kode OTP
        if ($authenticator->verifyGoogle2FA($user->two_factor_secret, $request->one_time_password)) {
            // Login sukses
            Auth::login($user);
            $request->session()->forget('2fa:user:id');
            $request->session()->regenerate();
            
            activity('login')->causedBy($user)->withProperties(['ip' => $request->ip()])
                ->log('Login berhasil melewati verifikasi 2FA');
                
            return redirect()->intended(route('dashboard'));
        }

        activity('login')->withProperties(['user_id' => $user->id, 'ip' => $request->ip()])
            ->log('Percobaan login gagal pada verifikasi 2FA');

        return back()->withErrors(['one_time_password' => 'Kode autentikasi tidak valid atau telah kadaluarsa.']);
    }
}
