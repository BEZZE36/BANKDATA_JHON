<?php

namespace App\Exports;

use Illuminate\Support\Collection as SupportCollection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * Export generik dipakai untuk semua modul (Kepegawaian/Program/Aset/Keuangan).
 * $kolom adalah peta [judul_kolom_excel => nama_field_model], urutannya menentukan
 * urutan kolom di file Excel yang dihasilkan.
 */
class ModulExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        private SupportCollection $data,
        private array $kolom,
    ) {}

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        return array_keys($this->kolom);
    }

    public function map($row): array
    {
        return array_map(function ($field) use ($row) {
            $value = data_get($row, $field);
            return $value instanceof \Carbon\Carbon ? $value->format('Y-m-d') : $value;
        }, array_values($this->kolom));
    }
}
