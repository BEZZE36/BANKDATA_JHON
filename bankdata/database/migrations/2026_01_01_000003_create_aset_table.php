<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aset', function (Blueprint $table) {
            $table->id();
            $table->string('kode_aset', 30)->unique();
            $table->string('nama_aset');
            $table->string('kategori');
            $table->string('lokasi');
            $table->enum('kondisi', ['baik', 'rusak_ringan', 'rusak_berat'])->default('baik');
            $table->year('tahun_perolehan')->nullable();
            $table->decimal('nilai_perolehan', 15, 2)->default(0);
            $table->string('foto_path')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['kategori', 'kondisi', 'lokasi']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aset');
    }
};
