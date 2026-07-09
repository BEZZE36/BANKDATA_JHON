<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Attachment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Trait ini dipakai semua controller modul (Pegawai, Program, Aset, Keuangan)
 * agar aturan keamanan upload file SERAGAM di seluruh aplikasi:
 *  - Validasi ulang MIME asli file (bukan cuma ekstensi, supaya tidak bisa dikelabui
 *    dengan mengganti nama file .php jadi .pdf)
 *  - Nama file di-generate ulang (acak) agar tidak bisa ditebak / dieksekusi
 *  - Disimpan di luar folder public langsung (storage/app/private) lalu diakses lewat
 *    route terproteksi auth, bukan URL publik statis.
 */
trait HandlesSecureUploads
{
    protected function simpanLampiran(UploadedFile $file, $model, int $userId): Attachment
    {
        $mimeAsli = $file->getMimeType();
        $allowed = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        abort_unless(in_array($mimeAsli, $allowed, true), 422, 'Tipe file tidak diizinkan.');
        abort_unless($file->getSize() <= 5 * 1024 * 1024, 422, 'Ukuran file maksimal 5MB.');

        $namaAman = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('lampiran/' . class_basename($model), $namaAman, 'local');

        return $model->attachments()->create([
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $mimeAsli,
            'size_kb' => intdiv($file->getSize(), 1024),
            'uploaded_by' => $userId,
        ]);
    }
}
