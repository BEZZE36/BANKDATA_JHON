@extends('layouts.app')
@section('title', 'Tambah Pegawai')

@section('content')
<div class="bg-white rounded-2xl border p-6 max-w-2xl">
    <form method="POST" action="{{ route('pegawai.store') }}" enctype="multipart/form-data" class="space-y-4">
        @csrf
        <input type="hidden" name="folder_id" value="{{ $folderId }}">
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="text-sm font-medium">NIP</label>
                <input name="nip" value="{{ old('nip') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Nama Lengkap</label>
                <input name="nama" value="{{ old('nama') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Jabatan</label>
                <input name="jabatan" value="{{ old('jabatan') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Golongan</label>
                <input name="golongan" value="{{ old('golongan') }}" class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Unit Kerja</label>
                <input name="unit_kerja" value="{{ old('unit_kerja') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Pendidikan Terakhir</label>
                <input name="pendidikan_terakhir" value="{{ old('pendidikan_terakhir') }}" class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">TMT Jabatan</label>
                <input type="date" name="tmt_jabatan" value="{{ old('tmt_jabatan') }}" class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Status</label>
                <select name="status" class="mt-1 w-full rounded-lg border-slate-300">
                    @foreach(['aktif','pensiun','mutasi','nonaktif'] as $s)
                        <option value="{{ $s }}" @selected(old('status') === $s)>{{ ucfirst($s) }}</option>
                    @endforeach
                </select>
            </div>
        </div>
        <div>
            <label class="text-sm font-medium">Dokumen SK (opsional, PDF/JPG/PNG/XLSX/DOCX, maks 5MB)</label>
            <input type="file" name="dokumen_sk" class="mt-1 w-full text-sm">
        </div>
        <div class="flex gap-3 pt-2">
            <button class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Simpan</button>
            <a href="{{ $folderId ? route('folder.index', ['modul' => 'kepegawaian', 'folder' => $folderId]) : route('pegawai.index') }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200">Batal</a>
        </div>
    </form>
</div>
@endsection
