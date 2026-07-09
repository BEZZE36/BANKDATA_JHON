@extends('layouts.app')
@section('title', 'Detail Pegawai')

@section('content')
<div class="bg-white rounded-2xl border p-6 max-w-2xl space-y-4">
    <div class="grid grid-cols-2 gap-4 text-sm">
        <div><p class="text-slate-400">NIP</p><p class="font-medium">{{ $pegawai->nip }}</p></div>
        <div><p class="text-slate-400">Nama</p><p class="font-medium">{{ $pegawai->nama }}</p></div>
        <div><p class="text-slate-400">Jabatan</p><p class="font-medium">{{ $pegawai->jabatan }}</p></div>
        <div><p class="text-slate-400">Golongan</p><p class="font-medium">{{ $pegawai->golongan ?? '-' }}</p></div>
        <div><p class="text-slate-400">Unit Kerja</p><p class="font-medium">{{ $pegawai->unit_kerja }}</p></div>
        <div><p class="text-slate-400">Status</p><p class="font-medium">{{ ucfirst($pegawai->status) }}</p></div>
    </div>

    @if ($pegawai->attachments->count())
    <div>
        <p class="text-sm font-medium mb-2">Dokumen Lampiran</p>
        <ul class="space-y-1 text-sm">
            @foreach ($pegawai->attachments as $a)
                <li><i class="fa-solid fa-paperclip mr-1 text-slate-400"></i> {{ $a->original_name }}</li>
            @endforeach
        </ul>
    </div>
    @endif

    <div class="text-xs text-slate-400 pt-4 border-t">
        Dibuat oleh {{ $pegawai->pembuat->name ?? '-' }} · Terakhir diubah oleh {{ $pegawai->pengubah->name ?? '-' }}
    </div>

    <a href="{{ route('pegawai.index') }}" class="inline-block px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 text-sm">Kembali</a>
</div>
@endsection
