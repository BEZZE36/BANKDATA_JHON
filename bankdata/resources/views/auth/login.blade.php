<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masuk — Bank Data</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    <style>body{font-family:'Inter',sans-serif}.font-heading{font-family:'Space Grotesk',sans-serif}</style>
</head>
<body class="min-h-screen bg-slate-900 flex items-center justify-center px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-6">
            <p class="font-heading font-bold text-2xl text-slate-900">Bank Data</p>
            <p class="text-sm text-slate-500">Kantor Gubernur Sulawesi Tengah</p>
        </div>

        @if ($errors->any())
            <div class="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('login') }}" class="space-y-4">
            @csrf
            <div>
                <label class="text-sm font-medium text-slate-700">Email</label>
                <input type="email" name="email" required autofocus value="{{ old('email') }}"
                       class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="text-sm font-medium text-slate-700">Kata Sandi</label>
                <input type="password" name="password" required
                       class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <label class="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="remember" class="rounded border-slate-300">
                Ingat saya
            </label>
            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 font-medium transition">
                Masuk
            </button>
        </form>
        <p class="text-xs text-slate-400 text-center mt-6">Akses dibatasi untuk pegawai yang berwenang. Semua aktivitas dicatat sistem.</p>
    </div>
</body>
</html>
