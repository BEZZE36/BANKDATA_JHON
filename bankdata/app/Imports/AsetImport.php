<?php

namespace App\Imports;

use App\Models\Aset;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;

/**
 * Kolom header Excel: kode_aset, nama_aset, kategori, lokasi, kondisi,
 * tahun_perolehan, nilai_perolehan
 */
class AsetImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure, \Maatwebsite\Excel\Concerns\SkipsEmptyRows
{
    use SkipsFailures;

    public function __construct(
        private ?int $folderId,
        private int $userId,
    ) {}

    public function model(array $row)
    {
        return new Aset([
            'folder_id' => $this->folderId,
            'kode_aset' => (string) $row['kode_aset'],
            'nama_aset' => $row['nama_aset'],
            'kategori' => $row['kategori'],
            'lokasi' => $row['lokasi'],
            'kondisi' => $row['kondisi'] ?? 'baik',
            'tahun_perolehan' => $row['tahun_perolehan'] ?? null,
            'nilai_perolehan' => $row['nilai_perolehan'] ?? 0,
            'created_by' => $this->userId,
        ]);
    }

    public function rules(): array
    {
        return [
            'kode_aset' => ['required'],
            'nama_aset' => ['required'],
            'kategori' => ['required'],
            'lokasi' => ['required'],
            'kondisi' => ['nullable', 'in:baik,rusak_ringan,rusak_berat'],
        ];
    }
}
