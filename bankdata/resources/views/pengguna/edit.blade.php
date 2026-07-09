@extends('layouts.app')
@section('title', 'Ubah Data Pengguna')

@section('content')
<div class="bg-white rounded-2xl border p-6 max-w-2xl">
    <form method="POST" action="{{ route('pengguna.update', $pengguna) }}" class="space-y-4">
        @csrf @method('PUT')
        <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
                <label class="text-sm font-medium">Nama Lengkap</label>
                <input name="name" value="{{ old('name', $pengguna->name) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('name') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Email</label>
                <input name="email" type="email" value="{{ old('email', $pengguna->email) }}" required class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('email') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Unit Kerja</label>
                <input name="unit_kerja" value="{{ old('unit_kerja', $pengguna->unit_kerja) }}" class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                @error('unit_kerja') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Password Baru (Opsional)</label>
                <input name="password" type="password" class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Kosongkan jika tidak diubah">
                @error('password') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="text-sm font-medium">Konfirmasi Password</label>
                <input name="password_confirmation" type="password" class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="text-sm font-medium">Status Akun</label>
                <select name="is_active" class="mt-1 w-full rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="1" @selected(old('is_active', $pengguna->is_active) == '1')>Aktif</option>
                    <option value="0" @selected(old('is_active', $pengguna->is_active) == '0')>Nonaktif</option>
                </select>
                @error('is_active') <span class="text-xs text-rose-500">{{ $message }}</span> @enderror
            </div>
            <div class="col-span-2">
                <label class="text-sm font-medium">Peran (Role)</label>
                <div class="mt-2 flex flex-wrap gap-3">
                    @foreach($roles as $role)
                        @php
                            $isChecked = is_array(old('roles')) 
                                ? in_array($role, old('roles')) 
                                : in_array($role, $userRoles);
                        @endphp
                        <label class="flex items-center gap-2 border p-2 rounded-lg cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" name="roles[]" value="{{ $role }}" class="rounded text-emerald-600 focus:ring-emerald-500" {{ $isChecked ? 'checked' : '' }}>
                            <span class="text-sm">{{ $role }}</span>
                        </label>
                    @endforeach
                </div>
                @error('roles') <span class="text-xs text-rose-500 block mt-1">{{ $message }}</span> @enderror
            </div>
        </div>
        <div class="flex gap-3 pt-4">
            <button class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:-translate-y-0.5 transition-transform">Simpan Perubahan</button>
            <a href="{{ route('pengguna.index') }}" class="px-5 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 hover:-translate-y-0.5 transition-transform">Batal</a>
        </div>
    </form>
</div>
@endsection
