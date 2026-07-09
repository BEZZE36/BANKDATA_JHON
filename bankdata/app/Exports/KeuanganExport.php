<?php

namespace App\Exports;

use App\Models\Keuangan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class KeuanganExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Keuangan::with('program')->latest('tanggal')->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'No Transaksi',
            'Tanggal',
            'Jenis',
            'Nominal (Rp)',
            'Program Terkait',
            'Keterangan'
        ];
    }

    public function map($keuangan): array
    {
        static $no = 1;
        return [
            $no++,
            $keuangan->no_transaksi,
            $keuangan->tanggal->format('d/m/Y'),
            ucfirst($keuangan->jenis),
            $keuangan->nominal,
            $keuangan->program ? $keuangan->program->nama_program : '-',
            $keuangan->keterangan
        ];
    }
}
