'use client';

import { useState, useEffect } from 'react';
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

export default function TambahKeuanganPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [programs, setPrograms] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    fetch('/api/program?perPage=1000') // Fetch as many programs as possible for the dropdown
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
  }, []);

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

    const res = await fetch('/api/keuangan', {
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

    setSukses('Data transaksi berhasil ditambahkan.');
    setTimeout(() => router.push('/keuangan'), 1200);
  }

  return (
    <div>
      <Header
        title="Tambah Transaksi Keuangan"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Data Keuangan', href: '/keuangan' },
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
                label="No. Transaksi"
                name="no_transaksi"
                required
                placeholder="Contoh: TRX-2026-001"
                error={errors['no_transaksi']}
              />
              <Select
                label="Jenis"
                name="jenis"
                required
                options={jenisOptions}
                error={errors['jenis']}
                defaultValue="anggaran"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Nominal (Rp)"
                name="nominal"
                type="number"
                required
                defaultValue={0}
                placeholder="Nominal transaksi"
                error={errors['nominal']}
              />
              <Input
                label="Tanggal"
                name="tanggal"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                error={errors['tanggal']}
              />
            </div>

            <Select
              label="Terkait Program (Opsional)"
              name="program_id"
              options={[{ value: '', label: '-- Pilih Program --' }, ...programs]}
              error={errors['program_id']}
              defaultValue=""
              hint="Pilih program jika transaksi ini berkaitan dengan realisasi/anggaran program tertentu."
            />

            <Input
              label="Keterangan"
              name="keterangan"
              placeholder="Catatan tambahan (opsional)"
              error={errors['keterangan']}
            />

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button href="/keuangan" variant="secondary">Batal</Button>
              <Button type="submit" loading={loading} disabled={loading}>
                Simpan Transaksi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
