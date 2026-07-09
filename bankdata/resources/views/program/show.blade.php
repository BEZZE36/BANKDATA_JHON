@extends('layouts.app')
@section('title', 'Detail Program')

@section('content')
<div class="flex flex-col md:flex-row gap-6 items-start">
    <div class="bg-white rounded-2xl border p-6 w-full md:w-2/3 space-y-6">
        <div class="flex justify-between items-start">
            <div>
                <h3 class="text-lg font-medium text-slate-900">{{ $program->nama_program }}</h3>
                <p class="text-sm text-slate-500 mt-1">Kode: {{ $program->kode_program }} &middot; Tahun: {{ $program->tahun_anggaran }}</p>
            </div>
            <a href="{{ route('program.pdf', $program) }}" target="_blank" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 hover:-translate-y-0.5 transition-transform">
                <i class="fa-solid fa-file-pdf text-rose-500 mr-1"></i> Cetak PDF
            </a>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
            <div><p class="text-slate-400">Unit Pelaksana</p><p class="font-medium">{{ $program->unit_pelaksana }}</p></div>
            <div>
                <p class="text-slate-400">Status</p>
                <p>
                    <span class="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600 font-medium">
                        {{ ucfirst($program->status) }}
                    </span>
                </p>
            </div>
            <div class="col-span-2">
                <p class="text-slate-400">Target Anggaran</p>
                <p class="font-medium text-lg">Rp {{ number_format($program->target, 0, ',', '.') }}</p>
            </div>
            <div class="col-span-2">
                <p class="text-slate-400">Total Realisasi</p>
                <p class="font-medium text-lg text-emerald-600">Rp {{ number_format($program->realisasi, 0, ',', '.') }}</p>
            </div>
            <div class="col-span-2">
                <p class="text-slate-400 mb-1">Capaian: {{ $program->persen_capaian }}%</p>
                <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="bg-emerald-500 h-2 rounded-full" style="width: {{ min(100, $program->persen_capaian) }}%"></div>
                </div>
            </div>
            <div class="col-span-2">
                <p class="text-slate-400">Keterangan</p>
                <p class="text-slate-700">{{ $program->keterangan ?: '-' }}</p>
            </div>
        </div>

        @if ($program->attachments->count())
        <div>
            <p class="text-sm font-medium mb-2">Dokumen Pendukung</p>
            <ul class="space-y-1 text-sm">
                @foreach ($program->attachments as $a)
                    <li class="flex items-center gap-2">
                        <i class="fa-solid fa-paperclip text-slate-400"></i>
                        <span class="flex-1">{{ $a->original_name }}</span>
                        <a href="{{ route('attachment.preview', $a) }}" onclick="event.preventDefault(); bukaPreviewLampiran('{{ route('attachment.preview', $a) }}', '{{ $a->mime_type }}')" class="text-blue-600 hover:underline text-xs cursor-pointer"><i class="fa-solid fa-eye"></i> Lihat</a>
                        <a href="{{ route('attachment.download', $a) }}" class="text-slate-500 hover:underline text-xs"><i class="fa-solid fa-download"></i> Unduh</a>
                    </li>
                @endforeach
            </ul>
        </div>
        @endif

        <div class="pt-4 border-t flex gap-2">
            <a href="{{ route('folder.index', ['modul' => 'program', 'folder' => $program->folder_id]) }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 text-sm hover:-translate-y-0.5 transition-transform">Kembali</a>
        </div>
    </div>

    <!-- Panel Transaksi Keuangan Terkait -->
    <div class="bg-white rounded-2xl border p-6 w-full md:w-1/3 space-y-4">
        <h4 class="font-medium text-slate-900 border-b pb-2">Riwayat Transaksi Keuangan</h4>
        @forelse ($program->transaksiKeuangan as $trx)
            <div class="text-sm border-b pb-3 last:border-0">
                <div class="flex justify-between items-start">
                    <span class="font-medium">{{ $trx->no_transaksi }}</span>
                    <span class="text-xs {{ $trx->jenis === 'anggaran' ? 'text-blue-600' : 'text-emerald-600' }}">
                        {{ ucfirst($trx->jenis) }}
                    </span>
                </div>
                <div class="text-xs text-slate-500 mt-1">{{ $trx->tanggal->format('d M Y') }}</div>
                <div class="font-medium mt-1">Rp {{ number_format($trx->nominal, 0, ',', '.') }}</div>
            </div>
        @empty
            <p class="text-sm text-slate-500 text-center py-4">Belum ada transaksi terkait program ini.</p>
        @endforelse
    </div>
</div>
@endsection
