import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Use service client to bypass RLS for storage and db operations
  const { createServiceClient } = await import('@/lib/supabase/server');
  const supabase = await createServiceClient();

  // Ambil data file
  const { data: file, error: fetchError } = await supabase
    .from('attachments')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !file) {
    return NextResponse.json({ message: 'File tidak ditemukan' }, { status: 404 });
  }

  // Hapus dari Supabase Storage
  if (file.path) {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const s3Client = new S3Client({
      region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-1',
      endpoint: process.env.AWS_ENDPOINT || 'https://mgmfcxpjweljmyfvjupg.supabase.co/storage/v1/s3',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    });
    const bucketName = (process.env.AWS_BUCKET || process.env['NEXT_PUBLIC_STORAGE_BUCKET']) ?? 'bankdata-storage';

    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: file.path,
      }));
    } catch (storageError) {
      console.error('Storage Delete Error:', storageError);
      // Tetap lanjutkan hapus dari database meskipun gagal di storage,
      // agar tidak ada data yatim di tabel attachments.
    }
  }

  // Hapus dari database
  const { error: dbError } = await supabase
    .from('attachments')
    .delete()
    .eq('id', id);

  if (dbError) {
    return NextResponse.json({ message: 'Gagal menghapus data file' }, { status: 500 });
  }

  await logActivity({
    logName: 'file',
    description: `Menghapus file ${file.original_name}`,
    causerId: user.id
  });

  return NextResponse.json({ message: 'File berhasil dihapus' });
}
