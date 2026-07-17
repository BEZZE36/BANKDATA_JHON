'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const statusOptions = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'pensiun', label: 'Pensiun' },
  { value: 'mutasi', label: 'Mutasi' },
  { value: 'nonaktif', label: 'Nonaktif' },
];

const pendidikanOptions = [
  { value: 'SD', label: 'SD' },
  { value: 'SMP', label: 'SMP' },
  { value: 'SMA/SMK', label: 'SMA/SMK' },
  { value: 'D3', label: 'D3' },
  { value: 'S1', label: 'S1' },
  { value: 'S2', label: 'S2' },
  { value: 'S3', label: 'S3' },
];

export default function TambahPegawaiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSukses(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      nip: form.get('nip'),
      nama: form.get('nama'),
      jabatan: form.get('jabatan'),
      golongan: form.get('golongan') || null,
      unit_kerja: form.get('unit_kerja'),
      pendidikan_terakhir: form.get('pendidikan_terakhir') || null,
      tmt_jabatan: form.get('tmt_jabatan') || null,
      status: form.get('status'),
    };

    const res = await fetch('/api/pegawai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      setLoading(false);
      if (result.errors) {
        setErrors(result.errors);
      } else {
        setErrors({ _global: result.message ?? 'Terjadi kesalahan.' });
      }
      return;
    }

    setSukses('Data pegawai berhasil ditambahkan.');
    setTimeout(() => router.push('/pegawai'), 1200);
  }

  return (
    <div>
      <Header
        title="Tambah Pegawai"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Data Kepegawaian', href: '/pegawai' },
          { label: 'Tambah' },
        ]}
      />
      <div className="p-6 max-w-3xl">
        {sukses && <Alert type="success" className="mb-5">{sukses}</Alert>}
        {errors['_global'] && <Alert type="error" className="mb-5">{errors['_global']}</Alert>}

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="NIP"
                name="nip"
                required
                maxLength={18}
                placeholder="18 digit NIP"
                error={errors['nip']}
                hint="Nomor Induk Pegawai (18 digit)"
              />
              <Input
                label="Nama Lengkap"
                name="nama"
                required
                placeholder="Nama sesuai SK"
                error={errors['nama']}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Jabatan"
                name="jabatan"
                required
                placeholder="Jabatan saat ini"
                error={errors['jabatan']}
              />
              <Input
                label="Golongan"
                name="golongan"
                placeholder="Contoh: III/a"
                error={errors['golongan']}
              />
            </div>
            <Input
              label="Unit Kerja"
              name="unit_kerja"
              required
              placeholder="Nama unit kerja / OPD"
              error={errors['unit_kerja']}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Select
                label="Pendidikan Terakhir"
                name="pendidikan_terakhir"
                options={pendidikanOptions}
                placeholder="Pilih pendidikan"
                error={errors['pendidikan_terakhir']}
              />
              <Input
                label="TMT Jabatan"
                name="tmt_jabatan"
                type="date"
                error={errors['tmt_jabatan']}
              />
              <Select
                label="Status"
                name="status"
                required
                options={statusOptions}
                error={errors['status']}
                defaultValue="aktif"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button href="/pegawai" variant="secondary">Batal</Button>
              <Button type="submit" loading={loading} disabled={loading}>
                Simpan Data
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
