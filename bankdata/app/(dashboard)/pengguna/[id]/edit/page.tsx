'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'operator-kepegawaian', label: 'Operator Kepegawaian' },
  { value: 'operator-program', label: 'Operator Program' },
  { value: 'operator-aset', label: 'Operator Aset' },
  { value: 'operator-keuangan', label: 'Operator Keuangan' },
  { value: 'admin', label: 'Administrator' },
];

interface UserData {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    role?: string;
    unit_kerja?: string;
    is_active?: boolean;
  };
}

export default function EditPenggunaPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params['id'] as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/pengguna/${userId}`);
        if (!res.ok) {
          setError('Gagal memuat data pengguna.');
          setLoadingData(false);
          return;
        }
        const data = await res.json() as { user: UserData };
        setUserData(data.user);
      } catch {
        setError('Terjadi kesalahan saat memuat data.');
      } finally {
        setLoadingData(false);
      }
    }
    fetchUser();
  }, [userId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      name: form.get('name') as string,
      role: form.get('role') as string,
      unit_kerja: form.get('unit_kerja') as string,
      is_active: form.get('is_active') === 'true',
    };

    const newPassword = form.get('password') as string;
    if (newPassword) {
      payload['password'] = newPassword;
    }

    const res = await fetch(`/api/pengguna/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as { message?: string; error?: string };

    if (!res.ok) {
      setError(data.error ?? data.message ?? 'Gagal memperbarui pengguna.');
      setLoading(false);
      return;
    }

    setSuccess('Data pengguna berhasil diperbarui.');
    setLoading(false);
    setTimeout(() => router.push('/pengguna'), 1500);
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 animate-spin text-emerald-500 rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Edit Pengguna"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Manajemen Pengguna', href: '/pengguna' },
          { label: 'Edit Pengguna' },
        ]}
      />
      <div className="p-6">
        <div className="card max-w-xl p-6">
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          {userData ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="w-full">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="form-input opacity-60 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-500">Email tidak dapat diubah.</p>
              </div>

              <Input
                label="Nama Lengkap"
                name="name"
                type="text"
                required
                defaultValue={userData.user_metadata?.name ?? ''}
                placeholder="Nama pengguna"
              />

              <Input
                label="Kata Sandi Baru"
                name="password"
                type="password"
                placeholder="Kosongkan jika tidak ingin mengubah"
                hint="Isi hanya jika ingin mengganti kata sandi."
              />

              <Input
                label="Unit Kerja"
                name="unit_kerja"
                type="text"
                defaultValue={userData.user_metadata?.unit_kerja ?? ''}
                placeholder="Nama unit kerja / bidang"
              />

              <div className="w-full">
                <label htmlFor="role" className="form-label">
                  Role <span className="text-red-500 ml-0.5">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="form-input"
                  defaultValue={userData.user_metadata?.role ?? 'viewer'}
                >
                  {ROLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label htmlFor="is_active" className="form-label">Status Akun</label>
                <select
                  id="is_active"
                  name="is_active"
                  className="form-input"
                  defaultValue={userData.user_metadata?.is_active !== false ? 'true' : 'false'}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" loading={loading} disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => router.push('/pengguna')}>
                  Batal
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-slate-500 text-sm">Data pengguna tidak ditemukan.</p>
          )}
        </div>
      </div>
    </div>
  );
}
