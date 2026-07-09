@extends('layouts.app')
@section('title', 'Detail Transaksi Keuangan')

@section('content')
<div class="flex flex-col md:flex-row gap-6 items-start">
    <div class="bg-white rounded-2xl border p-6 w-full md:w-2/3 space-y-6">
        <div>
            <h3 class="text-lg font-medium text-slate-900">Transaksi: {{ $keuangan->no_transaksi }}</h3>
            <p class="text-sm text-slate-500 mt-1">Tanggal: {{ $keuangan->tanggal->format('d M Y') }}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p class="text-slate-400">Jenis Transaksi</p>
                <p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium
                        {{ $keuangan->jenis === 'anggaran' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700' }}">
                        {{ ucfirst($keuangan->jenis) }}
                    </span>
                </p>
            </div>
            <div>
                <p class="text-slate-400">Nominal</p>
                <p class="font-medium text-xl {{ $keuangan->jenis === 'realisasi' ? 'text-emerald-600' : 'text-slate-900' }}">
                    Rp {{ number_format($keuangan->nominal, 0, ',', '.') }}
                </p>
            </div>
            <div class="col-span-2">
                <p class="text-slate-400">Program Terkait</p>
                <p class="font-medium">
                    @if($keuangan->program)
                        <a href="{{ route('program.show', $keuangan->program_id) }}" class="text-blue-600 hover:underline">
                            {{ $keuangan->program->nama_program }}
                        </a>
                    @else
                        -
                    @endif
                </p>
            </div>
            <div class="col-span-2">
                <p class="text-slate-400">Keterangan / Uraian</p>
                <p class="text-slate-700">{{ $keuangan->keterangan ?: '-' }}</p>
            </div>
        </div>

        @if ($keuangan->attachments->count())
        <div>
            <p class="text-sm font-medium mb-2">Dokumen Bukti Transaksi</p>
            <ul class="space-y-1 text-sm">
                @foreach ($keuangan->attachments as $a)
                    <li class="flex items-center gap-2">
                        <i class="fa-solid fa-paperclip text-slate-400"></i>
                        <span class="flex-1">{{ $a->original_name }}</span>
                        <a href="{{ route('attachment.preview', $a) }}" target="_blank" class="text-blue-600 hover:underline text-xs"><i class="fa-solid fa-eye"></i> Lihat</a>
                        <a href="{{ route('attachment.download', $a) }}" class="text-slate-500 hover:underline text-xs"><i class="fa-solid fa-download"></i> Unduh</a>
                    </li>
                @endforeach
            </ul>
        </div>
        @endif

        <div class="pt-4 border-t flex gap-2">
            <a href="{{ route('folder.index', ['modul' => 'keuangan', 'folder' => $keuangan->folder_id]) }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 text-sm hover:-translate-y-0.5 transition-transform">Kembali</a>
        </div>
    </div>
</div>
@endsection
