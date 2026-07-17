import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from('program').select('*, keuangan(*)').eq('id', id).is('deleted_at', null).single();
  if (error || !data) return NextResponse.json({ message: 'Tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'operator-program'].includes(user.role)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const supabase = await createClient();
  const { data, error } = await supabase.from('program').update({
    kode_program: body['kode_program'],
    nama_program: body['nama_program'],
    tahun_anggaran: Number(body['tahun_anggaran']),
    unit_pelaksana: body['unit_pelaksana'],
    target: Number(body['target']),
    realisasi: Number(body['realisasi']),
    status: body['status'],
    keterangan: body['keterangan'] ?? null,
    updated_by: user.id,
  }).eq('id', id).select().single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  await logActivity({ logName: 'program', description: `Mengubah program ${data.nama_program}`, causerId: user.id, subjectType: 'program', subjectId: data.id });
  return NextResponse.json({ data, message: 'Data program berhasil diperbarui.' });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'operator-program'].includes(user.role)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: existing } = await supabase.from('program').select('id, nama_program').eq('id', id).is('deleted_at', null).single();
  if (!existing) return NextResponse.json({ message: 'Tidak ditemukan.' }, { status: 404 });
  await supabase.from('program').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  await logActivity({ logName: 'program', description: `Menghapus (arsip) program ${existing.nama_program}`, causerId: user.id });
  return NextResponse.json({ message: 'Data program berhasil dihapus.' });
}
