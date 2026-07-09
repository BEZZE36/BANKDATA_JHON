<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') — Bank Data</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/all.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .font-heading { font-family: 'Space Grotesk', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800">
<div class="flex min-h-screen">

    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-slate-200 flex-shrink-0 hidden md:flex flex-col">
        <div class="px-6 py-5 border-b border-slate-700">
            <p class="font-heading font-bold text-lg text-white leading-tight">Bank Data</p>
            <p class="text-xs text-slate-400">Kantor Gubernur Sulteng</p>
        </div>
        <nav class="flex-1 px-3 py-4 space-y-1">
            <a href="{{ route('dashboard') }}" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm {{ request()->routeIs('dashboard') ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800' }}">
                <i class="fa-solid fa-gauge w-4"></i> Dashboard
            </a>
            <a href="{{ route('folder.index', ['modul' => 'kepegawaian']) }}" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm {{ request()->route('modul') === 'kepegawaian' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800' }}">
                <i class="fa-solid fa-id-card w-4"></i> Data Kepegawaian
            </a>
            <a href="{{ route('folder.index', ['modul' => 'program']) }}" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm {{ request()->route('modul') === 'program' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800' }}">
                <i class="fa-solid fa-diagram-project w-4"></i> Data Program
            </a>
            <a href="{{ route('folder.index', ['modul' => 'aset']) }}" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm {{ request()->route('modul') === 'aset' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800' }}">
                <i class="fa-solid fa-boxes-stacked w-4"></i> Data Aset
            </a>
            <a href="{{ route('folder.index', ['modul' => 'keuangan']) }}" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm {{ request()->route('modul') === 'keuangan' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800' }}">
                <i class="fa-solid fa-coins w-4"></i> Data Keuangan
            </a>
        </nav>
        <div class="px-3 py-4 border-t border-slate-700">
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full hover:bg-slate-800 text-rose-300">
                    <i class="fa-solid fa-right-from-bracket w-4"></i> Keluar
                </button>
            </form>
        </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
        <header class="bg-white border-b px-6 py-4 flex items-center justify-between">
            <h1 class="font-heading font-bold text-xl text-slate-900">@yield('title', 'Dashboard')</h1>
            <div class="flex items-center gap-3">
                <span class="text-sm text-slate-500">{{ auth()->user()->name ?? '' }}</span>
                <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                    {{ auth()->check() ? strtoupper(substr(auth()->user()->name, 0, 1)) : '' }}
                </div>
            </div>
        </header>

        <main class="flex-1 p-6">
            @if (session('sukses'))
                <div class="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm">
                    <i class="fa-solid fa-circle-check mr-1"></i> {{ session('sukses') }}
                </div>
            @endif
            @if ($errors->any())
                <div class="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 text-sm">
                    <p class="font-medium mb-1"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Terdapat kesalahan pada input:</p>
                    <ul class="list-disc list-inside">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            @yield('content')
        </main>
    </div>
</div>

<!-- Modal Preview File (dipakai di halaman folder & halaman detail semua modul) -->
<div id="modal-preview-lampiran" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <div class="absolute top-4 right-4 flex gap-2 z-10" id="btn-zoom-group">
        <button onclick="zoomPreview(-0.2)" class="w-9 h-9 bg-white/90 rounded-lg hover:bg-white text-slate-700 font-bold">-</button>
        <button onclick="resetZoomPreview()" class="px-3 h-9 bg-white/90 rounded-lg hover:bg-white text-slate-700 text-xs font-medium">Reset</button>
        <button onclick="zoomPreview(0.2)" class="w-9 h-9 bg-white/90 rounded-lg hover:bg-white text-slate-700 font-bold">+</button>
    </div>
    <button onclick="tutupPreview()" class="absolute top-4 left-4 w-9 h-9 bg-white/90 rounded-lg hover:bg-white text-slate-700 z-10">
        <i class="fa-solid fa-xmark"></i>
    </button>
    <div id="preview-content-wrap" class="w-full h-full flex items-center justify-center overflow-auto p-16" onclick="if(event.target === this) tutupPreview()"></div>
</div>

<script>
let previewZoomLevel = 1;

function bukaPreviewLampiran(url, mime) {
    const wrap = document.getElementById('preview-content-wrap');
    const zoomGroup = document.getElementById('btn-zoom-group');
    previewZoomLevel = 1;

    const adalahGambar = mime === 'image/jpeg' || mime === 'image/png';

    if (adalahGambar) {
        wrap.innerHTML = `<img id="preview-img" src="${url}" style="transform: scale(1); transition: transform .15s ease; max-width: 90vw; max-height: 85vh;">`;
        zoomGroup.classList.remove('hidden');
    } else {
        // PDF & dokumen Word/Excel sudah punya kontrol zoom bawaan dari viewer-nya sendiri
        wrap.innerHTML = `<iframe src="${url}" class="bg-white rounded-lg shadow-2xl" style="width: 90vw; height: 85vh; border: none;"></iframe>`;
        zoomGroup.classList.add('hidden');
    }

    document.getElementById('modal-preview-lampiran').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function zoomPreview(delta) {
    previewZoomLevel = Math.min(4, Math.max(0.2, previewZoomLevel + delta));
    const img = document.getElementById('preview-img');
    if (img) img.style.transform = `scale(${previewZoomLevel})`;
}

function resetZoomPreview() {
    previewZoomLevel = 1;
    const img = document.getElementById('preview-img');
    if (img) img.style.transform = 'scale(1)';
}

function tutupPreview() {
    document.getElementById('modal-preview-lampiran').classList.add('hidden');
    document.getElementById('preview-content-wrap').innerHTML = '';
    document.body.style.overflow = '';
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') tutupPreview();
});
</script>
</body>
</html>
