<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['pegawai', 'program', 'aset', 'keuangan'] as $tabel) {
            Schema::table($tabel, function (Blueprint $table) {
                $table->foreignId('folder_id')->nullable()->after('id')
                    ->constrained('folders')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach (['pegawai', 'program', 'aset', 'keuangan'] as $tabel) {
            Schema::table($tabel, function (Blueprint $table) {
                $table->dropConstrainedForeignId('folder_id');
            });
        }
    }
};
