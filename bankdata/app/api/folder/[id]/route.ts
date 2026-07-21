import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

interface RouteParams { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const { createServiceClient } = await import('@/lib/supabase/server');
  const supabase = await createServiceClient();

  const { data, error } = await supabase.from('folders').update({
    nama: body['nama'],
    updated_by: user.id,
  }).eq('id', id).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  await logActivity({ logName: 'folder', description: `Mengubah nama folder menjadi ${data.nama}`, causerId: user.id, subjectType: 'folder', subjectId: data.id });
  return NextResponse.json({ data, message: 'Folder berhasil diperbarui.' });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { createServiceClient } = await import('@/lib/supabase/server');
  const supabase = await createServiceClient();

  const { data: existing } = await supabase.from('folders').select('id, nama').eq('id', id).is('deleted_at', null).single();
  if (!existing) return NextResponse.json({ message: 'Tidak ditemukan.' }, { status: 404 });

  await supabase.from('folders').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  await logActivity({ logName: 'folder', description: `Menghapus folder ${existing.nama}`, causerId: user.id });
  return NextResponse.json({ message: 'Folder berhasil dihapus.' });
}
