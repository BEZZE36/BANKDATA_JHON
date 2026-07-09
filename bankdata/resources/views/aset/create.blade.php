@extends('layouts.app')
@section('title', 'Tambah Aset')

@section('content')
<div class="bg-white rounded-2xl border p-6 max-w-2xl">
    <form method="POST" action="{{ route('aset.store') }}" enctype="multipart/form-data" class="space-y-4">
        @csrf
        <input type="hidden" name="folder_id" value="{{ $folderId }}">
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="text-sm font-medium">Kode Aset</label>
                <input name="kode_aset" value="{{ old('kode_aset') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Nama Aset</label>
                <input name="nama_aset" value="{{ old('nama_aset') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Kategori</label>
                <input name="kategori" value="{{ old('kategori') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Lokasi</label>
                <input name="lokasi" value="{{ old('lokasi') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Kondisi</label>
                <select name="kondisi" class="mt-1 w-full rounded-lg border-slate-300">
                    @foreach(['baik','rusak_ringan','rusak_berat'] as $k)
                        <option value="{{ $k }}" @selected(old('kondisi') === $k)>{{ ucfirst(str_replace('_',' ',$k)) }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="text-sm font-medium">Tahun Perolehan</label>
                <input name="tahun_perolehan" value="{{ old('tahun_perolehan') }}" class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Nilai Perolehan (Rp)</label>
                <input type="number" step="0.01" name="nilai_perolehan" value="{{ old('nilai_perolehan', 0) }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
        </div>
        <div>
            <label class="text-sm font-medium">Foto Aset (opsional)</label>
            <input type="file" name="foto" accept="image/*" class="mt-1 w-full text-sm">
        </div>
        <div class="flex gap-3 pt-2">
            <button class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Simpan</button>
            <a href="{{ $folderId ? route('folder.index', ['modul' => 'aset', 'folder' => $folderId]) : route('aset.index') }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200">Batal</a>
        </div>
    </form>
</div>
@endsection
