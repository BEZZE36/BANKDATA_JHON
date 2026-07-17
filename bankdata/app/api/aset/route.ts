import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const kondisi = searchParams.get('kondisi') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const perPage = 15;
  const supabase = await createClient();
  let query = supabase.from('aset').select('*', { count: 'exact' }).is('deleted_at', null)
    .order('created_at', { ascending: false }).range((page - 1) * perPage, page * perPage - 1);
  if (q) query = query.or(`nama_aset.ilike.%${q}%,kode_aset.ilike.%${q}%,lokasi.ilike.%${q}%`);
  if (kondisi) query = query.eq('kondisi', kondisi);
  const { data, count, error } = await query;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count ?? 0, page, perPage });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'operator-aset'].includes(user.role)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const formData = await request.formData();
  const supabase = await createClient();

  // Validasi
  const errors: Record<string, string> = {};
  if (!formData.get('kode_aset')) errors['kode_aset'] = 'Kode aset wajib diisi.';
  if (!formData.get('nama_aset')) errors['nama_aset'] = 'Nama aset wajib diisi.';
  if (!formData.get('kategori')) errors['kategori'] = 'Kategori wajib diisi.';
  if (!formData.get('lokasi')) errors['lokasi'] = 'Lokasi wajib diisi.';
  if (!formData.get('kondisi')) errors['kondisi'] = 'Kondisi wajib dipilih.';
  if (!formData.get('nilai_perolehan')) errors['nilai_perolehan'] = 'Nilai perolehan wajib diisi.';
  if (Object.keys(errors).length > 0) return NextResponse.json({ message: 'Validasi gagal.', errors }, { status: 422 });

  // Upload foto jika ada
  let fotoPath: string | null = null;
  const foto = formData.get('foto') as File | null;
  if (foto && foto.size > 0) {
    if (!foto.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Validasi gagal.', errors: { foto: 'File harus berupa gambar.' } }, { status: 422 });
    }
    if (foto.size > 3 * 1024 * 1024) {
      return NextResponse.json({ message: 'Validasi gagal.', errors: { foto: 'Ukuran foto maksimal 3 MB.' } }, { status: 422 });
    }
    const ext = foto.name.split('.').pop();
    const fileName = `foto-aset/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(process.env['NEXT_PUBLIC_STORAGE_BUCKET'] ?? 'bankdata-storage')
      .upload(fileName, foto, { contentType: foto.type });
    if (uploadError) return NextResponse.json({ message: 'Gagal upload foto: ' + uploadError.message }, { status: 500 });
    fotoPath = uploadData.path;
  }

  const { data, error } = await supabase.from('aset').insert({
    kode_aset: formData.get('kode_aset') as string,
    nama_aset: formData.get('nama_aset') as string,
    kategori: formData.get('kategori') as string,
    lokasi: formData.get('lokasi') as string,
    kondisi: formData.get('kondisi') as string,
    tahun_perolehan: formData.get('tahun_perolehan') ? Number(formData.get('tahun_perolehan')) : null,
    nilai_perolehan: Number(formData.get('nilai_perolehan')),
    foto_path: fotoPath,
    folder_id: formData.get('folder_id') ? Number(formData.get('folder_id')) : null,
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  await logActivity({ logName: 'aset', description: `Menambah aset ${data.nama_aset}`, causerId: user.id, subjectType: 'aset', subjectId: data.id });
  return NextResponse.json({ data, message: 'Data aset berhasil ditambahkan.' }, { status: 201 });
}
