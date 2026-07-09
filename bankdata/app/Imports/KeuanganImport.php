<?php

namespace App\Imports;

use App\Models\Keuangan;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;

/**
 * Kolom header Excel: no_transaksi, jenis (anggaran/realisasi), nominal,
 * tanggal (YYYY-MM-DD), keterangan
 */
class KeuanganImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure, \Maatwebsite\Excel\Concerns\SkipsEmptyRows
{
    use SkipsFailures;

    public function __construct(
        private ?int $folderId,
        private int $userId,
    ) {}

    public function model(array $row)
    {
        return new Keuangan([
            'folder_id' => $this->folderId,
            'no_transaksi' => (string) $row['no_transaksi'],
            'jenis' => $row['jenis'] ?? 'anggaran',
            'nominal' => $row['nominal'] ?? 0,
            'tanggal' => $row['tanggal'],
            'keterangan' => $row['keterangan'] ?? null,
            'created_by' => $this->userId,
        ]);
    }

    public function rules(): array
    {
        return [
            'no_transaksi' => ['required'],
            'jenis' => ['nullable', 'in:anggaran,realisasi'],
            'nominal' => ['required', 'numeric'],
            'tanggal' => ['required', 'date'],
        ];
    }
}
