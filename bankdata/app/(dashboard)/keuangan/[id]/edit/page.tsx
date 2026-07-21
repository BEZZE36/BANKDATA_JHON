'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const jenisOptions = [
  { value: 'anggaran', label: 'Anggaran' },
  { value: 'realisasi', label: 'Realisasi' },
];

export default function EditKeuanganPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sukses, setSukses] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData, setInitialData] = useState<any>(null);
  
  const [programs, setPrograms] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // Fetch Data
    fetch(`/api/keuangan/${id}`)
      .then(res => res.json())
      .then(result => {
        if (result.data) setInitialData(result.data);
        else setErrors({ _global: result.message || 'Gagal memuat data keuangan.' });
      })
      .catch(() => setErrors({ _global: 'Terjadi kesalahan jaringan.' }))
      .finally(() => setFetching(false));

    // Fetch Programs for Dropdown
    fetch('/api/program?perPage=1000')
      .then(res => res.json())
      .then(result => {
        if (result.data) {
          setPrograms(
            result.data.map((p: any) => ({
              value: String(p.id),
              label: `${p.kode_program} - ${p.nama_program}`,
            }))
          );
        }
      })
      .catch(console.error);
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSukses(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      no_transaksi: form.get('no_transaksi'),
      jenis: form.get('jenis'),
      nominal: form.get('nominal') ? Number(form.get('nominal')) : 0,
      tanggal: form.get('tanggal'),
      keterangan: form.get('keterangan') || null,
      program_id: form.get('program_id') || null,
    };

    const res = await fetch(`/api/keuangan/${id}`, {
      method: 'PUT',
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

    setSukses('Data transaksi berhasil diperbarui.');
    setTimeout(() => router.push('/keuangan'), 1200);
  }

  if (fetching) {
    return (
      <div>
        <Header title="Edit Transaksi Keuangan" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Data Keuangan', href: '/keuangan' }, { label: 'Edit' }]} />
        <div className="p-6">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Edit Transaksi Keuangan"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Data Keuangan', href: '/keuangan' },
          { label: 'Edit' },
        ]}
      />
      <div className="p-6 max-w-3xl">
        {sukses && <Alert type="success" className="mb-5">{sukses}</Alert>}
        {errors['_global'] && <Alert type="error" className="mb-5">{errors['_global']}</Alert>}

        {initialData && (
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="No. Transaksi"
                  name="no_transaksi"
                  required
                  defaultValue={initialData.no_transaksi}
                  error={errors['no_transaksi']}
                />
                <Select
                  label="Jenis"
                  name="jenis"
                  required
                  options={jenisOptions}
                  defaultValue={initialData.jenis}
                  error={errors['jenis']}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Nominal (Rp)"
                  name="nominal"
                  type="number"
                  required
                  defaultValue={initialData.nominal}
                  error={errors['nominal']}
                />
                <Input
                  label="Tanggal"
                  name="tanggal"
                  type="date"
                  required
                  defaultValue={initialData.tanggal?.split('T')[0]}
                  error={errors['tanggal']}
                />
              </div>

              <Select
                label="Terkait Program (Opsional)"
                name="program_id"
                options={[{ value: '', label: '-- Pilih Program --' }, ...programs]}
                error={errors['program_id']}
                defaultValue={initialData.program_id ? String(initialData.program_id) : ""}
                hint="Pilih program jika transaksi ini berkaitan dengan realisasi/anggaran program tertentu."
              />

              <Input
                label="Keterangan"
                name="keterangan"
                defaultValue={initialData.keterangan || ''}
                error={errors['keterangan']}
              />

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button href="/keuangan" variant="secondary">Batal</Button>
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
