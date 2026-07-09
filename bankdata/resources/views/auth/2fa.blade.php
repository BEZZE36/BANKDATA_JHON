<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi 2FA - Bank Data Provinsi Sulawesi Tengah</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Space Grotesk', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div class="p-8 pb-6 bg-slate-900 text-white text-center">
            <div class="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <i class="fa-solid fa-shield-halved text-3xl text-white"></i>
            </div>
            <h2 class="text-2xl font-bold mb-1">Verifikasi Dua Langkah</h2>
            <p class="text-slate-400 text-sm">Keamanan ekstra untuk akun Anda</p>
        </div>
        
        <div class="p-8 pt-6">
            <p class="text-slate-600 text-sm mb-6 text-center">
                Silakan masukkan 6 digit kode dari aplikasi Authenticator (Google Authenticator, Authy, dll) di perangkat Anda.
            </p>

            <form method="POST" action="{{ route('2fa.verify.post') }}" class="space-y-5">
                @csrf
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Kode Autentikasi</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fa-solid fa-key text-slate-400"></i>
                        </div>
                        <input type="text" name="one_time_password" required autofocus maxlength="6" pattern="[0-9]{6}" autocomplete="one-time-code"
                            class="pl-10 w-full rounded-xl border-slate-300 py-3 text-center text-xl tracking-[0.5em] font-medium focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                            placeholder="••••••">
                    </div>
                    @error('one_time_password')
                        <p class="mt-2 text-sm text-rose-500 flex items-center gap-1">
                            <i class="fa-solid fa-circle-exclamation"></i> {{ $message }}
                        </p>
                    @enderror
                </div>

                <button type="submit" class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 hover:-translate-y-0.5 transition-transform">
                    <i class="fa-solid fa-check-circle mr-2"></i> Verifikasi Kode
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <a href="{{ route('login') }}" class="text-sm text-slate-500 hover:text-slate-700 font-medium">
                    <i class="fa-solid fa-arrow-left mr-1"></i> Kembali ke Login
                </a>
            </div>
        </div>
    </div>
</body>
</html>
