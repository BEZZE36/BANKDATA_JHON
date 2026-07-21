import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { RoleType, SessionUser } from '@/lib/types';

// ─── Get Current User dari Supabase Auth ────────────────────────────────────

export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Ambil role dari user_metadata (diset saat assign role via service role key)
  const role = (user.user_metadata?.['role'] as RoleType) ?? 'viewer';
  const name = (user.user_metadata?.['name'] as string) ?? user.email ?? '';
  const unit_kerja =
    (user.user_metadata?.['unit_kerja'] as string) ?? null;
  const is_active =
    (user.user_metadata?.['is_active'] as boolean) ?? true;
  const email = user.email ?? '';

  // Sinkronisasi dengan tabel public.users untuk mendapatkan ID integer (karena DB Laravel lama pakai bigint)
  let db_id: number | null = null;
  if (email) {
    const { data: dbUser } = await supabase.from('users').select('id').eq('email', email).single();
    if (dbUser) {
      db_id = dbUser.id;
    } else {
      // Jika belum ada di public.users, buat baru (biasanya saat user baru di Supabase Auth)
      const { data: newUser } = await supabase.from('users').insert({
        name: name,
        email: email,
        password: 'sync-from-supabase',
        is_active: true
      }).select('id').single();
      if (newUser) db_id = newUser.id;
    }
  }

  return {
    id: db_id ? String(db_id) : user.id, // Gunakan integer ID sebagai string agar foreign key (bigint) tidak error
    email: user.email ?? '',
    name,
    role,
    unit_kerja,
    is_active,
  };
}

// ─── Require Auth — redirect ke /login jika tidak login ─────────────────────

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.is_active) {
    redirect('/login?error=inactive');
  }
  return user;
}

// ─── RBAC Helpers — cek role ─────────────────────────────────────────────────

export function hasRole(user: SessionUser, ...roles: RoleType[]): boolean {
  return roles.includes(user.role);
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === 'admin';
}

// Pemetaan modul → role operator (sama dengan PHP FolderController)
const MODUL_KE_ROLE: Record<string, RoleType> = {
  kepegawaian: 'operator-kepegawaian',
  program: 'operator-program',
  aset: 'operator-aset',
  keuangan: 'operator-keuangan',
};

export function bisaKelola(user: SessionUser, modul: string): boolean {
  const operatorRole = MODUL_KE_ROLE[modul];
  if (!operatorRole) return false;
  return hasRole(user, 'admin', operatorRole);
}

// ─── Require Role — abort 403 jika tidak punya akses ────────────────────────

export async function requireRole(
  ...roles: RoleType[]
): Promise<SessionUser> {
  const user = await requireAuth();
  if (!hasRole(user, ...roles)) {
    // Throw response 403
    throw new Response('Forbidden: Tidak memiliki izin mengakses halaman ini.', {
      status: 403,
    });
  }
  return user;
}

// ─── Log Aktivitas ──────────────────────────────────────────────────────────

export async function logActivity(params: {
  logName: string;
  description: string;
  causerId: string;
  subjectType?: string;
  subjectId?: number;
  properties?: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('activity_log').insert({
    log_name: params.logName,
    description: params.description,
    causer_type: 'App\\Models\\User',
    causer_id: params.causerId,
    subject_type: params.subjectType ?? null,
    subject_id: params.subjectId ?? null,
    properties: params.properties ?? {},
  });

  if (error) {
    console.error('Gagal mencatat aktivitas:', error.message);
  }
}
