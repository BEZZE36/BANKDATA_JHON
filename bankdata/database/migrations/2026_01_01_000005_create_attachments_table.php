<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->morphs('attachable'); // attachable_id, attachable_type -> relasi ke pegawai/program/aset/keuangan
            $table->string('original_name');
            $table->string('path');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size_kb');
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
