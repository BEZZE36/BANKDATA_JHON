@extends('layouts.app')
@section('title', 'Dashboard')

@section('content')
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">

    <a href="{{ route('folder.index', ['modul' => 'kepegawaian']) }}" class="group bg-white rounded-2xl border p-6 hover:shadow-lg hover:-translate-y-0.5 transition">
        <div class="flex items-start justify-between">
            <div>
                <p class="font-heading font-bold text-lg text-slate-900">Data Kepegawaian</p>
                <p class="text-sm text-slate-500 mt-1">{{ $ringkasan['kepegawaian']['total'] }} pegawai terdaftar</p>
            </div>
            <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <i class="fa-solid fa-id-card text-lg"></i>
            </div>
        </div>
        <div class="mt-4 text-sm">
            <span class="text-emerald-600 font-medium">{{ $ringkasan['kepegawaian']['aktif'] }} aktif</span>
        </div>
    </a>

    <a href="{{ route('folder.index', ['modul' => 'program']) }}" class="group bg-white rounded-2xl border p-6 hover:shadow-lg hover:-translate-y-0.5 transition">
        <div class="flex items-start justify-between">
            <div>
                <p class="font-heading font-bold text-lg text-slate-900">Data Program</p>
                <p class="text-sm text-slate-500 mt-1">{{ $ringkasan['program']['total'] }} program tercatat</p>
            </div>
            <div class="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <i class="fa-solid fa-diagram-project text-lg"></i>
            </div>
        </div>
        <div class="mt-4 text-sm">
            <span class="text-amber-600 font-medium">{{ $ringkasan['program']['berjalan'] }} sedang berjalan</span>
        </div>
    </a>

    <a href="{{ route('folder.index', ['modul' => 'aset']) }}" class="group bg-white rounded-2xl border p-6 hover:shadow-lg hover:-translate-y-0.5 transition">
        <div class="flex items-start justify-between">
            <div>
                <p class="font-heading font-bold text-lg text-slate-900">Data Aset</p>
                <p class="text-sm text-slate-500 mt-1">{{ $ringkasan['aset']['total'] }} aset tercatat</p>
            </div>
            <div class="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <i class="fa-solid fa-boxes-stacked text-lg"></i>
            </div>
        </div>
        <div class="mt-4 text-sm">
            <span class="text-rose-600 font-medium">{{ $ringkasan['aset']['rusak'] }} perlu perhatian</span>
        </div>
    </a>

    <a href="{{ route('folder.index', ['modul' => 'keuangan']) }}" class="group bg-white rounded-2xl border p-6 hover:shadow-lg hover:-translate-y-0.5 transition">
        <div class="flex items-start justify-between">
            <div>
                <p class="font-heading font-bold text-lg text-slate-900">Data Keuangan</p>
                <p class="text-sm text-slate-500 mt-1">Anggaran vs realisasi</p>
            </div>
            <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <i class="fa-solid fa-coins text-lg"></i>
            </div>
        </div>
        <div class="mt-4 text-sm space-y-1">
            <p class="text-slate-600">Anggaran: <span class="font-semibold">Rp {{ number_format($ringkasan['keuangan']['total_anggaran'], 0, ',', '.') }}</span></p>
            <p class="text-slate-600">Realisasi: <span class="font-semibold">Rp {{ number_format($ringkasan['keuangan']['total_realisasi'], 0, ',', '.') }}</span></p>
        </div>
    </a>

</div>
@endsection
