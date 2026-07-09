@extends('layouts.app')
@section('title', 'Data Program')

@section('content')
<div class="bg-white rounded-2xl border">
    <div class="p-4 border-b flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <form method="GET" class="flex gap-2">
            <input type="text" name="q" value="{{ request('q') }}" placeholder="Cari nama / kode program..."
                   class="rounded-lg border-slate-300 text-sm w-64 focus:ring-emerald-500 focus:border-emerald-500">
            <select name="tahun_anggaran" class="rounded-lg border-slate-300 text-sm">
                <option value="">Semua Tahun</option>
                @for($i = date('Y'); $i >= 2020; $i--)
                    <option value="{{ $i }}" @selected(request('tahun_anggaran') == $i)>{{ $i }}</option>
                @endfor
            </select>
            <button class="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">Filter</button>
        </form>
        @can('program.tambah')
        <a href="{{ route('program.create') }}" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 text-center">
            <i class="fa-solid fa-plus mr-1"></i> Tambah Program
        </a>
        @endcan
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                    <th class="text-left px-4 py-3">Kode / Nama</th>
                    <th class="text-left px-4 py-3">Tahun</th>
                    <th class="text-left px-4 py-3">Unit Pelaksana</th>
                    <th class="text-left px-4 py-3">Capaian (Rp)</th>
                    <th class="text-left px-4 py-3">Status</th>
                    <th class="text-right px-4 py-3">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse ($program as $p)
                <tr class="hover:bg-slate-50 transition-all">
                    <td class="px-4 py-3">
                        <div class="font-medium text-slate-900">{{ $p->nama_program }}</div>
                        <div class="text-xs text-slate-500">{{ $p->kode_program }}</div>
                    </td>
                    <td class="px-4 py-3">{{ $p->tahun_anggaran }}</td>
                    <td class="px-4 py-3">{{ $p->unit_pelaksana }}</td>
                    <td class="px-4 py-3 min-w-[200px]">
                        <div class="flex justify-between text-xs mb-1">
                            <span>Rp {{ number_format($p->realisasi, 0, ',', '.') }}</span>
                            <span class="text-slate-500">Rp {{ number_format($p->target, 0, ',', '.') }}</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-1.5">
                            <div class="bg-emerald-500 h-1.5 rounded-full" style="width: {{ min(100, $p->persen_capaian) }}%"></div>
                        </div>
                        <div class="text-[10px] text-right mt-0.5 text-slate-500">{{ $p->persen_capaian }}%</div>
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">
                            {{ ucfirst($p->status) }}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-right space-x-2">
                        <a href="{{ route('program.show', $p) }}" class="text-slate-500 hover:text-slate-900 hover:-translate-y-0.5 inline-block transition-transform"><i class="fa-solid fa-eye"></i></a>
                        @can('program.ubah')
                        <a href="{{ route('program.edit', $p) }}" class="text-blue-600 hover:text-blue-800 hover:-translate-y-0.5 inline-block transition-transform"><i class="fa-solid fa-pen"></i></a>
                        @endcan
                        @can('program.hapus')
                        <form action="{{ route('program.destroy', $p) }}" method="POST" class="inline" onsubmit="return confirm('Yakin ingin menghapus data ini?')">
                            @csrf @method('DELETE')
                            <button type="submit" class="text-rose-600 hover:text-rose-800 hover:-translate-y-0.5 inline-block transition-transform"><i class="fa-solid fa-trash"></i></button>
                        </form>
                        @endcan
                    </td>
                </tr>
                @empty
                <tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">Belum ada data program.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="p-4 border-t">
        {{ $program->links() }}
    </div>
</div>
@endsection
