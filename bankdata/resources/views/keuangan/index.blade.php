@extends('layouts.app')
@section('title', 'Data Keuangan')

@section('content')
<div class="space-y-6">
    <!-- Ringkasan Keuangan -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white rounded-2xl border p-5 flex items-center justify-between shadow-sm">
            <div>
                <p class="text-sm text-slate-500 font-medium mb-1">Total Anggaran (Difilter)</p>
                <h4 class="text-2xl font-bold text-slate-900">Rp {{ number_format($totalAnggaran, 0, ',', '.') }}</h4>
            </div>
            <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                <i class="fa-solid fa-wallet"></i>
            </div>
        </div>
        <div class="bg-white rounded-2xl border p-5 flex items-center justify-between shadow-sm">
            <div>
                <p class="text-sm text-slate-500 font-medium mb-1">Total Realisasi (Difilter)</p>
                <h4 class="text-2xl font-bold text-emerald-600">Rp {{ number_format($totalRealisasi, 0, ',', '.') }}</h4>
            </div>
            <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                <i class="fa-solid fa-chart-line"></i>
            </div>
        </div>
    </div>

    <!-- Tabel Data -->
    <div class="bg-white rounded-2xl border">
        <div class="p-4 border-b flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
            <form method="GET" class="flex flex-wrap gap-2 items-center">
                <select name="jenis" class="rounded-lg border-slate-300 text-sm focus:ring-emerald-500">
                    <option value="">Semua Jenis</option>
                    <option value="anggaran" @selected(request('jenis') === 'anggaran')>Anggaran</option>
                    <option value="realisasi" @selected(request('jenis') === 'realisasi')>Realisasi</option>
                </select>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-slate-500">Dari:</span>
                    <input type="date" name="dari" value="{{ request('dari') }}" class="rounded-lg border-slate-300 text-sm focus:ring-emerald-500">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-slate-500">Sampai:</span>
                    <input type="date" name="sampai" value="{{ request('sampai') }}" class="rounded-lg border-slate-300 text-sm focus:ring-emerald-500">
                </div>
                <button class="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Filter</button>
                @if(request()->anyFilled(['jenis', 'dari', 'sampai']))
                    <a href="{{ route('keuangan.index') }}" class="px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg font-medium">Reset</a>
                @endif
            </form>
            <div class="flex gap-2">
                <a href="{{ route('keuangan.excel', request()->query()) }}" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 text-center">
                    <i class="fa-solid fa-file-excel mr-1"></i> Export Excel
                </a>
                @can('keuangan.tambah')
                <a href="{{ route('keuangan.create') }}" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 text-center whitespace-nowrap">
                    <i class="fa-solid fa-plus mr-1"></i> Tambah Transaksi
                </a>
                @endcan
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                        <th class="text-left px-4 py-3">No. Transaksi</th>
                        <th class="text-left px-4 py-3">Tanggal</th>
                        <th class="text-left px-4 py-3">Jenis</th>
                        <th class="text-left px-4 py-3">Program Terkait</th>
                        <th class="text-right px-4 py-3">Nominal (Rp)</th>
                        <th class="text-right px-4 py-3">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    @forelse ($keuangan as $k)
                    <tr class="hover:bg-slate-50 transition-all">
                        <td class="px-4 py-3 font-medium text-slate-900">{{ $k->no_transaksi }}</td>
                        <td class="px-4 py-3">{{ $k->tanggal->format('d M Y') }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 rounded-full text-xs 
                                {{ $k->jenis === 'anggaran' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700' }}">
                                {{ ucfirst($k->jenis) }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-slate-600">
                            {{ $k->program ? $k->program->nama_program : '-' }}
                        </td>
                        <td class="px-4 py-3 text-right font-medium {{ $k->jenis === 'realisasi' ? 'text-emerald-600' : 'text-slate-900' }}">
                            {{ number_format($k->nominal, 0, ',', '.') }}
                        </td>
                        <td class="px-4 py-3 text-right space-x-2">
                            <a href="{{ route('keuangan.show', $k) }}" class="text-slate-500 hover:text-slate-900 hover:-translate-y-0.5 inline-block transition-transform"><i class="fa-solid fa-eye"></i></a>
                            @can('keuangan.ubah')
                            <a href="{{ route('keuangan.edit', $k) }}" class="text-blue-600 hover:text-blue-800 hover:-translate-y-0.5 inline-block transition-transform"><i class="fa-solid fa-pen"></i></a>
                            @endcan
                            @if(auth()->user()->hasRole('admin'))
                            <form action="{{ route('keuangan.destroy', $k) }}" method="POST" class="inline" onsubmit="return confirm('Yakin ingin menghapus transaksi ini? Tindakan ini hanya boleh dilakukan oleh Admin.')">
                                @csrf @method('DELETE')
                                <button type="submit" class="text-rose-600 hover:text-rose-800 hover:-translate-y-0.5 inline-block transition-transform"><i class="fa-solid fa-trash"></i></button>
                            </form>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">Belum ada data keuangan.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-4 border-t">
            {{ $keuangan->links() }}
        </div>
    </div>
</div>
@endsection
