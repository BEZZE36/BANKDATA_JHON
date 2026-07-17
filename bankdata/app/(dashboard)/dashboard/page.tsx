import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: totalPegawai },
    { count: pegawaiAktif },
    { count: totalProgram },
    { count: programBerjalan },
    { count: totalAset },
    { count: asetRusak },
    { data: keuanganData },
  ] = await Promise.all([
    supabase.from('pegawai').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('pegawai').select('*', { count: 'exact', head: true }).eq('status', 'aktif').is('deleted_at', null),
    supabase.from('program').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('program').select('*', { count: 'exact', head: true }).eq('status', 'berjalan').is('deleted_at', null),
    supabase.from('aset').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('aset').select('*', { count: 'exact', head: true }).in('kondisi', ['rusak_ringan', 'rusak_berat']).is('deleted_at', null),
    supabase.from('keuangan').select('jenis, nominal').is('deleted_at', null),
  ]);

  const totalAnggaran = keuanganData?.filter(k => k.jenis === 'anggaran').reduce((s, k) => s + Number(k.nominal), 0) ?? 0;
  const totalRealisasi = keuanganData?.filter(k => k.jenis === 'realisasi').reduce((s, k) => s + Number(k.nominal), 0) ?? 0;

  return {
    kepegawaian: { total: totalPegawai ?? 0, aktif: pegawaiAktif ?? 0 },
    program: { total: totalProgram ?? 0, berjalan: programBerjalan ?? 0 },
    aset: { total: totalAset ?? 0, rusak: asetRusak ?? 0 },
    keuangan: { totalAnggaran, totalRealisasi },
  };
}

const statCards = [
  {
    modul: 'kepegawaian' as const,
    label: 'Data Kepegawaian',
    href: '/pegawai',
    color: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-400/20',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    modul: 'program' as const,
    label: 'Data Program',
    href: '/program',
    color: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-400/20',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    modul: 'aset' as const,
    label: 'Data Aset',
    href: '/aset',
    color: 'from-orange-500 to-orange-600',
    iconBg: 'bg-orange-400/20',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    modul: 'keuangan' as const,
    label: 'Data Keuangan',
    href: '/keuangan',
    color: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-400/20',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
];

export default async function DashboardPage() {
  const [user, stats] = await Promise.all([requireAuth(), getDashboardStats()]);

  const persen = stats.keuangan.totalAnggaran > 0
    ? Math.round((stats.keuangan.totalRealisasi / stats.keuangan.totalAnggaran) * 100)
    : 0;

  return (
    <div>
      <Header
        title="Dashboard"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />
      <div className="p-6 space-y-6">
        {/* Greeting */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Selamat datang kembali,</p>
              <h2 className="text-xl font-heading font-bold mt-0.5">{user.name}</h2>
              <p className="text-slate-400 text-sm mt-1">{user.unit_kerja ?? user.role}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const s = stats[card.modul];
            let mainNum = 0, subNum = 0, subLabel = '';

            if (card.modul === 'kepegawaian') {
              mainNum = (s as typeof stats.kepegawaian).total;
              subNum = (s as typeof stats.kepegawaian).aktif;
              subLabel = 'pegawai aktif';
            } else if (card.modul === 'program') {
              mainNum = (s as typeof stats.program).total;
              subNum = (s as typeof stats.program).berjalan;
              subLabel = 'sedang berjalan';
            } else if (card.modul === 'aset') {
              mainNum = (s as typeof stats.aset).total;
              subNum = (s as typeof stats.aset).rusak;
              subLabel = 'perlu perhatian';
            } else {
              mainNum = 0;
              subNum = 0;
            }

            if (card.modul === 'keuangan') {
              return (
                <Link
                  key={card.modul}
                  href={card.href}
                  className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group`}
                >
                  <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                    {card.icon}
                  </div>
                  <p className="text-white/70 text-xs mb-1">{card.label}</p>
                  <p className="text-lg font-bold leading-tight">{formatRupiah(stats.keuangan.totalRealisasi)}</p>
                  <p className="text-white/60 text-xs mt-1">realisasi • {persen}% capaian</p>
                </Link>
              );
            }

            return (
              <Link
                key={card.modul}
                href={card.href}
                className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group`}
              >
                <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  {card.icon}
                </div>
                <p className="text-white/70 text-xs mb-1">{card.label}</p>
                <p className="text-3xl font-bold">{mainNum.toLocaleString('id-ID')}</p>
                <p className="text-white/60 text-xs mt-1">{subNum} {subLabel}</p>
              </Link>
            );
          })}
        </div>

        {/* Ringkasan Keuangan */}
        <div className="card p-6">
          <h3 className="font-heading font-semibold text-slate-800 mb-4">Ringkasan Anggaran</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Anggaran</p>
              <p className="text-xl font-bold text-slate-800">{formatRupiah(stats.keuangan.totalAnggaran)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Realisasi</p>
              <p className="text-xl font-bold text-emerald-600">{formatRupiah(stats.keuangan.totalRealisasi)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Persentase Capaian</p>
              <p className="text-xl font-bold text-slate-800">{persen}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${
                  persen >= 90 ? 'bg-emerald-500' : persen >= 60 ? 'bg-blue-500' : persen >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(persen, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
