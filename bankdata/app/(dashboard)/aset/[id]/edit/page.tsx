'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Image from 'next/image';
import { storageUrl } from '@/lib/utils';

const kondisiOptions = [
  { value: 'baik', label: 'Baik' },
  { value: 'rusak_ringan', label: 'Rusak Ringan' },
  { value: 'rusak_berat', label: 'Rusak Berat' },
];

export default function EditAsetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sukses, setSukses] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/aset/${id}`)
      .then(res => res.json())
      .then(result => {
        if (result.data) setInitialData(result.data);
        else setErrors({ _global: result.message || 'Gagal memuat data aset.' });
      })
      .catch(() => setErrors({ _global: 'Terjadi kesalahan jaringan.' }))
      .finally(() => setFetching(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSukses(null);

    const form = new FormData(e.currentTarget);

    const res = await fetch(`/api/aset/${id}`, {
      method: 'PUT',
      // DO NOT set Content-Type, fetch sets it automatically for FormData
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

    setSukses('Data aset berhasil diperbarui.');
    setTimeout(() => router.push('/aset'), 1200);
  }

  if (fetching) {
    return (
      <div>
        <Header title="Edit Aset" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Data Aset', href: '/aset' }, { label: 'Edit' }]} />
        <div className="p-6">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Edit Aset"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Data Aset', href: '/aset' },
          { label: 'Edit' },
        ]}
      />
      <div className="p-6 max-w-3xl">
        {sukses && <Alert type="success" className="mb-5">{sukses}</Alert>}
        {errors['_global'] && <Alert type="error" className="mb-5">{errors['_global']}</Alert>}

        {initialData && (
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Kode Aset"
                  name="kode_aset"
                  required
                  defaultValue={initialData.kode_aset}
                  error={errors['kode_aset']}
                />
                <Input
                  label="Nama Aset"
                  name="nama_aset"
                  required
                  defaultValue={initialData.nama_aset}
                  error={errors['nama_aset']}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Kategori"
                  name="kategori"
                  required
                  defaultValue={initialData.kategori}
                  error={errors['kategori']}
                />
                <Input
                  label="Lokasi"
                  name="lokasi"
                  required
                  defaultValue={initialData.lokasi}
                  error={errors['lokasi']}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Tahun Perolehan"
                  name="tahun_perolehan"
                  type="number"
                  defaultValue={initialData.tahun_perolehan || ''}
                  error={errors['tahun_perolehan']}
                />
                <Input
                  label="Nilai Perolehan (Rp)"
                  name="nilai_perolehan"
                  type="number"
                  required
                  defaultValue={initialData.nilai_perolehan}
                  error={errors['nilai_perolehan']}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select
                  label="Kondisi"
                  name="kondisi"
                  required
                  options={kondisiOptions}
                  defaultValue={initialData.kondisi}
                  error={errors['kondisi']}
                />
                <div>
                  <Input
                    label="Ganti Foto Aset (Opsional)"
                    name="foto"
                    type="file"
                    accept="image/*"
                    error={errors['foto']}
                    hint="Biarkan kosong jika tidak ingin mengubah foto."
                  />
                  {initialData.foto_path && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 mb-1">Foto Saat Ini:</p>
                      <Image
                        src={storageUrl(initialData.foto_path) || ''}
                        alt="Foto Aset"
                        width={100}
                        height={100}
                        className="rounded-lg object-cover border border-slate-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button href="/aset" variant="secondary">Batal</Button>
                <Button type="submit" loading={loading} disabled={loading}>
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
