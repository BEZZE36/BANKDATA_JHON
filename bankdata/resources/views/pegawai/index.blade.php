@extends('layouts.app')
@section('title', 'Data Kepegawaian')

@section('content')
<div class="bg-white rounded-2xl border">
    <div class="p-4 border-b flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <form method="GET" class="flex gap-2">
            <input type="text" name="q" value="{{ request('q') }}" placeholder="Cari nama / NIP / unit kerja..."
                   class="rounded-lg border-slate-300 text-sm w-64 focus:ring-emerald-500 focus:border-emerald-500">
            <select name="status" class="rounded-lg border-slate-300 text-sm">
                <option value="">Semua status</option>
                @foreach(['aktif','pensiun','mutasi','nonaktif'] as $s)
                    <option value="{{ $s }}" @selected(request('status') === $s)>{{ ucfirst($s) }}</option>
                @endforeach
            </select>
            <button class="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">Filter</button>
        </form>
        @can('kepegawaian.tambah')
        <a href="{{ route('pegawai.create') }}" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 text-center">
            <i class="fa-solid fa-plus mr-1"></i> Tambah Pegawai
        </a>
        @endcan
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                    <th class="text-left px-4 py-3">NIP</th>
                    <th class="text-left px-4 py-3">Nama</th>
                    <th class="text-left px-4 py-3">Jabatan</th>
                    <th class="text-left px-4 py-3">Unit Kerja</th>
                    <th class="text-left px-4 py-3">Status</th>
                    <th class="text-right px-4 py-3">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse ($pegawai as $p)
                <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3">{{ $p->nip }}</td>
                    <td class="px-4 py-3 font-medium text-slate-900">{{ $p->nama }}</td>
                    <td class="px-4 py-3">{{ $p->jabatan }}</td>
                    <td class="px-4 py-3">{{ $p->unit_kerja }}</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs
                            {{ $p->status === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600' }}">
                            {{ ucfirst($p->status) }}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-right space-x-2">
                        <a href="{{ route('pegawai.show', $p) }}" class="text-slate-500 hover:text-slate-900"><i class="fa-solid fa-eye"></i></a>
                        @can('kepegawaian.ubah')
                        <a href="{{ route('pegawai.edit', $p) }}" class="text-blue-600 hover:text-blue-800"><i class="fa-solid fa-pen"></i></a>
                        @endcan
                        @can('kepegawaian.hapus')
                        <form action="{{ route('pegawai.destroy', $p) }}" method="POST" class="inline"
                              onsubmit="return confirm('Yakin ingin menghapus data ini?')">
                            @csrf @method('DELETE')
                            <button class="text-rose-600 hover:text-rose-800"><i class="fa-solid fa-trash"></i></button>
                        </form>
                        @endcan
                    </td>
                </tr>
                @empty
                <tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">Belum ada data pegawai.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="p-4 border-t">
        {{ $pegawai->links() }}
    </div>
</div>
@endsection
