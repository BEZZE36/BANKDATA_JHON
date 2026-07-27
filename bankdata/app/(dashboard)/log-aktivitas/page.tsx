import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import Header from '@/components/layout/Header';
import SearchBox from '@/components/ui/SearchBox';
import Pagination from '@/components/ui/Pagination';
import { formatDateTime } from '@/lib/utils';
import type { Metadata } from 'next';
import type { ActivityLog } from '@/lib/types';
import LogFilterSelect from './LogFilterSelect';

export const metadata: Metadata = { title: 'Log Aktivitas' };
const PER_PAGE = 20;

interface PageProps { searchParams: Promise<Record<string, string>> }

export default async function LogAktivitasPage({ searchParams }: PageProps) {
  await requireRole('admin');
  const params = await searchParams;
  const supabase = await createClient();

  // Auto cleanup: Hapus log yang umurnya lebih dari 6 bulan
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  await supabase
    .from('activity_log')
    .delete()
    .lt('created_at', sixMonthsAgo.toISOString());

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

  // Ambil data users untuk mapping causer_id ke nama
  const { data: usersData } = await supabase.from('users').select('id, name, email');
  const userMap = (usersData || []).reduce((acc, user) => {
    acc[String(user.id)] = user;
    return acc;
  }, {} as Record<string, { name: string, email: string }>);

  const modulList = ['login', 'kepegawaian', 'program', 'aset', 'keuangan', 'folder', 'lampiran', 'pengguna', 'import'];

  const getModulInfo = (logName: string | null) => {
    const defaultInfo = {
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: 'bg-slate-50 text-slate-700 border-slate-200',
      label: logName ? logName.charAt(0).toUpperCase() + logName.slice(1) : 'Sistem'
    };
    if (!logName) return defaultInfo;

    const map: Record<string, any> = {
      login: { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Autentikasi' },
      folder: { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>, color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Folder & File' },
      lampiran: { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>, color: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Lampiran' },
      kepegawaian: { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Kepegawaian' },
      program: { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>, color: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Program' },
      aset: { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Aset' },
      keuangan: { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'Keuangan' },
      pengguna: { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Pengguna' },
    };
    return map[logName.toLowerCase()] || defaultInfo;
  };

  return (
    <div>
      <Header
        title="Log Aktivitas"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Log Aktivitas' }]}
      />
      <div className="p-6 space-y-5 max-w-7xl mx-auto">
        <div className="card p-4 flex flex-col sm:flex-row gap-4 items-end bg-white/50 backdrop-blur-sm border border-slate-100 shadow-sm">
          <div className="flex-1 w-full">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">Pencarian</label>
            <SearchBox placeholder="Cari deskripsi aktivitas..." className="w-full" defaultValue={q} />
          </div>
          <div className="w-full sm:w-64">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">Filter Modul</label>
            <LogFilterSelect currentValue={logName} modulList={modulList} />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 shadow-sm">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="font-semibold mb-0.5">Informasi Sistem</p>
            <p>Untuk menghemat penyimpanan server, sistem akan <strong>menghapus/mereset log aktivitas secara otomatis</strong> setiap usianya melewati 6 bulan.</p>
          </div>
        </div>

        <div className="card overflow-hidden shadow-sm border border-slate-200">
          <div className="table-wrapper">
            <table className="data-table min-w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="py-4 px-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">No</th>
                  <th className="py-4 px-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-56">Waktu</th>
                  <th className="py-4 px-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">Modul</th>
                  <th className="py-4 px-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Aktivitas</th>
                  <th className="py-4 px-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-64">Pelaku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs && logs.length > 0 ? (logs as ActivityLog[]).map((log, index) => {
                  const no = (page - 1) * PER_PAGE + index + 1;
                  const user = log.causer_id ? userMap[String(log.causer_id)] : null;
                  const modul = getModulInfo(log.log_name);
                  const props = log.properties as Record<string, any> | null;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3.5 px-5 align-top">
                        <span className="text-sm font-medium text-slate-500">{no}</span>
                      </td>
                      <td className="py-3.5 px-5 align-top">
                        <div className="flex items-center text-sm text-slate-600 font-medium whitespace-nowrap">
                          {log.created_at ? formatDateTime(log.created_at) : (
                            <span className="text-slate-400 italic">Tidak tercatat</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 align-top">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${modul.color}`}>
                          {modul.icon}
                          {modul.label}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 align-top">
                        <div className="text-sm text-slate-800 font-medium">
                          {log.description}
                        </div>
                        {props && Object.keys(props).length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            {props.ip && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                IP: {props.ip}
                              </span>
                            )}
                            {props.old && (
                              <span className="inline-flex items-center text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                                Data diubah
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 align-top">
                        {user ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500 font-semibold text-xs uppercase shadow-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-500 italic">Pengguna tidak ditemukan</p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {log.causer_id ?? '-'}</p>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
                        <p className="text-base font-medium text-slate-600">Belum ada log aktivitas</p>
                        <p className="text-sm mt-1">Aktivitas sistem akan muncul di sini</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {total > PER_PAGE && (
            <div className="bg-slate-50 border-t border-slate-200 p-4">
              <Pagination total={total} page={page} perPage={PER_PAGE} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
