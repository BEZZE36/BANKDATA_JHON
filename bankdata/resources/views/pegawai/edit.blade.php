@extends('layouts.app')
@section('title', 'Ubah Data Pegawai')

@section('content')
<div class="bg-white rounded-2xl border p-6 max-w-2xl">
    <form method="POST" action="{{ route('pegawai.update', $pegawai) }}" enctype="multipart/form-data" class="space-y-4">
        @csrf @method('PUT')
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="text-sm font-medium">NIP</label>
                <input name="nip" value="{{ old('nip', $pegawai->nip) }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Nama Lengkap</label>
                <input name="nama" value="{{ old('nama', $pegawai->nama) }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Jabatan</label>
                <input name="jabatan" value="{{ old('jabatan', $pegawai->jabatan) }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Golongan</label>
                <input name="golongan" value="{{ old('golongan', $pegawai->golongan) }}" class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Unit Kerja</label>
                <input name="unit_kerja" value="{{ old('unit_kerja', $pegawai->unit_kerja) }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Pendidikan Terakhir</label>
                <input name="pendidikan_terakhir" value="{{ old('pendidikan_terakhir', $pegawai->pendidikan_terakhir) }}" class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">TMT Jabatan</label>
                <input type="date" name="tmt_jabatan" value="{{ old('tmt_jabatan', $pegawai->tmt_jabatan?->format('Y-m-d')) }}" class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Status</label>
                <select name="status" class="mt-1 w-full rounded-lg border-slate-300">
                    @foreach(['aktif','pensiun','mutasi','nonaktif'] as $s)
                        <option value="{{ $s }}" @selected(old('status', $pegawai->status) === $s)>{{ ucfirst($s) }}</option>
                    @endforeach
                </select>
            </div>
        </div>
        <div>
            <label class="text-sm font-medium">Dokumen SK baru (opsional, akan menambah lampiran)</label>
            <input type="file" name="dokumen_sk" class="mt-1 w-full text-sm">
        </div>
        <div class="flex gap-3 pt-2">
            <button class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Simpan Perubahan</button>
            <a href="{{ route('pegawai.index') }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200">Batal</a>
        </div>
    </form>
</div>
@endsection
