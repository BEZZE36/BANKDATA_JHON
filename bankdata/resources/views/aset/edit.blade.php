@extends('layouts.app')
@section('title', 'Ubah Data Aset')

@section('content')
<div class="bg-white rounded-2xl border p-6 max-w-3xl">
    <form method="POST" action="{{ route('aset.update', $aset) }}" enctype="multipart/form-data" class="space-y-4">
        @csrf @method('PUT')
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="text-sm font-medium">Kode Aset</label>
                <input name="kode_aset" value="{{ old('kode_aset', $aset->kode_aset) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('kode_aset') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Kategori</label>
                <input name="kategori" value="{{ old('kategori', $aset->kategori) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('kategori') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div class="col-span-2">
                <label class="text-sm font-medium">Nama Aset</label>
                <input name="nama_aset" value="{{ old('nama_aset', $aset->nama_aset) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('nama_aset') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div class="col-span-2">
                <label class="text-sm font-medium">Lokasi</label>
                <input name="lokasi" value="{{ old('lokasi', $aset->lokasi) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('lokasi') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Tahun Perolehan</label>
                <input name="tahun_perolehan" type="number" value="{{ old('tahun_perolehan', $aset->tahun_perolehan) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('tahun_perolehan') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Nilai Perolehan (Rp)</label>
                <input name="nilai_perolehan" type="number" step="0.01" value="{{ old('nilai_perolehan', $aset->nilai_perolehan) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('nilai_perolehan') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Kondisi</label>
                <select name="kondisi" class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="baik" @selected(old('kondisi', $aset->kondisi) == 'baik')>Baik</option>
                    <option value="rusak_ringan" @selected(old('kondisi', $aset->kondisi) == 'rusak_ringan')>Rusak Ringan</option>
                    <option value="rusak_berat" @selected(old('kondisi', $aset->kondisi) == 'rusak_berat')>Rusak Berat</option>
                </select>
                @error('kondisi') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
        </div>
        <div>
            <label class="text-sm font-medium">Ganti Foto Aset (opsional, JPG/PNG, maks 2MB)</label>
            <input type="file" name="foto" accept="image/*" class="mt-1 w-full text-sm">
            @error('foto') <span class="text-xs text-rose-500 block">{{ $message }}</span> @enderror
        </div>
        <div class="flex gap-3 pt-4">
            <button class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:-translate-y-0.5 transition-transform">Simpan Perubahan</button>
            <a href="{{ route('aset.index') }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 hover:-translate-y-0.5 transition-transform">Batal</a>
        </div>
    </form>
</div>
@endsection
