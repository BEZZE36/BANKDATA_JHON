import { NextRequest, NextResponse } from 'next/server';
import { requireRole, logActivity } from '@/lib/auth';

// GET /api/pengguna — Daftar semua pengguna
export async function GET() {
  try {
    await requireRole('admin');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const res = await fetch(
    `${process.env['NEXT_PUBLIC_SUPABASE_URL']}/auth/v1/admin/users?per_page=1000`,
    {
      headers: {
        apikey: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
        Authorization: `Bearer ${process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? ''}`,
      },
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }

  const data = await res.json() as { users: unknown[] };
  return NextResponse.json({ users: data.users });
}

// POST /api/pengguna — Tambah pengguna baru
export async function POST(request: NextRequest) {
  let currentUser;
  try {
    currentUser = await requireRole('admin');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json() as {
    email: string;
    password: string;
    name: string;
    role: string;
    unit_kerja?: string;
  };

  if (!body.email || !body.password || !body.name) {
    return NextResponse.json({ error: 'Email, password, dan nama wajib diisi.' }, { status: 400 });
  }

  const res = await fetch(
    `${process.env['NEXT_PUBLIC_SUPABASE_URL']}/auth/v1/admin/users`,
    {
      method: 'POST',
      headers: {
        apikey: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
        Authorization: `Bearer ${process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: {
          name: body.name,
          role: body.role ?? 'viewer',
          unit_kerja: body.unit_kerja ?? null,
          is_active: true,
        },
      }),
    },
  );

  const data = await res.json() as { id?: string; message?: string };

  if (!res.ok) {
    return NextResponse.json({ error: data.message ?? 'Gagal membuat pengguna.' }, { status: res.status });
  }

  await logActivity({
    logName: 'pengguna',
    description: `Tambah pengguna: ${body.email}`,
    causerId: currentUser.id,
  });

  return NextResponse.json({ message: 'Pengguna berhasil dibuat.', id: data.id }, { status: 201 });
}
