<!DOCTYPE html>
<html>
<head>
    <title>Laporan Program - {{ $program->kode_program }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; line-height: 1.5; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h2 { margin: 0; font-size: 18px; }
        .header p { margin: 5px 0 0; font-size: 12px; }
        table.meta { width: 100%; margin-bottom: 20px; }
        table.meta th { text-align: left; width: 25%; padding: 5px 0; }
        table.meta td { width: 75%; padding: 5px 0; }
        
        table.data { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.data th, table.data td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        table.data th { background-color: #f3f4f6; }
        
        .summary-box { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; background-color: #f8fafc; }
        .summary-box .title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .success { color: #059669; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>LAPORAN REALISASI PROGRAM KERJA</h2>
        <p>Pemerintah Provinsi Sulawesi Tengah</p>
    </div>

    <table class="meta">
        <tr>
            <th>Kode Program</th>
            <td>: {{ $program->kode_program }}</td>
        </tr>
        <tr>
            <th>Nama Program</th>
            <td>: {{ $program->nama_program }}</td>
        </tr>
        <tr>
            <th>Tahun Anggaran</th>
            <td>: {{ $program->tahun_anggaran }}</td>
        </tr>
        <tr>
            <th>Unit Pelaksana</th>
            <td>: {{ $program->unit_pelaksana }}</td>
        </tr>
        <tr>
            <th>Status</th>
            <td>: {{ ucfirst($program->status) }}</td>
        </tr>
    </table>

    <div class="summary-box">
        <div class="title">Ringkasan Keuangan</div>
        <table style="width:100%">
            <tr>
                <td style="width:33%">Target Anggaran</td>
                <td style="width:33%">Total Realisasi</td>
                <td style="width:33%">Persentase Capaian</td>
            </tr>
            <tr>
                <td style="font-size:16px; font-weight:bold;">Rp {{ number_format($program->target, 0, ',', '.') }}</td>
                <td style="font-size:16px; font-weight:bold; color: #059669;">Rp {{ number_format($program->realisasi, 0, ',', '.') }}</td>
                <td style="font-size:16px; font-weight:bold;">{{ $program->persen_capaian }}%</td>
            </tr>
        </table>
    </div>

    <h3 style="font-size: 14px; margin-bottom:5px;">Rincian Transaksi Keuangan</h3>
    <table class="data">
        <thead>
            <tr>
                <th>No</th>
                <th>No Transaksi</th>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Keterangan</th>
                <th class="text-right">Nominal (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($program->transaksiKeuangan as $index => $trx)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $trx->no_transaksi }}</td>
                <td>{{ $trx->tanggal->format('d/m/Y') }}</td>
                <td>{{ ucfirst($trx->jenis) }}</td>
                <td>{{ $trx->keterangan ?: '-' }}</td>
                <td class="text-right">{{ number_format($trx->nominal, 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="text-center">Belum ada transaksi tercatat.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top: 50px; text-align: right;">
        <p>Dicetak pada: {{ now()->format('d F Y H:i') }}</p>
        <br><br><br>
        <p>_______________________</p>
    </div>
</body>
</html>
