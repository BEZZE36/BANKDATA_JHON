<?php

namespace App\Exports;

use App\Models\Aset;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AsetExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Aset::latest()->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Kode Aset',
            'Nama Aset',
            'Kategori',
            'Lokasi',
            'Kondisi',
            'Tahun Perolehan',
            'Nilai Perolehan (Rp)',
            'Tanggal Didaftarkan'
        ];
    }

    public function map($aset): array
    {
        static $no = 1;
        return [
            $no++,
            $aset->kode_aset,
            $aset->nama_aset,
            $aset->kategori,
            $aset->lokasi,
            ucwords(str_replace('_', ' ', $aset->kondisi)),
            $aset->tahun_perolehan,
            $aset->nilai_perolehan,
            $aset->created_at->format('d/m/Y H:i')
        ];
    }
}
