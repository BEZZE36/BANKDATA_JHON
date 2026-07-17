// ─── Format Rupiah ───────────────────────────────────────────────────────────

export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nominal);
}

// ─── Format Tanggal Bahasa Indonesia ─────────────────────────────────────────

export function formatTanggal(
  dateStr: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  });
}

export function formatTanggalPendek(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Persen Capaian Program ──────────────────────────────────────────────────

export function persenCapaian(target: number, realisasi: number): number {
  if (target <= 0) return 0;
  return Math.round((realisasi / target) * 1000) / 10; // 1 desimal
}

// ─── Ukuran File ─────────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Label & Warna Badge ─────────────────────────────────────────────────────

export function labelStatusPegawai(status: string): string {
  const map: Record<string, string> = {
    aktif: 'Aktif',
    pensiun: 'Pensiun',
    mutasi: 'Mutasi',
    nonaktif: 'Nonaktif',
  };
  return map[status] ?? status;
}

export function warnaBadgePegawai(status: string): string {
  const map: Record<string, string> = {
    aktif: 'bg-emerald-100 text-emerald-800',
    pensiun: 'bg-slate-100 text-slate-700',
    mutasi: 'bg-blue-100 text-blue-800',
    nonaktif: 'bg-red-100 text-red-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

export function labelStatusProgram(status: string): string {
  const map: Record<string, string> = {
    perencanaan: 'Perencanaan',
    berjalan: 'Berjalan',
    selesai: 'Selesai',
    ditunda: 'Ditunda',
  };
  return map[status] ?? status;
}

export function warnaBadgeProgram(status: string): string {
  const map: Record<string, string> = {
    perencanaan: 'bg-yellow-100 text-yellow-800',
    berjalan: 'bg-blue-100 text-blue-800',
    selesai: 'bg-emerald-100 text-emerald-800',
    ditunda: 'bg-red-100 text-red-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

export function labelKondisiAset(kondisi: string): string {
  const map: Record<string, string> = {
    baik: 'Baik',
    rusak_ringan: 'Rusak Ringan',
    rusak_berat: 'Rusak Berat',
  };
  return map[kondisi] ?? kondisi;
}

export function warnaBadgeAset(kondisi: string): string {
  const map: Record<string, string> = {
    baik: 'bg-emerald-100 text-emerald-800',
    rusak_ringan: 'bg-yellow-100 text-yellow-800',
    rusak_berat: 'bg-red-100 text-red-800',
  };
  return map[kondisi] ?? 'bg-gray-100 text-gray-700';
}

export function labelJenisKeuangan(jenis: string): string {
  return jenis === 'anggaran' ? 'Anggaran' : 'Realisasi';
}

export function warnaBadgeKeuangan(jenis: string): string {
  return jenis === 'anggaran'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-emerald-100 text-emerald-800';
}

// ─── URL Builder untuk Supabase Storage ─────────────────────────────────────

export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const bucket = process.env['NEXT_PUBLIC_STORAGE_BUCKET'] ?? 'bankdata-storage';
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

// ─── Warna Progress Bar ──────────────────────────────────────────────────────

export function warnaProgressBar(persen: number): string {
  if (persen >= 90) return 'bg-emerald-500';
  if (persen >= 60) return 'bg-blue-500';
  if (persen >= 30) return 'bg-yellow-500';
  return 'bg-red-500';
}

// ─── Slug / Class Modul ──────────────────────────────────────────────────────

export function labelModul(modul: string): string {
  const map: Record<string, string> = {
    kepegawaian: 'Data Kepegawaian',
    program: 'Data Program',
    aset: 'Data Aset',
    keuangan: 'Data Keuangan',
  };
  return map[modul] ?? modul;
}

// ─── Validasi ────────────────────────────────────────────────────────────────

export function isValidNIP(nip: string): boolean {
  return /^\d{18}$/.test(nip);
}

export function isValidTahun(tahun: number): boolean {
  return tahun >= 2000 && tahun <= 2100;
}

// ─── cn — class merge utility (pengganti clsx) ───────────────────────────────

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
