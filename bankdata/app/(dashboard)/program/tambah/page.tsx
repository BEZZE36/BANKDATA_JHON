'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const statusOptions = [
  { value: 'perencanaan', label: 'Perencanaan' },
  { value: 'berjalan', label: 'Berjalan' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditunda', label: 'Ditunda' },
];

export default function TambahProgramPage() {
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
      kode_program: form.get('kode_program'),
      nama_program: form.get('nama_program'),
      tahun_anggaran: form.get('tahun_anggaran'),
      unit_pelaksana: form.get('unit_pelaksana'),
      target: form.get('target') ? Number(form.get('target')) : 0,
      realisasi: form.get('realisasi') ? Number(form.get('realisasi')) : 0,
      status: form.get('status'),
      keterangan: form.get('keterangan') || null,
    };

    const res = await fetch('/api/program', {
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

    setSukses('Data program berhasil ditambahkan.');
    setTimeout(() => router.push('/program'), 1200);
  }

  return (
    <div>
      <Header
        title="Tambah Program"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Data Program', href: '/program' },
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
                label="Kode Program"
                name="kode_program"
                required
                placeholder="Contoh: PRG-2026-001"
                error={errors['kode_program']}
              />
              <Input
                label="Nama Program"
                name="nama_program"
                required
                placeholder="Nama program kerja"
                error={errors['nama_program']}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Tahun Anggaran"
                name="tahun_anggaran"
                type="number"
                required
                defaultValue={new Date().getFullYear()}
                placeholder="Contoh: 2026"
                error={errors['tahun_anggaran']}
              />
              <Input
                label="Unit Pelaksana"
                name="unit_pelaksana"
                required
                placeholder="Nama instansi/bidang"
                error={errors['unit_pelaksana']}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Target (Rp)"
                name="target"
                type="number"
                required
                defaultValue={0}
                placeholder="Nominal target"
                error={errors['target']}
              />
              <Input
                label="Realisasi (Rp)"
                name="realisasi"
                type="number"
                required
                defaultValue={0}
                placeholder="Nominal realisasi"
                error={errors['realisasi']}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Select
                label="Status"
                name="status"
                required
                options={statusOptions}
                error={errors['status']}
                defaultValue="perencanaan"
              />
              <Input
                label="Keterangan"
                name="keterangan"
                placeholder="Catatan tambahan (opsional)"
                error={errors['keterangan']}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button href="/program" variant="secondary">Batal</Button>
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
