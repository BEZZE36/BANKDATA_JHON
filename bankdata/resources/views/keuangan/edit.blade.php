@extends('layouts.app')
@section('title', 'Ubah Transaksi Keuangan')

@section('content')
<div class="bg-white rounded-2xl border p-6 max-w-3xl">
    <form method="POST" action="{{ route('keuangan.update', $keuangan) }}" enctype="multipart/form-data" class="space-y-4">
        @csrf @method('PUT')
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="text-sm font-medium">No. Transaksi / Referensi</label>
                <input name="no_transaksi" value="{{ old('no_transaksi', $keuangan->no_transaksi) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('no_transaksi') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Tanggal Transaksi</label>
                <input name="tanggal" type="date" value="{{ old('tanggal', $keuangan->tanggal->format('Y-m-d')) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('tanggal') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Jenis Transaksi</label>
                <select name="jenis" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="">-- Pilih Jenis --</option>
                    <option value="anggaran" @selected(old('jenis', $keuangan->jenis) == 'anggaran')>Anggaran (Pagu)</option>
                    <option value="realisasi" @selected(old('jenis', $keuangan->jenis) == 'realisasi')>Realisasi (Pengeluaran)</option>
                </select>
                @error('jenis') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Nominal (Rp)</label>
                <input name="nominal" type="number" step="0.01" value="{{ old('nominal', $keuangan->nominal) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('nominal') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div class="col-span-2">
                <label class="text-sm font-medium">Program Terkait (Opsional)</label>
                <select name="program_id" class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="">-- Tidak Terikat Program --</option>
                    @foreach($programList as $prog)
                        <option value="{{ $prog->id }}" @selected(old('program_id', $keuangan->program_id) == $prog->id)>{{ $prog->nama_program }}</option>
                    @endforeach
                </select>
                @error('program_id') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div class="col-span-2">
                <label class="text-sm font-medium">Keterangan / Uraian</label>
                <textarea name="keterangan" rows="3" class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">{{ old('keterangan', $keuangan->keterangan) }}</textarea>
                @error('keterangan') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
        </div>
        <div>
            <label class="text-sm font-medium">Upload Bukti Baru (opsional, akan menambah lampiran)</label>
            <input type="file" name="bukti" class="mt-1 w-full text-sm">
            @error('bukti') <span class="text-xs text-rose-500 block">{{ $message }}</span> @enderror
        </div>
        <div class="flex gap-3 pt-4">
            <button class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:-translate-y-0.5 transition-transform">Simpan Perubahan</button>
            <a href="{{ route('keuangan.index') }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 hover:-translate-y-0.5 transition-transform">Batal</a>
        </div>
    </form>
</div>
@endsection
