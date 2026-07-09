<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('login_otps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('kode', 10); // disimpan ter-hash, bukan teks asli
            $table->timestamp('kedaluwarsa_pada');
            $table->unsignedTinyInteger('percobaan_gagal')->default(0);
            $table->timestamp('digunakan_pada')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'digunakan_pada']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_otps');
    }
};
