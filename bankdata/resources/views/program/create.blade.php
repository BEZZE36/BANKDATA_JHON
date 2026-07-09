@extends('layouts.app')
@section('title', 'Tambah Program')

@section('content')
<div class="bg-white rounded-2xl border p-6 max-w-2xl">
    <form method="POST" action="{{ route('program.store') }}" enctype="multipart/form-data" class="space-y-4">
        @csrf
        <input type="hidden" name="folder_id" value="{{ $folderId }}">
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="text-sm font-medium">Kode Program</label>
                <input name="kode_program" value="{{ old('kode_program') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Nama Program</label>
                <input name="nama_program" value="{{ old('nama_program') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Tahun Anggaran</label>
                <input name="tahun_anggaran" value="{{ old('tahun_anggaran') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Unit Pelaksana</label>
                <input name="unit_pelaksana" value="{{ old('unit_pelaksana') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Target</label>
                <input type="number" step="0.01" name="target" value="{{ old('target', 0) }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Realisasi</label>
                <input type="number" step="0.01" name="realisasi" value="{{ old('realisasi', 0) }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Status</label>
                <select name="status" class="mt-1 w-full rounded-lg border-slate-300">
                    @foreach(['perencanaan','berjalan','selesai','ditunda'] as $s)
                        <option value="{{ $s }}" @selected(old('status') === $s)>{{ ucfirst($s) }}</option>
                    @endforeach
                </select>
            </div>
        </div>
        <div>
            <label class="text-sm font-medium">Keterangan</label>
            <textarea name="keterangan" rows="3" class="mt-1 w-full rounded-lg border-slate-300">{{ old('keterangan') }}</textarea>
        </div>
        <div>
            <label class="text-sm font-medium">Dokumen Pendukung (opsional)</label>
            <input type="file" name="dokumen" class="mt-1 w-full text-sm">
        </div>
        <div class="flex gap-3 pt-2">
            <button class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Simpan</button>
            <a href="{{ $folderId ? route('folder.index', ['modul' => 'program', 'folder' => $folderId]) : route('program.index') }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200">Batal</a>
        </div>
    </form>
</div>
@endsection
