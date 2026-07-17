import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

// ─── GET /api/pegawai — Daftar pegawai (dengan search & filter) ──────────────
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const perPage = 15;

  const supabase = await createClient();

  let query = supabase
    .from('pegawai')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (q) query = query.or(`nama.ilike.%${q}%,nip.ilike.%${q}%,unit_kerja.ilike.%${q}%`);
  if (status) query = query.eq('status', status);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ message: 'Gagal mengambil data.' }, { status: 500 });
  }

  return NextResponse.json({ data, total: count ?? 0, page, perPage });
}

// ─── POST /api/pegawai — Tambah pegawai baru ────────────────────────────────
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  if (!['admin', 'operator-kepegawaian'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json() as Record<string, unknown>;

  // Validasi manual (setara StorePegawaiRequest Laravel)
  const errors: Record<string, string> = {};
  if (!body['nip'] || typeof body['nip'] !== 'string' || body['nip'].length !== 18) {
    errors['nip'] = 'NIP harus 18 digit.';
  }
  if (!body['nama'] || typeof body['nama'] !== 'string') {
    errors['nama'] = 'Nama wajib diisi.';
  }
  if (!body['jabatan'] || typeof body['jabatan'] !== 'string') {
    errors['jabatan'] = 'Jabatan wajib diisi.';
  }
  if (!body['unit_kerja'] || typeof body['unit_kerja'] !== 'string') {
    errors['unit_kerja'] = 'Unit kerja wajib diisi.';
  }
  if (!body['status'] || !['aktif', 'pensiun', 'mutasi', 'nonaktif'].includes(body['status'] as string)) {
    errors['status'] = 'Status tidak valid.';
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: 'Validasi gagal.', errors }, { status: 422 });
  }

  const supabase = await createClient();

  // Cek NIP unik
  const { data: existing } = await supabase
    .from('pegawai')
    .select('id')
    .eq('nip', body['nip'])
    .is('deleted_at', null)
    .single();

  if (existing) {
    return NextResponse.json(
      { message: 'Validasi gagal.', errors: { nip: 'NIP sudah terdaftar.' } },
      { status: 422 },
    );
  }

  const { data, error } = await supabase
    .from('pegawai')
    .insert({
      nip: body['nip'],
      nama: body['nama'],
      jabatan: body['jabatan'],
      golongan: body['golongan'] ?? null,
      unit_kerja: body['unit_kerja'],
      pendidikan_terakhir: body['pendidikan_terakhir'] ?? null,
      tmt_jabatan: body['tmt_jabatan'] ?? null,
      status: body['status'],
      folder_id: body['folder_id'] ?? null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: 'Gagal menyimpan data: ' + error.message }, { status: 500 });
  }

  await logActivity({
    logName: 'kepegawaian',
    description: `Menambah data pegawai atas nama ${data.nama}`,
    causerId: user.id,
    subjectType: 'pegawai',
    subjectId: data.id,
  });

  return NextResponse.json({ data, message: 'Data pegawai berhasil ditambahkan.' }, { status: 201 });
}
