import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity, bisaKelola } from '@/lib/auth';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

const MAX_SIZE = 69 * 1024 * 1024; // 69 MB

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const modul = formData.get('modul') as string;
    const folderId = formData.get('folder_id') as string | null;

    if (!file || !modul) {
      return NextResponse.json({ message: 'File dan modul wajib diisi' }, { status: 400 });
    }

    if (!bisaKelola(user, modul)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ message: 'Format file tidak diizinkan. Hanya PDF, Word, Excel, PPT, dan Gambar (JPG/PNG).' }, { status: 422 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'Ukuran file melebihi batas 69MB.' }, { status: 413 });
    }

    // Use service client to bypass RLS for storage and db insert
    const { createServiceClient, createClient } = await import('@/lib/supabase/server');
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di env, fallback ke client biasa (mungkin akan gagal karena RLS).');
    }
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? await createServiceClient() : await createClient();

    const attachableType = folderId ? 'App\\Models\\Folder' : modul;
    const attachableId = folderId ? Number(folderId) : 0;

    // Upload to Supabase Storage
    const ext = file.name.split('.').pop() || 'tmp';
    const uniqueName = `${randomUUID()}.${ext}`;
    const filePath = `${modul}/${uniqueName}`;

    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
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
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: buffer,
        ContentType: file.type,
      }));
    } catch (s3Error: any) {
      console.error('S3 Upload Error:', s3Error);
      return NextResponse.json({ message: `Gagal mengupload file ke storage: ${s3Error.message}` }, { status: 500 });
    }

    // Insert to attachments table
    const { data: attachment, error: dbError } = await supabase.from('attachments').insert({
      attachable_type: attachableType,
      attachable_id: attachableId,
      original_name: file.name,
      path: filePath,
      mime_type: file.type,
      size_kb: Math.round(file.size / 1024),
      uploaded_by: user.id
    }).select().single();

    if (dbError) {
      console.error('DB Insert Error:', dbError);
      // rollback storage
      await supabase.storage.from(process.env['NEXT_PUBLIC_STORAGE_BUCKET'] ?? 'bankdata-storage').remove([filePath]);
      return NextResponse.json({ message: 'Gagal menyimpan data file ke database.' }, { status: 500 });
    }

    await logActivity({
      logName: 'file',
      description: `Mengupload file ${file.name}`,
      causerId: user.id,
      subjectType: 'attachment',
      subjectId: attachment.id
    });

    return NextResponse.json({ message: 'File berhasil diupload', data: attachment }, { status: 201 });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
