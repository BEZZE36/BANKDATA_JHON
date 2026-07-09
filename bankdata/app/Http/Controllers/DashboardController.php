<?php

namespace App\Http\Controllers;

use App\Models\Aset;
use App\Models\Keuangan;
use App\Models\Pegawai;
use App\Models\Program;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
    }

    public function index()
    {
        $ringkasan = [
            'kepegawaian' => [
                'total' => Pegawai::count(),
                'aktif' => Pegawai::where('status', 'aktif')->count(),
            ],
            'program' => [
                'total' => Program::count(),
                'berjalan' => Program::where('status', 'berjalan')->count(),
            ],
            'aset' => [
                'total' => Aset::count(),
                'rusak' => Aset::whereIn('kondisi', ['rusak_ringan', 'rusak_berat'])->count(),
            ],
            'keuangan' => [
                'total_anggaran' => Keuangan::where('jenis', 'anggaran')->sum('nominal'),
                'total_realisasi' => Keuangan::where('jenis', 'realisasi')->sum('nominal'),
            ],
        ];

        return view('dashboard.index', [
            'ringkasan' => $ringkasan,
            'user' => Auth::user(),
        ]);
    }
}
