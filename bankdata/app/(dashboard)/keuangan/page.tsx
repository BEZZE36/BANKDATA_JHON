import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import Header from '@/components/layout/Header';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { labelJenisKeuangan, warnaBadgeKeuangan, formatRupiah, formatTanggal } from '@/lib/utils';
import type { Metadata } from 'next';
import type { KeuanganWithProgram } from '@/lib/types';
import FolderExplorer from '@/components/ui/FolderExplorer';
import FilterDropdown from '@/components/ui/FilterDropdown';

export const metadata: Metadata = { title: 'Data Keuangan' };
const PER_PAGE = 15;

interface PageProps { searchParams: Promise<Record<string, string>> }

export default async function KeuanganPage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([requireAuth(), searchParams]);
  const supabase = await createClient();

  const jenis = params['jenis'] ?? '';
  const dari = params['dari'] ?? '';
  const sampai = params['sampai'] ?? '';
  const page = Math.max(1, Number(params['page'] ?? 1));

  let query = supabase.from('keuangan').select('*, program(id, nama_program)', { count: 'exact' })
    .is('deleted_at', null).order('tanggal', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  if (jenis) query = query.eq('jenis', jenis);
  if (dari) query = query.gte('tanggal', dari);
  if (sampai) query = query.lte('tanggal', sampai);

  const { data: keuangan, count } = await query;
  const total = count ?? 0;

  // Ringkasan total
  const { data: summary } = await supabase.from('keuangan').select('jenis, nominal').is('deleted_at', null);
  const safeSummary = summary ?? [];
  const totalAnggaran = safeSummary.filter(k => k.jenis === 'anggaran').reduce((s, k) => s + Number(k.nominal), 0);
  const totalRealisasi = safeSummary.filter(k => k.jenis === 'realisasi').reduce((s, k) => s + Number(k.nominal), 0);

  const bisaKelola = ['admin', 'operator-keuangan'].includes(user.role);

  return (
    <div>
      <Header title="Data Keuangan" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Data Keuangan' }]}
        actions={bisaKelola ? <Button href="/keuangan/tambah">Tambah Transaksi</Button> : undefined}
      />
      <div className="p-6 space-y-5">
        <FolderExplorer modul="keuangan" canManage={bisaKelola} />

        {/* Ringkasan total */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Anggaran', value: totalAnggaran, color: 'text-blue-600' },
            { label: 'Total Realisasi', value: totalRealisasi, color: 'text-emerald-600' },
            { label: 'Persentase Capaian', value: totalAnggaran > 0 ? `${Math.round(totalRealisasi / totalAnggaran * 100)}%` : '0%', color: 'text-slate-800', isText: true },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.isText ? s.value : formatRupiah(s.value as number)}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="card p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="form-label text-xs">Jenis</label>
            <FilterDropdown
              paramName="jenis"
              defaultValue={jenis}
              placeholder="Semua Jenis"
              options={[
                { value: 'anggaran', label: 'Anggaran' },
                { value: 'realisasi', label: 'Realisasi' },
              ]}
            />
          </div>
          <div>
            <label className="form-label text-xs">Dari Tanggal</label>
            <FilterDropdown
              paramName="dari"
              defaultValue={dari}
              type="date"
            />
          </div>
          <div>
            <label className="form-label text-xs">Sampai Tanggal</label>
            <FilterDropdown
              paramName="sampai"
              defaultValue={sampai}
              type="date"
            />
          </div>
          <a href="/api/export/keuangan" className="btn-secondary btn text-xs h-fit">Export Excel</a>
        </div>

        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr>
                <th>No. Transaksi</th><th>Tanggal</th><th>Jenis</th><th>Program</th>
                <th className="text-right">Nominal</th><th>Keterangan</th><th className="text-right">Aksi</th>
              </tr></thead>
              <tbody>
                {keuangan && keuangan.length > 0 ? (keuangan as KeuanganWithProgram[]).map((k) => (
                  <tr key={k.id}>
                    <td className="font-mono text-xs">{k.no_transaksi}</td>
                    <td>{formatTanggal(k.tanggal)}</td>
                    <td><Badge className={warnaBadgeKeuangan(k.jenis)}>{labelJenisKeuangan(k.jenis)}</Badge></td>
                    <td className="text-slate-500 text-xs">{k.program?.nama_program ?? '-'}</td>
                    <td className="text-right font-mono font-semibold">{formatRupiah(Number(k.nominal))}</td>
                    <td className="text-slate-500 max-w-xs truncate text-xs">{k.keterangan ?? '-'}</td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/keuangan/${k.id}`} className="btn-ghost px-2 py-1 text-xs rounded-lg" aria-label="Detail">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </Link>
                        {bisaKelola && <Link href={`/keuangan/${k.id}/edit`} className="btn-ghost px-2 py-1 text-xs rounded-lg" aria-label="Edit"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg></Link>}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">Belum ada data keuangan</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {total > PER_PAGE && <div className="border-t border-slate-100 p-4"><Pagination total={total} page={page} perPage={PER_PAGE} /></div>}
        </div>
      </div>
    </div>
  );
}
