import { NextRequest, NextResponse } from 'next/server';
import { requireRole, logActivity } from '@/lib/auth';

const SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '';
const SERVICE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

const adminHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

// GET /api/pengguna/[id] — Detail satu pengguna
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole('admin');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    headers: adminHeaders,
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
  }

  const user = await res.json();
  return NextResponse.json({ user });
}

// PATCH /api/pengguna/[id] — Update pengguna
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let currentUser;
  try {
    currentUser = await requireRole('admin');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json() as {
    name?: string;
    role?: string;
    unit_kerja?: string;
    is_active?: boolean;
    password?: string;
  };

  const updatePayload: Record<string, unknown> = {
    user_metadata: {
      name: body.name,
      role: body.role,
      unit_kerja: body.unit_kerja ?? null,
      is_active: body.is_active !== false,
    },
  };

  if (body.password) {
    updatePayload['password'] = body.password;
  }

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify(updatePayload),
  });

  if (!res.ok) {
    const err = await res.json() as { message?: string };
    return NextResponse.json({ error: err.message ?? 'Gagal memperbarui pengguna.' }, { status: res.status });
  }

  await logActivity({
    logName: 'pengguna',
    description: `Update pengguna ID: ${id}`,
    causerId: currentUser.id,
  });

  return NextResponse.json({ message: 'Pengguna berhasil diperbarui.' });
}

// DELETE /api/pengguna/[id] — Hapus pengguna
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let currentUser;
  try {
    currentUser = await requireRole('admin');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });

  if (!res.ok && res.status !== 404) {
    return NextResponse.json({ error: 'Gagal menghapus pengguna.' }, { status: res.status });
  }

  await logActivity({
    logName: 'pengguna',
    description: `Hapus pengguna ID: ${id}`,
    causerId: currentUser.id,
  });

  return NextResponse.json({ message: 'Pengguna berhasil dihapus.' });
}
