import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';
import * as XLSX from 'xlsx';

interface RouteParams { params: Promise<{ modul: string }> }

const HEADER_MAP: Record<string, Record<string, string>> = {
  kepegawaian: {
    'NIP': 'nip', 'Nama': 'nama', 'Jabatan': 'jabatan', 'Golongan': 'golongan',
    'Unit Kerja': 'unit_kerja', 'Pendidikan Terakhir': 'pendidikan_terakhir',
    'TMT Jabatan': 'tmt_jabatan', 'Status': 'status',
  },
  program: {
    'Kode Program': 'kode_program', 'Nama Program': 'nama_program',
    'Tahun Anggaran': 'tahun_anggaran', 'Unit Pelaksana': 'unit_pelaksana',
    'Target': 'target', 'Realisasi': 'realisasi', 'Status': 'status', 'Keterangan': 'keterangan',
  },
  aset: {
    'Kode Aset': 'kode_aset', 'Nama Aset': 'nama_aset', 'Kategori': 'kategori',
    'Lokasi': 'lokasi', 'Kondisi': 'kondisi', 'Tahun Perolehan': 'tahun_perolehan',
    'Nilai Perolehan': 'nilai_perolehan',
  },
  keuangan: {
    'No Transaksi': 'no_transaksi', 'Jenis': 'jenis', 'Nominal': 'nominal',
    'Tanggal': 'tanggal', 'Keterangan': 'keterangan',
  },
};

const TABEL: Record<string, string> = {
  kepegawaian: 'pegawai', program: 'program', aset: 'aset', keuangan: 'keuangan',
};

const MODUL_ROLE: Record<string, string> = {
  kepegawaian: 'operator-kepegawaian', program: 'operator-program',
  aset: 'operator-aset', keuangan: 'operator-keuangan',
};

// POST /api/import/[modul] — Import data dari file Excel
export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { modul } = await params;
  if (!HEADER_MAP[modul]) return NextResponse.json({ message: 'Modul tidak valid.' }, { status: 404 });

  const operatorRole = MODUL_ROLE[modul]!;
  if (!['admin', operatorRole].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const folderId = formData.get('folder_id') ? Number(formData.get('folder_id')) : null;

  if (!file) return NextResponse.json({ message: 'File wajib diunggah.' }, { status: 422 });

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]!]!;
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, unknown>[];

  const headerMap = HEADER_MAP[modul]!;
  const tabel = TABEL[modul]!;
  const supabase = await createClient();
  const gagal: string[] = [];
  let berhasil = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const mapped: Record<string, unknown> = {
      folder_id: folderId,
      created_by: user.id,
    };

    for (const [header, field] of Object.entries(headerMap)) {
      mapped[field] = row[header] ?? null;
    }

    const { error } = await supabase.from(tabel).insert(mapped);
    if (error) {
      gagal.push(`Baris ${i + 2}: ${error.message}`);
    } else {
      berhasil++;
    }
  }

  await logActivity({
    logName: 'import',
    description: `Import Excel ke modul ${modul}: ${berhasil} berhasil, ${gagal.length} gagal`,
    causerId: user.id,
  });

  if (gagal.length > 0) {
    return NextResponse.json({
      message: `${berhasil} baris berhasil, ${gagal.length} baris gagal.`,
      errors: gagal.slice(0, 5),
    }, { status: 207 });
  }

  return NextResponse.json({ message: `${berhasil} data berhasil diimpor.` });
}
