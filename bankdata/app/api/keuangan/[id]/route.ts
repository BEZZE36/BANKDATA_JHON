import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from('keuangan').select('*, program(*)').eq('id', id).is('deleted_at', null).single();
  if (error || !data) return NextResponse.json({ message: 'Tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'operator-keuangan'].includes(user.role)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const supabase = await createClient();
  const { data, error } = await supabase.from('keuangan').update({
    no_transaksi: body['no_transaksi'],
    jenis: body['jenis'],
    nominal: Number(body['nominal']),
    tanggal: body['tanggal'],
    keterangan: body['keterangan'] ?? null,
    program_id: body['program_id'] ? Number(body['program_id']) : null,
    updated_by: user.id,
  }).eq('id', id).select().single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  await logActivity({ logName: 'keuangan', description: `Mengubah transaksi keuangan ${data.no_transaksi}`, causerId: user.id, subjectType: 'keuangan', subjectId: data.id });
  return NextResponse.json({ data, message: 'Transaksi berhasil diperbarui.' });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // Hapus keuangan hanya admin
  if (user.role !== 'admin') return NextResponse.json({ message: 'Hanya admin yang dapat menghapus data keuangan.' }, { status: 403 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: existing } = await supabase.from('keuangan').select('id, no_transaksi').eq('id', id).is('deleted_at', null).single();
  if (!existing) return NextResponse.json({ message: 'Tidak ditemukan.' }, { status: 404 });
  await supabase.from('keuangan').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  await logActivity({ logName: 'keuangan', description: `Menghapus (arsip) transaksi ${existing.no_transaksi}`, causerId: user.id });
  return NextResponse.json({ message: 'Transaksi berhasil dihapus.' });
}
