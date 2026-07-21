import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const modul = searchParams.get('modul');
  const parentId = searchParams.get('parent_id'); // can be "null" string or number

  const supabase = await createClient();
  let query = supabase.from('folders').select('*').is('deleted_at', null).order('nama', { ascending: true });

  if (modul) query = query.eq('modul', modul);
  
  if (parentId === 'null' || !parentId) {
    query = query.is('parent_id', null);
  } else {
    query = query.eq('parent_id', Number(parentId));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  // Fetch attachments
  const attachableType = (parentId === 'null' || !parentId) ? modul : 'App\\Models\\Folder';
  const attachableId = (parentId === 'null' || !parentId) ? 0 : Number(parentId);

  let attachQuery = supabase
    .from('attachments')
    .select('*')
    .eq('attachable_type', attachableType)
    .eq('attachable_id', attachableId)
    .order('original_name', { ascending: true });

  const { data: filesData, error: attachError } = await attachQuery;

  return NextResponse.json({ 
    data, // folders
    files: attachError ? [] : filesData 
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const errors: Record<string, string> = {};

  if (!body['nama']) errors['nama'] = 'Nama folder wajib diisi.';
  if (!body['modul']) errors['modul'] = 'Modul folder wajib diisi.';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: 'Validasi gagal.', errors }, { status: 422 });
  }

  const { createServiceClient } = await import('@/lib/supabase/server');
  const supabase = await createServiceClient();

  const { data, error } = await supabase.from('folders').insert({
    nama: body['nama'],
    modul: body['modul'],
    parent_id: body['parent_id'] ? Number(body['parent_id']) : null,
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  await logActivity({ logName: 'folder', description: `Membuat folder ${data.nama}`, causerId: user.id, subjectType: 'folder', subjectId: data.id });
  return NextResponse.json({ data, message: 'Folder berhasil dibuat.' }, { status: 201 });
}
