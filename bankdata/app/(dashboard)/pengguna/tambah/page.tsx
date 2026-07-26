'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'operator-kepegawaian', label: 'Operator Kepegawaian' },
  { value: 'operator-program', label: 'Operator Program' },
  { value: 'operator-aset', label: 'Operator Aset' },
  { value: 'operator-keuangan', label: 'Operator Keuangan' },
  { value: 'admin', label: 'Administrator' },
];

export default function TambahPenggunaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      email: form.get('email') as string,
      password: form.get('password') as string,
      name: form.get('name') as string,
      role: form.get('role') as string,
      unit_kerja: form.get('unit_kerja') as string,
    };

    const res = await fetch('/api/pengguna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as { message?: string; error?: string };

    if (!res.ok) {
      setError(data.error ?? data.message ?? 'Gagal menambah pengguna.');
      setLoading(false);
      return;
    }

    setSuccess('Pengguna berhasil ditambahkan.');
    setLoading(false);
    setTimeout(() => router.push('/pengguna'), 1500);
  }

  return (
    <div>
      <Header
        title="Tambah Pengguna"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Manajemen Pengguna', href: '/pengguna' },
          { label: 'Tambah Pengguna' },
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              name="name"
              type="text"
              required
              placeholder="Nama pengguna"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              required
              placeholder="email@sulteng.go.id"
            />
            <Input
              label="Kata Sandi"
              name="password"
              type="password"
              required
              placeholder="Minimal 8 karakter"
              hint="Kata sandi akan langsung aktif saat pengguna pertama kali masuk."
            />
            <Input
              label="Unit Kerja"
              name="unit_kerja"
              type="text"
              placeholder="Nama unit kerja / bidang"
            />

            <div className="w-full">
              <label htmlFor="role" className="form-label">
                Role <span className="text-red-500 ml-0.5">*</span>
              </label>
              <select id="role" name="role" required className="form-input" defaultValue="viewer">
                {ROLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" loading={loading} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Tambah Pengguna'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.push('/pengguna')}>
                Batal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
