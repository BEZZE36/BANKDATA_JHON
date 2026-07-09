@extends('layouts.app')
@section('title', 'Data Aset')

@section('content')
<div class="bg-white rounded-2xl border">
    <div class="p-4 border-b flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <form method="GET" class="flex gap-2">
            <input type="text" name="q" value="{{ request('q') }}" placeholder="Cari aset / kode / lokasi..."
                   class="rounded-lg border-slate-300 text-sm w-64 focus:ring-emerald-500 focus:border-emerald-500">
            <button class="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">Cari</button>
        </form>
        <div class="flex gap-2">
            <a href="{{ route('aset.excel') }}" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 text-center">
                <i class="fa-solid fa-file-excel mr-1"></i> Export Excel
            </a>
            @can('aset.tambah')
            <a href="{{ route('aset.create') }}" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 text-center">
                <i class="fa-solid fa-plus mr-1"></i> Tambah Aset
            </a>
            @endcan
        </div>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                    <th class="text-left px-4 py-3 w-16">Foto</th>
                    <th class="text-left px-4 py-3">Kode / Nama Aset</th>
                    <th class="text-left px-4 py-3">Kategori</th>
                    <th class="text-left px-4 py-3">Lokasi</th>
                    <th class="text-left px-4 py-3">Kondisi</th>
                    <th class="text-right px-4 py-3">Nilai (Rp)</th>
                    <th class="text-right px-4 py-3">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse ($aset as $a)
                <tr class="hover:bg-slate-50 transition-all">
                    <td class="px-4 py-3">
                        @if($a->foto_path)
                            <img src="{{ Storage::url($a->foto_path) }}" alt="{{ $a->nama_aset }}" class="w-12 h-12 rounded-lg object-cover border">
                        @else
                            <div class="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border">
                                <i class="fa-solid fa-image"></i>
                            </div>
                        @endif
                    </td>
                    <td class="px-4 py-3">
                        <div class="font-medium text-slate-900">{{ $a->nama_aset }}</div>
                        <div class="text-xs text-slate-500">{{ $a->kode_aset }} &middot; Thn: {{ $a->tahun_perolehan }}</div>
                    </td>
                    <td class="px-4 py-3">{{ $a->kategori }}</td>
                    <td class="px-4 py-3">{{ $a->lokasi }}</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs 
                            {{ $a->kondisi === 'baik' ? 'bg-emerald-50 text-emerald-700' : ($a->kondisi === 'rusak_ringan' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700') }}">
                            {{ ucwords(str_replace('_', ' ', $a->kondisi)) }}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                        {{ number_format($a->nilai_perolehan, 0, ',', '.') }}
                    </td>
                    <td class="px-4 py-3 text-right space-x-2">
                        <a href="{{ route('aset.show', $a) }}" class="text-slate-500 hover:text-slate-900 hover:-translate-y-0.5 inline-block transition-transform"><i class="fa-solid fa-eye"></i></a>
                        @can('aset.ubah')
                        <a href="{{ route('aset.edit', $a) }}" class="text-blue-600 hover:text-blue-800 hover:-translate-y-0.5 inline-block transition-transform"><i class="fa-solid fa-pen"></i></a>
                        @endcan
                        @can('aset.hapus')
                        <form action="{{ route('aset.destroy', $a) }}" method="POST" class="inline" onsubmit="return confirm('Yakin ingin menghapus data ini?')">
                            @csrf @method('DELETE')
                            <button type="submit" class="text-rose-600 hover:text-rose-800 hover:-translate-y-0.5 inline-block transition-transform"><i class="fa-solid fa-trash"></i></button>
                        </form>
                        @endcan
                    </td>
                </tr>
                @empty
                <tr><td colspan="7" class="px-4 py-8 text-center text-slate-400">Belum ada data aset.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="p-4 border-t">
        {{ $aset->links() }}
    </div>
</div>
@endsection
