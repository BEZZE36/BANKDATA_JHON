import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import Header from '@/components/layout/Header';
import SearchBox from '@/components/ui/SearchBox';
import Pagination from '@/components/ui/Pagination';
import { formatDateTime } from '@/lib/utils';
import type { Metadata } from 'next';
import type { ActivityLog } from '@/lib/types';

export const metadata: Metadata = { title: 'Log Aktivitas' };
const PER_PAGE = 20;

interface PageProps { searchParams: Promise<Record<string, string>> }

export default async function LogAktivitasPage({ searchParams }: PageProps) {
  await requireRole('admin');
  const params = await searchParams;
  const supabase = await createClient();

  const q = params['q'] ?? '';
  const logName = params['log_name'] ?? '';
  const page = Math.max(1, Number(params['page'] ?? 1));

  let query = supabase.from('activity_log').select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  if (q) query = query.ilike('description', `%${q}%`);
  if (logName) query = query.eq('log_name', logName);

  const { data: logs, count } = await query;
  const total = count ?? 0;

  const modulList = ['login', 'kepegawaian', 'program', 'aset', 'keuangan', 'folder', 'lampiran', 'pengguna', 'import'];

  return (
    <div>
      <Header
        title="Log Aktivitas"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Log Aktivitas' }]}
      />
      <div className="p-6 space-y-5">
        <div className="card p-4 flex flex-wrap gap-3">
          <SearchBox placeholder="Cari deskripsi aktivitas..." className="flex-1 min-w-[200px]" />
          <select defaultValue={logName} className="form-input w-auto"
            onChange={e => { const url = new URL(window.location.href); e.target.value ? url.searchParams.set('log_name', e.target.value) : url.searchParams.delete('log_name'); window.location.href = url.toString(); }}>
            <option value="">Semua Modul</option>
            {modulList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr>
                <th>Waktu</th><th>Modul</th><th>Deskripsi</th><th>Pelaku</th>
              </tr></thead>
              <tbody>
                {logs && logs.length > 0 ? (logs as ActivityLog[]).map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(log.created_at)}</td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {log.log_name ?? '-'}
                      </span>
                    </td>
                    <td className="text-slate-700">{log.description}</td>
                    <td className="text-xs text-slate-500 font-mono">{log.causer_id ? log.causer_id.slice(0, 8) + '…' : '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-400">Belum ada log aktivitas</td></tr>
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
