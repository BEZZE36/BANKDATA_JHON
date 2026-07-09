@extends('layouts.app')
@section('title', 'Ubah Data Program')

@section('content')
<div class="bg-white rounded-2xl border p-6 max-w-3xl">
    <form method="POST" action="{{ route('program.update', $program) }}" enctype="multipart/form-data" class="space-y-4">
        @csrf @method('PUT')
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="text-sm font-medium">Kode Program</label>
                <input name="kode_program" value="{{ old('kode_program', $program->kode_program) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('kode_program') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Tahun Anggaran</label>
                <input name="tahun_anggaran" value="{{ old('tahun_anggaran', $program->tahun_anggaran) }}" required type="number" class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('tahun_anggaran') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div class="col-span-2">
                <label class="text-sm font-medium">Nama Program</label>
                <input name="nama_program" value="{{ old('nama_program', $program->nama_program) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('nama_program') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div class="col-span-2">
                <label class="text-sm font-medium">Unit Pelaksana</label>
                <input name="unit_pelaksana" value="{{ old('unit_pelaksana', $program->unit_pelaksana) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('unit_pelaksana') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Target (Rp)</label>
                <input name="target" type="number" step="0.01" value="{{ old('target', $program->target) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('target') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Realisasi (Rp)</label>
                <input name="realisasi" type="number" step="0.01" value="{{ old('realisasi', $program->realisasi) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('realisasi') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Status</label>
                <select name="status" class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                    @foreach(['perencanaan','berjalan','selesai','ditunda'] as $s)
                        <option value="{{ $s }}" @selected(old('status', $program->status) === $s)>{{ ucfirst($s) }}</option>
                    @endforeach
                </select>
                @error('status') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div class="col-span-2">
                <label class="text-sm font-medium">Keterangan</label>
                <textarea name="keterangan" rows="3" class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">{{ old('keterangan', $program->keterangan) }}</textarea>
                @error('keterangan') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
        </div>
        <div>
            <label class="text-sm font-medium">Dokumen Pendukung Baru (opsional, akan menambah lampiran)</label>
            <input type="file" name="dokumen" class="mt-1 w-full text-sm">
            @error('dokumen') <span class="text-xs text-rose-500 block">{{ $message }}</span> @enderror
        </div>
        <div class="flex gap-3 pt-4">
            <button class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:-translate-y-0.5 transition-transform">Simpan Perubahan</button>
            <a href="{{ route('program.index') }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 hover:-translate-y-0.5 transition-transform">Batal</a>
        </div>
    </form>
</div>
@endsection
