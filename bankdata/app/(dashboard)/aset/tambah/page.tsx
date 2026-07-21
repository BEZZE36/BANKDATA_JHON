'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const kondisiOptions = [
  { value: 'baik', label: 'Baik' },
  { value: 'rusak_ringan', label: 'Rusak Ringan' },
  { value: 'rusak_berat', label: 'Rusak Berat' },
];

export default function TambahAsetPage() {
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

    const res = await fetch('/api/aset', {
      method: 'POST',
      // DO NOT set Content-Type, fetch will set it automatically for FormData (including boundaries)
      body: form,
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

    setSukses('Data aset berhasil ditambahkan.');
    setTimeout(() => router.push('/aset'), 1200);
  }

  return (
    <div>
      <Header
        title="Tambah Aset"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Data Aset', href: '/aset' },
          { label: 'Tambah' },
        ]}
      />
      <div className="p-6 max-w-3xl">
        {sukses && <Alert type="success" className="mb-5">{sukses}</Alert>}
        {errors['_global'] && <Alert type="error" className="mb-5">{errors['_global']}</Alert>}

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Kode Aset"
                name="kode_aset"
                required
                placeholder="Contoh: INV-2026-001"
                error={errors['kode_aset']}
              />
              <Input
                label="Nama Aset"
                name="nama_aset"
                required
                placeholder="Nama inventaris/barang"
                error={errors['nama_aset']}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Kategori"
                name="kategori"
                required
                placeholder="Contoh: Elektronik, Kendaraan"
                error={errors['kategori']}
              />
              <Input
                label="Lokasi"
                name="lokasi"
                required
                placeholder="Contoh: Ruang Rapat Utama"
                error={errors['lokasi']}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Tahun Perolehan"
                name="tahun_perolehan"
                type="number"
                placeholder="Contoh: 2026"
                error={errors['tahun_perolehan']}
              />
              <Input
                label="Nilai Perolehan (Rp)"
                name="nilai_perolehan"
                type="number"
                required
                defaultValue={0}
                error={errors['nilai_perolehan']}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Select
                label="Kondisi"
                name="kondisi"
                required
                options={kondisiOptions}
                error={errors['kondisi']}
                defaultValue="baik"
              />
              <Input
                label="Foto Aset"
                name="foto"
                type="file"
                accept="image/*"
                error={errors['foto']}
                hint="Format gambar (JPG/PNG), maksimal 3 MB."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button href="/aset" variant="secondary">Batal</Button>
              <Button type="submit" loading={loading} disabled={loading}>
                Simpan Aset
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
