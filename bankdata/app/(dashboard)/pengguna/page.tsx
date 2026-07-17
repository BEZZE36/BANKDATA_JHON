import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import Header from '@/components/layout/Header';
import SearchBox from '@/components/ui/SearchBox';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manajemen Pengguna' };
const PER_PAGE = 15;

interface PageProps { searchParams: Promise<Record<string, string>> }

export default async function PenggunaPage({ searchParams }: PageProps) {
  // Hanya admin yang boleh akses
  await requireRole('admin');

  const params = await searchParams;
  const supabase = await createClient();

  const q = params['q'] ?? '';
  const page = Math.max(1, Number(params['page'] ?? 1));

  // Ambil user dari Supabase Auth via service role (melalui API)
  // Gunakan tabel user custom jika ada, atau Supabase admin API
  const res = await fetch(`${process.env['NEXT_PUBLIC_SUPABASE_URL']}/auth/v1/admin/users?page=${page}&per_page=${PER_PAGE}`, {
    headers: {
      'apikey': process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
      'Authorization': `Bearer ${process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? ''}`,
    },
  });

  const authData = res.ok ? await res.json() as { users: Array<{
    id: string; email: string; user_metadata: { name?: string; role?: string; unit_kerja?: string; is_active?: boolean };
    created_at: string;
  }> } : { users: [] };

  let users = authData.users ?? [];
  if (q) {
    users = users.filter(u =>
      u.email.toLowerCase().includes(q.toLowerCase()) ||
      (u.user_metadata?.name ?? '').toLowerCase().includes(q.toLowerCase()),
    );
  }

  const total = users.length;

  return (
    <div>
      <Header
        title="Manajemen Pengguna"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Manajemen Pengguna' }]}
        actions={<Button href="/pengguna/tambah">Tambah Pengguna</Button>}
      />
      <div className="p-6 space-y-5">
        <div className="card p-4">
          <SearchBox placeholder="Cari nama atau email..." className="max-w-sm" />
        </div>
        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr>
                <th>Nama</th><th>Email</th><th>Role</th><th>Unit Kerja</th><th>Status</th><th>Bergabung</th><th className="text-right">Aksi</th>
              </tr></thead>
              <tbody>
                {users.length > 0 ? users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium text-slate-800">{u.user_metadata?.name ?? '-'}</td>
                    <td className="text-slate-600">{u.email}</td>
                    <td><Badge className="bg-purple-100 text-purple-800">{u.user_metadata?.role ?? 'viewer'}</Badge></td>
                    <td className="text-slate-500">{u.user_metadata?.unit_kerja ?? '-'}</td>
                    <td>
                      <Badge className={u.user_metadata?.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                        {u.user_metadata?.is_active !== false ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td>{formatDateTime(u.created_at)}</td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/pengguna/${u.id}/edit`} className="btn-ghost px-2 py-1 text-xs rounded-lg" aria-label="Edit">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">Belum ada pengguna terdaftar</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
