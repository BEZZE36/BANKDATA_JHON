import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import Header from '@/components/layout/Header';
import SearchBox from '@/components/ui/SearchBox';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import Link from 'next/link';
import { labelStatusProgram, warnaBadgeProgram, persenCapaian, formatRupiah } from '@/lib/utils';
import type { Metadata } from 'next';
import type { Program } from '@/lib/types';
import FolderExplorer from '@/components/ui/FolderExplorer';
import FilterDropdown from '@/components/ui/FilterDropdown';

export const metadata: Metadata = { title: 'Data Program' };
const PER_PAGE = 15;

interface PageProps { searchParams: Promise<Record<string, string>> }

export default async function ProgramPage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([requireAuth(), searchParams]);
  const supabase = await createClient();

  const q = params['q'] ?? '';
  const tahun = params['tahun_anggaran'] ?? '';
  const status = params['status'] ?? '';
  const page = Math.max(1, Number(params['page'] ?? 1));

  let query = supabase.from('program').select('*', { count: 'exact' }).is('deleted_at', null)
    .order('created_at', { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  if (q) query = query.or(`nama_program.ilike.%${q}%,kode_program.ilike.%${q}%`);
  if (tahun) query = query.eq('tahun_anggaran', Number(tahun));
  if (status) query = query.eq('status', status);

  const { data: program, count } = await query;
  const total = count ?? 0;
  const bisaKelola = ['admin', 'operator-program'].includes(user.role);

  return (
    <div>
      <Header title="Data Program" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Data Program' }]}
        actions={bisaKelola ? <Button href="/program/tambah">Tambah Program</Button> : undefined}
      />
      <div className="p-6 space-y-5">
        <FolderExplorer modul="program" />

        <div className="card p-4 flex flex-wrap gap-3 items-center">
          <SearchBox placeholder="Cari nama atau kode program..." className="flex-1 min-w-[200px]" />
          <FilterDropdown
            paramName="tahun_anggaran"
            defaultValue={tahun}
            type="number"
            placeholder="Tahun Anggaran"
            className="form-input w-36"
          />
        </div>

        {/* Export buttons */}
        <div className="flex justify-end gap-2">
          <a href="/api/export/program" className="btn-secondary btn text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            Export Excel
          </a>
        </div>

        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr>
                <th>Kode</th><th>Nama Program</th><th>Tahun</th><th>Unit Pelaksana</th>
                <th>Target</th><th>Realisasi</th><th>Capaian</th><th>Status</th><th className="text-right">Aksi</th>
              </tr></thead>
              <tbody>
                {program && program.length > 0 ? (program as Program[]).map((p) => {
                  const persen = persenCapaian(Number(p.target), Number(p.realisasi));
                  return (
                    <tr key={p.id}>
                      <td className="font-mono text-xs">{p.kode_program}</td>
                      <td className="font-medium text-slate-800 max-w-xs truncate">{p.nama_program}</td>
                      <td>{p.tahun_anggaran}</td>
                      <td className="text-slate-500 max-w-xs truncate">{p.unit_pelaksana}</td>
                      <td className="text-right font-mono text-xs">{formatRupiah(Number(p.target))}</td>
                      <td className="text-right font-mono text-xs">{formatRupiah(Number(p.realisasi))}</td>
                      <td className="w-32"><ProgressBar persen={persen} size="sm" /></td>
                      <td><Badge className={warnaBadgeProgram(p.status)}>{labelStatusProgram(p.status)}</Badge></td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/program/${p.id}`} className="btn-ghost px-2 py-1 text-xs rounded-lg" aria-label="Detail">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </Link>
                          {bisaKelola && <Link href={`/program/${p.id}/edit`} className="btn-ghost px-2 py-1 text-xs rounded-lg" aria-label="Edit"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg></Link>}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={9} className="text-center py-12 text-slate-400">Belum ada data program</td></tr>
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
