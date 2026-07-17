import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import * as XLSX from 'xlsx';

interface RouteParams { params: Promise<{ modul: string }> }

const KOLOM: Record<string, Record<string, string>> = {
  kepegawaian: {
    nip: 'NIP', nama: 'Nama', jabatan: 'Jabatan', golongan: 'Golongan',
    unit_kerja: 'Unit Kerja', pendidikan_terakhir: 'Pendidikan Terakhir',
    tmt_jabatan: 'TMT Jabatan', status: 'Status',
  },
  program: {
    kode_program: 'Kode Program', nama_program: 'Nama Program',
    tahun_anggaran: 'Tahun Anggaran', unit_pelaksana: 'Unit Pelaksana',
    target: 'Target', realisasi: 'Realisasi', status: 'Status', keterangan: 'Keterangan',
  },
  aset: {
    kode_aset: 'Kode Aset', nama_aset: 'Nama Aset', kategori: 'Kategori',
    lokasi: 'Lokasi', kondisi: 'Kondisi', tahun_perolehan: 'Tahun Perolehan',
    nilai_perolehan: 'Nilai Perolehan',
  },
  keuangan: {
    no_transaksi: 'No Transaksi', jenis: 'Jenis', nominal: 'Nominal',
    tanggal: 'Tanggal', keterangan: 'Keterangan',
  },
};

const TABEL: Record<string, string> = {
  kepegawaian: 'pegawai',
  program: 'program',
  aset: 'aset',
  keuangan: 'keuangan',
};

// GET /api/export/[modul] — Export data modul ke Excel
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { modul } = await params;

  if (!KOLOM[modul]) {
    return NextResponse.json({ message: 'Modul tidak valid.' }, { status: 404 });
  }

  const tabel = TABEL[modul]!;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tabel)
    .select(Object.keys(KOLOM[modul]!).join(','))
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  // Konversi keys ke label Indonesia
  const kolom = KOLOM[modul]!;
  const rows = (data ?? []).map((row) => {
    const mapped: Record<string, unknown> = {};
    for (const [key, label] of Object.entries(kolom)) {
      mapped[label] = (row as unknown as Record<string, unknown>)[key] ?? '';
    }
    return mapped;
  });

  // Buat workbook Excel dengan SheetJS
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, modul);

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${modul}-${now}.xlsx"`,
    },
  });
}

// GET /api/export/[modul]?template=1 — Download template kosong
export async function POST(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { modul } = await params;
  if (!KOLOM[modul]) return NextResponse.json({ message: 'Modul tidak valid.' }, { status: 404 });

  // Template hanya header, tanpa data
  const kolom = KOLOM[modul]!;
  const emptyRow: Record<string, string> = {};
  for (const label of Object.values(kolom)) {
    emptyRow[label] = '';
  }

  const ws = XLSX.utils.json_to_sheet([emptyRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, modul);

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="template-${modul}.xlsx"`,
    },
  });
}
