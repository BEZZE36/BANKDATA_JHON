import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

interface RouteParams { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const newName = body['nama'] as string;

  if (!newName || typeof newName !== 'string') {
    return NextResponse.json({ message: 'Nama file tidak valid.' }, { status: 400 });
  }

  const { createServiceClient } = await import('@/lib/supabase/server');
  const supabase = await createServiceClient();

  // Ambil data file existing
  const { data: existing, error: fetchError } = await supabase
    .from('attachments')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ message: 'File tidak ditemukan' }, { status: 404 });
  }

  // Pertahankan ekstensi file asli jika user menghapusnya saat rename
  const originalExt = existing.original_name.split('.').pop();
  let finalName = newName;
  if (originalExt && !finalName.endsWith(`.${originalExt}`)) {
    finalName = `${finalName}.${originalExt}`;
  }

  const { data, error } = await supabase.from('attachments').update({
    original_name: finalName,
  }).eq('id', id).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  
  await logActivity({ 
    logName: 'file', 
    description: `Mengubah nama file dari ${existing.original_name} menjadi ${data.original_name}`, 
    causerId: user.id, 
    subjectType: 'attachment', 
    subjectId: data.id 
  });
  
  return NextResponse.json({ data, message: 'Nama file berhasil diperbarui.' });
}
