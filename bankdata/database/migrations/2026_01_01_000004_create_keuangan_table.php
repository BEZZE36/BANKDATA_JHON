<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('keuangan', function (Blueprint $table) {
            $table->id();
            $table->string('no_transaksi', 40)->unique();
            $table->enum('jenis', ['anggaran', 'realisasi'])->default('anggaran');
            $table->decimal('nominal', 15, 2);
            $table->foreignId('program_id')->nullable()->constrained('program')->nullOnDelete();
            $table->date('tanggal');
            $table->text('keterangan')->nullable();
            $table->string('bukti_path')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['jenis', 'tanggal']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('keuangan');
    }
};
