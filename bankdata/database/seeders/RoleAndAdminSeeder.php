<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndAdminSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'kepegawaian.tambah', 'kepegawaian.ubah', 'kepegawaian.hapus',
            'program.tambah', 'program.ubah', 'program.hapus',
            'aset.tambah', 'aset.ubah', 'aset.hapus',
            'keuangan.tambah', 'keuangan.ubah', 'keuangan.hapus',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions($permissions);

        Role::firstOrCreate(['name' => 'operator-kepegawaian'])
            ->syncPermissions(['kepegawaian.tambah', 'kepegawaian.ubah', 'kepegawaian.hapus']);

        Role::firstOrCreate(['name' => 'operator-program'])
            ->syncPermissions(['program.tambah', 'program.ubah', 'program.hapus']);

        Role::firstOrCreate(['name' => 'operator-aset'])
            ->syncPermissions(['aset.tambah', 'aset.ubah', 'aset.hapus']);

        Role::firstOrCreate(['name' => 'operator-keuangan'])
            ->syncPermissions(['keuangan.tambah', 'keuangan.ubah']); // hapus keuangan sengaja tidak diberikan, hanya admin

        Role::firstOrCreate(['name' => 'viewer']); // hanya bisa lihat, tanpa permission tambahan

        // GANTI password ini segera setelah login pertama kali di production!
        $user = User::firstOrCreate(
            ['email' => 'admin@sulteng.go.id'],
            [
                'name' => 'Administrator Sistem',
                'password' => Hash::make('GantiSegera!2026'),
                'unit_kerja' => 'Biro Organisasi Setda',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $user->assignRole('admin');
    }
}
