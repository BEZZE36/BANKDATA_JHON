import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import Header from '@/components/layout/Header';
import SearchBox from '@/components/ui/SearchBox';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';
import { labelKondisiAset, warnaBadgeAset, formatRupiah, storageUrl } from '@/lib/utils';
import type { Metadata } from 'next';
import type { Aset } from '@/lib/types';
import FolderExplorer from '@/components/ui/FolderExplorer';
import FilterDropdown from '@/components/ui/FilterDropdown';

export const metadata: Metadata = { title: 'Data Aset' };
const PER_PAGE = 15;

interface PageProps { searchParams: Promise<Record<string, string>> }

export default async function AsetPage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([requireAuth(), searchParams]);
  const supabase = await createClient();

  const q = params['q'] ?? '';
  const kondisi = params['kondisi'] ?? '';
  const page = Math.max(1, Number(params['page'] ?? 1));

  let query = supabase.from('aset').select('*', { count: 'exact' }).is('deleted_at', null)
    .order('created_at', { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  if (q) query = query.or(`nama_aset.ilike.%${q}%,kode_aset.ilike.%${q}%,lokasi.ilike.%${q}%`);
  if (kondisi) query = query.eq('kondisi', kondisi);

  const { data: aset, count } = await query;
  const total = count ?? 0;
  const bisaKelola = ['admin', 'operator-aset'].includes(user.role);

  return (
    <div>
      <Header title="Data Aset" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Data Aset' }]}
        actions={bisaKelola ? <Button href="/aset/tambah">Tambah Aset</Button> : undefined}
      />
      <div className="p-6 space-y-5">
        <FolderExplorer modul="aset" />

        <div className="card p-4 flex flex-wrap gap-3 items-center">
          <SearchBox placeholder="Cari nama, kode, atau lokasi aset..." className="flex-1 min-w-[200px]" />
          <FilterDropdown
            paramName="kondisi"
            defaultValue={kondisi}
            placeholder="Semua Kondisi"
            options={[
              { value: 'baik', label: 'Baik' },
              { value: 'rusak_ringan', label: 'Rusak Ringan' },
              { value: 'rusak_berat', label: 'Rusak Berat' },
            ]}
          />
        </div>
        <div className="flex justify-end gap-2">
          <a href="/api/export/aset" className="btn-secondary btn text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            Export Excel
          </a>
        </div>

        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr>
                <th>Foto</th><th>Kode</th><th>Nama Aset</th><th>Kategori</th>
                <th>Lokasi</th><th>Tahun</th><th>Nilai Perolehan</th><th>Kondisi</th><th className="text-right">Aksi</th>
              </tr></thead>
              <tbody>
                {aset && aset.length > 0 ? (aset as Aset[]).map((a) => {
                  const imgUrl = storageUrl(a.foto_path);
                  return (
                    <tr key={a.id}>
                      <td>
                        {imgUrl ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            <Image src={imgUrl} alt={a.nama_aset} width={48} height={48} className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                          </div>
                        )}
                      </td>
                      <td className="font-mono text-xs">{a.kode_aset}</td>
                      <td className="font-medium text-slate-800">{a.nama_aset}</td>
                      <td>{a.kategori}</td>
                      <td className="text-slate-500">{a.lokasi}</td>
                      <td>{a.tahun_perolehan ?? '-'}</td>
                      <td className="text-right font-mono text-xs">{formatRupiah(Number(a.nilai_perolehan))}</td>
                      <td><Badge className={warnaBadgeAset(a.kondisi)}>{labelKondisiAset(a.kondisi)}</Badge></td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/aset/${a.id}`} className="btn-ghost px-2 py-1 text-xs rounded-lg" aria-label="Detail">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </Link>
                          {bisaKelola && <Link href={`/aset/${a.id}/edit`} className="btn-ghost px-2 py-1 text-xs rounded-lg" aria-label="Edit"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg></Link>}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={9} className="text-center py-12 text-slate-400">Belum ada data aset</td></tr>
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
