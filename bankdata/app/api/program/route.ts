import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const tahun = searchParams.get('tahun_anggaran') ?? '';
  const status = searchParams.get('status') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const perPage = 15;

  const supabase = await createClient();
  let query = supabase
    .from('program')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (q) query = query.or(`nama_program.ilike.%${q}%,kode_program.ilike.%${q}%`);
  if (tahun) query = query.eq('tahun_anggaran', Number(tahun));
  if (status) query = query.eq('status', status);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count ?? 0, page, perPage });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'operator-program'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json() as Record<string, unknown>;
  const errors: Record<string, string> = {};

  if (!body['kode_program']) errors['kode_program'] = 'Kode program wajib diisi.';
  if (!body['nama_program']) errors['nama_program'] = 'Nama program wajib diisi.';
  if (!body['tahun_anggaran']) errors['tahun_anggaran'] = 'Tahun anggaran wajib diisi.';
  if (!body['unit_pelaksana']) errors['unit_pelaksana'] = 'Unit pelaksana wajib diisi.';
  if (body['target'] === undefined) errors['target'] = 'Target wajib diisi.';
  if (body['realisasi'] === undefined) errors['realisasi'] = 'Realisasi wajib diisi.';
  if (!body['status']) errors['status'] = 'Status wajib dipilih.';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: 'Validasi gagal.', errors }, { status: 422 });
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('program').select('id').eq('kode_program', body['kode_program']).is('deleted_at', null).single();
  if (existing) {
    return NextResponse.json({ message: 'Validasi gagal.', errors: { kode_program: 'Kode program sudah terdaftar.' } }, { status: 422 });
  }

  const { data, error } = await supabase.from('program').insert({
    kode_program: body['kode_program'],
    nama_program: body['nama_program'],
    tahun_anggaran: Number(body['tahun_anggaran']),
    unit_pelaksana: body['unit_pelaksana'],
    target: Number(body['target']),
    realisasi: Number(body['realisasi']),
    status: body['status'],
    keterangan: body['keterangan'] ?? null,
    folder_id: body['folder_id'] ?? null,
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  await logActivity({ logName: 'program', description: `Menambah program ${data.nama_program}`, causerId: user.id, subjectType: 'program', subjectId: data.id });
  return NextResponse.json({ data, message: 'Data program berhasil ditambahkan.' }, { status: 201 });
}
