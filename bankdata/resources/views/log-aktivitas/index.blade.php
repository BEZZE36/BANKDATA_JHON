@extends('layouts.app')
@section('title', 'Log Aktivitas Sistem')

@section('content')
<div class="bg-white rounded-2xl border">
    <div class="p-4 border-b flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <form method="GET" class="flex flex-wrap gap-2 w-full">
            <select name="modul" class="rounded-lg border-slate-300 text-sm focus:ring-emerald-500">
                <option value="">Semua Modul</option>
                @foreach($modules as $mod)
                    @if($mod)
                        <option value="{{ $mod }}" @selected(request('modul') == $mod)>{{ ucfirst($mod) }}</option>
                    @endif
                @endforeach
            </select>
            <select name="user_id" class="rounded-lg border-slate-300 text-sm focus:ring-emerald-500 max-w-[200px]">
                <option value="">Semua Pengguna</option>
                @foreach($users as $id => $name)
                    <option value="{{ $id }}" @selected(request('user_id') == $id)>{{ $name }}</option>
                @endforeach
            </select>
            <button class="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Filter</button>
            @if(request()->anyFilled(['modul', 'user_id']))
                <a href="{{ route('log-aktivitas.index') }}" class="px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg font-medium">Reset</a>
            @endif
        </form>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                    <th class="text-left px-4 py-3 w-48">Waktu</th>
                    <th class="text-left px-4 py-3">Modul</th>
                    <th class="text-left px-4 py-3">Pengguna</th>
                    <th class="text-left px-4 py-3">Deskripsi Aktivitas</th>
                    <th class="text-left px-4 py-3 w-24">Detail</th>
                </tr>
            </thead>
            <tbody class="divide-y text-slate-600">
                @forelse ($activities as $log)
                <tr class="hover:bg-slate-50 transition-all">
                    <td class="px-4 py-3 text-xs whitespace-nowrap">
                        <span class="font-medium text-slate-800">{{ $log->created_at->format('d M Y') }}</span><br>
                        {{ $log->created_at->format('H:i:s') }}
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-[10px] uppercase font-bold bg-slate-100 text-slate-500">
                            {{ $log->log_name ?: 'System' }}
                        </span>
                    </td>
                    <td class="px-4 py-3 font-medium text-slate-900">
                        {{ $log->causer ? $log->causer->name : 'Sistem' }}
                    </td>
                    <td class="px-4 py-3">{{ $log->description }}</td>
                    <td class="px-4 py-3">
                        @if($log->properties->count() > 0)
                            <button type="button" onclick="alert('Data: \n{{ json_encode($log->properties, JSON_PRETTY_PRINT) }}')" class="px-2 py-1 bg-slate-100 text-xs rounded hover:bg-slate-200">Lihat</button>
                        @else
                            -
                        @endif
                    </td>
                </tr>
                @empty
                <tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">Belum ada catatan aktivitas.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="p-4 border-t">
        {{ $activities->links() }}
    </div>
</div>
@endsection
