import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import Header from '@/components/layout/Header';
import SearchBox from '@/components/ui/SearchBox';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import {
  formatTanggal,
  labelStatusPegawai,
  warnaBadgePegawai,
} from '@/lib/utils';
import type { Metadata } from 'next';
import type { Pegawai } from '@/lib/types';
import { FilterStatus, DeleteButton } from '@/components/pegawai/ClientActions';

export const metadata: Metadata = { title: 'Data Kepegawaian' };

const PER_PAGE = 15;

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function PegawaiPage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([requireAuth(), searchParams]);
  const supabase = await createClient();

  const q = params['q'] ?? '';
  const status = params['status'] ?? '';
  const page = Math.max(1, Number(params['page'] ?? 1));

  let query = supabase
    .from('pegawai')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  if (q) {
    query = query.or(`nama.ilike.%${q}%,nip.ilike.%${q}%,unit_kerja.ilike.%${q}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data: pegawai, count } = await query;
  const total = count ?? 0;

  const bisaKelola = ['admin', 'operator-kepegawaian'].includes(user.role);

  return (
    <div>
      <Header
        title="Data Kepegawaian"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Data Kepegawaian' }]}
        actions={
          bisaKelola ? (
            <Button href="/pegawai/tambah" variant="primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Pegawai
            </Button>
          ) : undefined
        }
      />

      <div className="p-6 space-y-5">
        {/* Filter Bar */}
        <div className="card p-4 flex flex-wrap gap-3 items-center">
          <SearchBox placeholder="Cari nama, NIP, unit kerja..." className="flex-1 min-w-[200px]" />
          <FilterStatus currentStatus={status} />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>NIP</th>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>Unit Kerja</th>
                  <th>Golongan</th>
                  <th>TMT Jabatan</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pegawai && pegawai.length > 0 ? (
                  (pegawai as Pegawai[]).map((p) => (
                    <tr key={p.id}>
                      <td className="font-mono text-xs">{p.nip}</td>
                      <td className="font-medium text-slate-800">{p.nama}</td>
                      <td>{p.jabatan}</td>
                      <td className="text-slate-500">{p.unit_kerja}</td>
                      <td>{p.golongan ?? '-'}</td>
                      <td>{formatTanggal(p.tmt_jabatan)}</td>
                      <td>
                        <Badge className={warnaBadgePegawai(p.status)}>
                          {labelStatusPegawai(p.status)}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={`/pegawai/${p.id}`}
                            className="btn-ghost px-2 py-1 text-xs rounded-lg"
                            aria-label="Lihat detail"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </Link>
                          {bisaKelola && (
                            <>
                              <Link
                                href={`/pegawai/${p.id}/edit`}
                                className="btn-ghost px-2 py-1 text-xs rounded-lg"
                                aria-label="Edit"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                </svg>
                              </Link>
                              <DeleteButton id={p.id} nama={p.nama} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      Belum ada data pegawai
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {total > PER_PAGE && (
            <div className="border-t border-slate-100 p-4">
              <Pagination total={total} page={page} perPage={PER_PAGE} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

