<?php

namespace App\Imports;

use App\Models\Program;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;

/**
 * Kolom header Excel: kode_program, nama_program, tahun_anggaran,
 * unit_pelaksana, target, realisasi, status, keterangan
 */
class ProgramImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure, \Maatwebsite\Excel\Concerns\SkipsEmptyRows
{
    use SkipsFailures;

    public function __construct(
        private ?int $folderId,
        private int $userId,
    ) {}

    public function model(array $row)
    {
        return new Program([
            'folder_id' => $this->folderId,
            'kode_program' => (string) $row['kode_program'],
            'nama_program' => $row['nama_program'],
            'tahun_anggaran' => $row['tahun_anggaran'],
            'unit_pelaksana' => $row['unit_pelaksana'],
            'target' => $row['target'] ?? 0,
            'realisasi' => $row['realisasi'] ?? 0,
            'status' => $row['status'] ?? 'perencanaan',
            'keterangan' => $row['keterangan'] ?? null,
            'created_by' => $this->userId,
        ]);
    }

    public function rules(): array
    {
        return [
            'kode_program' => ['required'],
            'nama_program' => ['required'],
            'tahun_anggaran' => ['required', 'digits:4'],
            'unit_pelaksana' => ['required'],
            'status' => ['nullable', 'in:perencanaan,berjalan,selesai,ditunda'],
        ];
    }
}
