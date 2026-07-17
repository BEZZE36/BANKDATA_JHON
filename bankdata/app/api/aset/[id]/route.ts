import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from('aset').select('*').eq('id', id).is('deleted_at', null).single();
  if (error || !data) return NextResponse.json({ message: 'Tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'operator-aset'].includes(user.role)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const supabase = await createClient();
  const formData = await request.formData();

  const payload: Record<string, unknown> = {
    kode_aset: formData.get('kode_aset'),
    nama_aset: formData.get('nama_aset'),
    kategori: formData.get('kategori'),
    lokasi: formData.get('lokasi'),
    kondisi: formData.get('kondisi'),
    tahun_perolehan: formData.get('tahun_perolehan') ? Number(formData.get('tahun_perolehan')) : null,
    nilai_perolehan: Number(formData.get('nilai_perolehan')),
    updated_by: user.id,
  };

  const foto = formData.get('foto') as File | null;
  if (foto && foto.size > 0) {
    const ext = foto.name.split('.').pop();
    const fileName = `foto-aset/${Date.now()}.${ext}`;
    const { data: up } = await supabase.storage
      .from(process.env['NEXT_PUBLIC_STORAGE_BUCKET'] ?? 'bankdata-storage')
      .upload(fileName, foto, { contentType: foto.type });
    if (up) payload['foto_path'] = up.path;
  }

  const { data, error } = await supabase.from('aset').update(payload).eq('id', id).select().single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  await logActivity({ logName: 'aset', description: `Mengubah aset ${data.nama_aset}`, causerId: user.id, subjectType: 'aset', subjectId: data.id });
  return NextResponse.json({ data, message: 'Data aset berhasil diperbarui.' });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'operator-aset'].includes(user.role)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: existing } = await supabase.from('aset').select('id, nama_aset').eq('id', id).is('deleted_at', null).single();
  if (!existing) return NextResponse.json({ message: 'Tidak ditemukan.' }, { status: 404 });
  await supabase.from('aset').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  await logActivity({ logName: 'aset', description: `Menghapus (arsip) aset ${existing.nama_aset}`, causerId: user.id });
  return NextResponse.json({ message: 'Data aset berhasil dihapus.' });
}
