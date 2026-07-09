<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('folders', function (Blueprint $table) {
            $table->id();
            // modul menentukan folder ini punya isi Data Kepegawaian / Program / Aset / Keuangan
            $table->enum('modul', ['kepegawaian', 'program', 'aset', 'keuangan']);
            // parent_id menunjuk ke folders.id lagi -> ini yang bikin nested tak terbatas,
            // persis seperti folder di dalam folder di Windows Explorer.
            $table->foreignId('parent_id')->nullable()->constrained('folders')->cascadeOnDelete();
            $table->string('nama');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['modul', 'parent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('folders');
    }
};
