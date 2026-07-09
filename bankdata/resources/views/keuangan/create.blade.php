@extends('layouts.app')
@section('title', 'Tambah Transaksi Keuangan')

@section('content')
<div class="bg-white rounded-2xl border p-6 max-w-2xl">
    <form method="POST" action="{{ route('keuangan.store') }}" enctype="multipart/form-data" class="space-y-4">
        @csrf
        <input type="hidden" name="folder_id" value="{{ $folderId }}">
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="text-sm font-medium">No Transaksi</label>
                <input name="no_transaksi" value="{{ old('no_transaksi') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Jenis</label>
                <select name="jenis" class="mt-1 w-full rounded-lg border-slate-300">
                    <option value="anggaran" @selected(old('jenis') === 'anggaran')>Anggaran</option>
                    <option value="realisasi" @selected(old('jenis') === 'realisasi')>Realisasi</option>
                </select>
            </div>
            <div>
                <label class="text-sm font-medium">Nominal (Rp)</label>
                <input type="number" step="0.01" name="nominal" value="{{ old('nominal', 0) }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div>
                <label class="text-sm font-medium">Tanggal</label>
                <input type="date" name="tanggal" value="{{ old('tanggal') }}" required class="mt-1 w-full rounded-lg border-slate-300">
            </div>
            <div class="col-span-2">
                <label class="text-sm font-medium">Program Terkait (opsional)</label>
                <select name="program_id" class="mt-1 w-full rounded-lg border-slate-300">
                    <option value="">— Tidak terhubung ke program —</option>
                    @foreach($programList as $p)
                        <option value="{{ $p->id }}" @selected(old('program_id') == $p->id)>{{ $p->nama_program }}</option>
                    @endforeach
                </select>
            </div>
        </div>
        <div>
            <label class="text-sm font-medium">Keterangan</label>
            <textarea name="keterangan" rows="3" class="mt-1 w-full rounded-lg border-slate-300">{{ old('keterangan') }}</textarea>
        </div>
        <div>
            <label class="text-sm font-medium">Bukti Transaksi (opsional)</label>
            <input type="file" name="bukti" class="mt-1 w-full text-sm">
        </div>
        <div class="flex gap-3 pt-2">
            <button class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Simpan</button>
            <a href="{{ $folderId ? route('folder.index', ['modul' => 'keuangan', 'folder' => $folderId]) : route('keuangan.index') }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200">Batal</a>
        </div>
    </form>
</div>
@endsection
