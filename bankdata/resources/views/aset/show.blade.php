@extends('layouts.app')
@section('title', 'Detail Aset')

@section('content')
<div class="flex flex-col md:flex-row gap-6 items-start">
    <div class="bg-white rounded-2xl border p-6 w-full md:w-2/3 space-y-6">
        <div>
            <h3 class="text-lg font-medium text-slate-900">{{ $aset->nama_aset }}</h3>
            <p class="text-sm text-slate-500 mt-1">Kode: {{ $aset->kode_aset }} &middot; Kategori: {{ $aset->kategori }}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
            <div><p class="text-slate-400">Lokasi</p><p class="font-medium">{{ $aset->lokasi }}</p></div>
            <div>
                <p class="text-slate-400">Kondisi</p>
                <p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        {{ $aset->kondisi === 'baik' ? 'bg-emerald-50 text-emerald-700' : ($aset->kondisi === 'rusak_ringan' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700') }}">
                        {{ ucwords(str_replace('_', ' ', $aset->kondisi)) }}
                    </span>
                </p>
            </div>
            <div><p class="text-slate-400">Tahun Perolehan</p><p class="font-medium">{{ $aset->tahun_perolehan }}</p></div>
            <div><p class="text-slate-400">Nilai Perolehan</p><p class="font-medium text-emerald-600">Rp {{ number_format($aset->nilai_perolehan, 0, ',', '.') }}</p></div>
        </div>

        @if ($aset->attachments->count())
        <div>
            <p class="text-sm font-medium mb-2">Dokumen Pendukung</p>
            <ul class="space-y-1 text-sm">
                @foreach ($aset->attachments as $a)
                    <li><i class="fa-solid fa-paperclip mr-1 text-slate-400"></i> {{ $a->original_name }}</li>
                @endforeach
            </ul>
        </div>
        @endif

        <div class="pt-4 border-t flex gap-2">
            <a href="{{ route('aset.index') }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 text-sm hover:-translate-y-0.5 transition-transform">Kembali</a>
        </div>
    </div>

    <!-- Panel Foto Aset -->
    <div class="bg-white rounded-2xl border p-6 w-full md:w-1/3">
        <h4 class="font-medium text-slate-900 border-b pb-2 mb-4">Foto Aset</h4>
        @if($aset->foto_path)
            <img src="{{ Storage::url($aset->foto_path) }}" alt="{{ $aset->nama_aset }}" class="w-full rounded-xl object-cover border shadow-sm">
        @else
            <div class="w-full aspect-square rounded-xl bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center text-slate-400">
                <i class="fa-solid fa-image text-3xl mb-2"></i>
                <span class="text-sm">Tidak ada foto</span>
            </div>
        @endif
    </div>
</div>
@endsection
