import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const jenis = searchParams.get('jenis') ?? '';
  const dari = searchParams.get('dari') ?? '';
  const sampai = searchParams.get('sampai') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const perPage = 15;
  const supabase = await createClient();

  let query = supabase.from('keuangan').select('*, program(id, nama_program)', { count: 'exact' })
    .is('deleted_at', null).order('tanggal', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (jenis) query = query.eq('jenis', jenis);
  if (dari) query = query.gte('tanggal', dari);
  if (sampai) query = query.lte('tanggal', sampai);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  // Ringkasan total
  const { data: summary } = await supabase.from('keuangan').select('jenis, nominal').is('deleted_at', null);
  const safeSummary = summary ?? [];
  const totalAnggaran = safeSummary.filter(k => k.jenis === 'anggaran').reduce((s, k) => s + Number(k.nominal), 0);
  const totalRealisasi = safeSummary.filter(k => k.jenis === 'realisasi').reduce((s, k) => s + Number(k.nominal), 0);

  return NextResponse.json({ data, total: count ?? 0, page, perPage, summary: { totalAnggaran, totalRealisasi } });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'operator-keuangan'].includes(user.role)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const body = await request.json() as Record<string, unknown>;
  const errors: Record<string, string> = {};
  if (!body['no_transaksi']) errors['no_transaksi'] = 'No. transaksi wajib diisi.';
  if (!body['jenis'] || !['anggaran', 'realisasi'].includes(body['jenis'] as string)) errors['jenis'] = 'Jenis tidak valid.';
  if (body['nominal'] === undefined || isNaN(Number(body['nominal']))) errors['nominal'] = 'Nominal wajib diisi.';
  if (!body['tanggal']) errors['tanggal'] = 'Tanggal wajib diisi.';
  if (Object.keys(errors).length > 0) return NextResponse.json({ message: 'Validasi gagal.', errors }, { status: 422 });

  const supabase = await createClient();
  const { data: existing } = await supabase.from('keuangan').select('id').eq('no_transaksi', body['no_transaksi']).is('deleted_at', null).single();
  if (existing) return NextResponse.json({ message: 'Validasi gagal.', errors: { no_transaksi: 'No. transaksi sudah terdaftar.' } }, { status: 422 });

  const { data, error } = await supabase.from('keuangan').insert({
    no_transaksi: body['no_transaksi'],
    jenis: body['jenis'],
    nominal: Number(body['nominal']),
    tanggal: body['tanggal'],
    keterangan: body['keterangan'] ?? null,
    program_id: body['program_id'] ? Number(body['program_id']) : null,
    folder_id: body['folder_id'] ? Number(body['folder_id']) : null,
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  await logActivity({ logName: 'keuangan', description: `Menambah transaksi keuangan ${data.no_transaksi}`, causerId: user.id, subjectType: 'keuangan', subjectId: data.id });
  return NextResponse.json({ data, message: 'Transaksi berhasil dicatat.' }, { status: 201 });
}
