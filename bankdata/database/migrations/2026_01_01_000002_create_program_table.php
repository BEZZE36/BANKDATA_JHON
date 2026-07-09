<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program', function (Blueprint $table) {
            $table->id();
            $table->string('kode_program', 30)->unique();
            $table->string('nama_program');
            $table->unsignedSmallInteger('tahun_anggaran');
            $table->string('unit_pelaksana');
            $table->decimal('target', 15, 2)->default(0);
            $table->decimal('realisasi', 15, 2)->default(0);
            $table->enum('status', ['perencanaan', 'berjalan', 'selesai', 'ditunda'])->default('perencanaan');
            $table->text('keterangan')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['tahun_anggaran', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program');
    }
};
