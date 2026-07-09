<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pegawai', function (Blueprint $table) {
            $table->id();
            $table->string('nip', 20)->unique();
            $table->string('nama');
            $table->string('jabatan');
            $table->string('golongan', 10)->nullable();
            $table->string('unit_kerja');
            $table->string('pendidikan_terakhir')->nullable();
            $table->date('tmt_jabatan')->nullable();
            $table->enum('status', ['aktif', 'pensiun', 'mutasi', 'nonaktif'])->default('aktif');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['nama', 'unit_kerja', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pegawai');
    }
};
