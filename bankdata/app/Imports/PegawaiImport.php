<?php

namespace App\Imports;

use App\Models\Pegawai;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;

/**
 * Kolom header Excel yang diharapkan (huruf kecil semua, spasi jadi underscore
 * otomatis oleh WithHeadingRow): nip, nama, jabatan, golongan, unit_kerja,
 * pendidikan_terakhir, tmt_jabatan (YYYY-MM-DD), status
 */
class PegawaiImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure, \Maatwebsite\Excel\Concerns\SkipsEmptyRows
{
    use SkipsFailures;

    public function __construct(
        private ?int $folderId,
        private int $userId,
    ) {}

    public function model(array $row)
    {
        return new Pegawai([
            'folder_id' => $this->folderId,
            'nip' => (string) $row['nip'],
            'nama' => $row['nama'],
            'jabatan' => $row['jabatan'],
            'golongan' => $row['golongan'] ?? null,
            'unit_kerja' => $row['unit_kerja'],
            'pendidikan_terakhir' => $row['pendidikan_terakhir'] ?? null,
            'tmt_jabatan' => $row['tmt_jabatan'] ?? null,
            'status' => $row['status'] ?? 'aktif',
            'created_by' => $this->userId,
        ]);
    }

    public function rules(): array
    {
        return [
            'nip' => ['required'],
            'nama' => ['required'],
            'jabatan' => ['required'],
            'unit_kerja' => ['required'],
            'status' => ['nullable', 'in:aktif,pensiun,mutasi,nonaktif'],
        ];
    }
}
