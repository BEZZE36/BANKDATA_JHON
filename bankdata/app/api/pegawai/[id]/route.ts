import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── GET /api/pegawai/[id] — Detail pegawai ──────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pegawai')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    return NextResponse.json({ message: 'Data pegawai tidak ditemukan.' }, { status: 404 });
  }

  return NextResponse.json({ data });
}

// ─── PUT /api/pegawai/[id] — Update pegawai ──────────────────────────────────
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  if (!['admin', 'operator-kepegawaian'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const supabase = await createClient();

  // Cek pegawai ada
  const { data: existing } = await supabase
    .from('pegawai')
    .select('id, nama')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (!existing) {
    return NextResponse.json({ message: 'Data pegawai tidak ditemukan.' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('pegawai')
    .update({
      nip: body['nip'],
      nama: body['nama'],
      jabatan: body['jabatan'],
      golongan: body['golongan'] ?? null,
      unit_kerja: body['unit_kerja'],
      pendidikan_terakhir: body['pendidikan_terakhir'] ?? null,
      tmt_jabatan: body['tmt_jabatan'] ?? null,
      status: body['status'],
      updated_by: user.id,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: 'Gagal memperbarui data: ' + error.message }, { status: 500 });
  }

  await logActivity({
    logName: 'kepegawaian',
    description: `Mengubah data pegawai atas nama ${data.nama}`,
    causerId: user.id,
    subjectType: 'pegawai',
    subjectId: data.id,
  });

  return NextResponse.json({ data, message: 'Data pegawai berhasil diperbarui.' });
}

// ─── DELETE /api/pegawai/[id] — Soft delete pegawai ──────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  if (!['admin', 'operator-kepegawaian'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('pegawai')
    .select('id, nama')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (!existing) {
    return NextResponse.json({ message: 'Data tidak ditemukan.' }, { status: 404 });
  }

  // Soft delete: set deleted_at
  const { error } = await supabase
    .from('pegawai')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ message: 'Gagal menghapus data.' }, { status: 500 });
  }

  await logActivity({
    logName: 'kepegawaian',
    description: `Menghapus (arsip) data pegawai atas nama ${existing.nama}`,
    causerId: user.id,
  });

  return NextResponse.json({ message: 'Data pegawai berhasil dihapus.' });
}
