<?php

namespace App\Http\Controllers;

use App\Exports\ModulExport;
use App\Imports\AsetImport;
use App\Imports\KeuanganImport;
use App\Imports\PegawaiImport;
use App\Imports\ProgramImport;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    /** Kolom yang dipakai untuk export & template kosong, per modul */
    private const KOLOM = [
        'kepegawaian' => [
            'NIP' => 'nip', 'Nama' => 'nama', 'Jabatan' => 'jabatan', 'Golongan' => 'golongan',
            'Unit Kerja' => 'unit_kerja', 'Pendidikan Terakhir' => 'pendidikan_terakhir',
            'TMT Jabatan' => 'tmt_jabatan', 'Status' => 'status',
        ],
        'program' => [
            'Kode Program' => 'kode_program', 'Nama Program' => 'nama_program',
            'Tahun Anggaran' => 'tahun_anggaran', 'Unit Pelaksana' => 'unit_pelaksana',
            'Target' => 'target', 'Realisasi' => 'realisasi', 'Status' => 'status', 'Keterangan' => 'keterangan',
        ],
        'aset' => [
            'Kode Aset' => 'kode_aset', 'Nama Aset' => 'nama_aset', 'Kategori' => 'kategori',
            'Lokasi' => 'lokasi', 'Kondisi' => 'kondisi', 'Tahun Perolehan' => 'tahun_perolehan',
            'Nilai Perolehan' => 'nilai_perolehan',
        ],
        'keuangan' => [
            'No Transaksi' => 'no_transaksi', 'Jenis' => 'jenis', 'Nominal' => 'nominal',
            'Tanggal' => 'tanggal', 'Keterangan' => 'keterangan',
        ],
    ];

    private const MODUL_KE_ROLE = [
        'kepegawaian' => 'operator-kepegawaian',
        'program' => 'operator-program',
        'aset' => 'operator-aset',
        'keuangan' => 'operator-keuangan',
    ];

    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
    }

    public function import(Request $request, string $modul, Folder $folder)
    {
        abort_unless(array_key_exists($modul, self::KOLOM), 404);
        abort_unless($request->user()->hasAnyRole(['admin', self::MODUL_KE_ROLE[$modul]]), 403);

        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        $import = match ($modul) {
            'kepegawaian' => new PegawaiImport($folder->id, $request->user()->id),
            'program' => new ProgramImport($folder->id, $request->user()->id),
            'aset' => new AsetImport($folder->id, $request->user()->id),
            'keuangan' => new KeuanganImport($folder->id, $request->user()->id),
        };

        Excel::import($import, $request->file('file'));

        $gagal = $import->failures();

        activity('import')->causedBy($request->user())->performedOn($folder)
            ->log("Import Excel ke folder \"{$folder->nama}\" ({$modul}), " . $gagal->count() . ' baris gagal');

        if ($gagal->count() > 0) {
            $pesan = $gagal->map(fn ($f) => "Baris {$f->row()}: " . implode(', ', $f->errors()))->take(5)->implode(' | ');
            return back()->withErrors(['import' => "Sebagian data gagal diimpor ({$gagal->count()} baris). Contoh: {$pesan}"]);
        }

        return back()->with('sukses', 'Data berhasil diimpor dari Excel.');
    }

    public function export(string $modul, Folder $folder)
    {
        abort_unless(array_key_exists($modul, self::KOLOM), 404);
        abort_if($folder->modul !== $modul, 404);

        $data = new Collection($folder->itemQuery()->get()->toArray());
        $namaFile = "{$modul}-{$folder->nama}-" . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new ModulExport($data, self::KOLOM[$modul]), $namaFile);
    }

    public function template(string $modul, Folder $folder)
    {
        abort_unless(array_key_exists($modul, self::KOLOM), 404);

        $kosong = new Collection(); // template hanya berisi header, tanpa baris data
        return Excel::download(new ModulExport($kosong, self::KOLOM[$modul]), "template-{$modul}.xlsx");
    }
}
