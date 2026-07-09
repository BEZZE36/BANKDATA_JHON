@extends('layouts.app')
@section('title', 'Manajemen Pengguna')

@section('content')
<div class="bg-white rounded-2xl border">
    <div class="p-4 border-b flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <form method="GET" class="flex gap-2">
            <input type="text" name="q" value="{{ request('q') }}" placeholder="Cari nama / email..."
                   class="rounded-lg border-slate-300 text-sm w-64 focus:ring-emerald-500 focus:border-emerald-500">
            <button class="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">Cari</button>
        </form>
        <a href="{{ route('pengguna.create') }}" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 text-center">
            <i class="fa-solid fa-plus mr-1"></i> Tambah Pengguna
        </a>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                    <th class="text-left px-4 py-3">Nama Lengkap</th>
                    <th class="text-left px-4 py-3">Email</th>
                    <th class="text-left px-4 py-3">Peran (Role)</th>
                    <th class="text-left px-4 py-3">Unit Kerja</th>
                    <th class="text-left px-4 py-3">Status</th>
                    <th class="text-right px-4 py-3">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse ($users as $u)
                <tr class="hover:bg-slate-50 transition-all">
                    <td class="px-4 py-3 font-medium text-slate-900">{{ $u->name }}</td>
                    <td class="px-4 py-3 text-slate-500">{{ $u->email }}</td>
                    <td class="px-4 py-3">
                        <div class="flex flex-wrap gap-1">
                            @foreach($u->roles as $role)
                                <span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border">{{ $role->name }}</span>
                            @endforeach
                        </div>
                    </td>
                    <td class="px-4 py-3">{{ $u->unit_kerja ?: '-' }}</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs 
                            {{ $u->is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700' }}">
                            {{ $u->is_active ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-right space-x-2">
                        <a href="{{ route('pengguna.edit', $u) }}" class="text-blue-600 hover:text-blue-800 hover:-translate-y-0.5 inline-block transition-transform"><i class="fa-solid fa-pen"></i></a>
                        @if(auth()->id() !== $u->id)
                        <form action="{{ route('pengguna.destroy', $u) }}" method="POST" class="inline" onsubmit="return confirm('Yakin ingin menghapus pengguna ini?')">
                            @csrf @method('DELETE')
                            <button type="submit" class="text-rose-600 hover:text-rose-800 hover:-translate-y-0.5 inline-block transition-transform"><i class="fa-solid fa-trash"></i></button>
                        </form>
                        @endif
                    </td>
                </tr>
                @empty
                <tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">Belum ada data pengguna.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="p-4 border-t">
        {{ $users->links() }}
    </div>
</div>
@endsection
