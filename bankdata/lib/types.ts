// ============================================================
// TYPES — Bank Data Application
// Konversi dari Laravel Eloquent models ke TypeScript interfaces
// ============================================================

// ─── Enums (sebagai const objects per skill typescript-pro) ──────────────────

export const StatusPegawai = {
  AKTIF: 'aktif',
  PENSIUN: 'pensiun',
  MUTASI: 'mutasi',
  NONAKTIF: 'nonaktif',
} as const;
export type StatusPegawai = (typeof StatusPegawai)[keyof typeof StatusPegawai];

export const StatusProgram = {
  PERENCANAAN: 'perencanaan',
  BERJALAN: 'berjalan',
  SELESAI: 'selesai',
  DITUNDA: 'ditunda',
} as const;
export type StatusProgram = (typeof StatusProgram)[keyof typeof StatusProgram];

export const KondisiAset = {
  BAIK: 'baik',
  RUSAK_RINGAN: 'rusak_ringan',
  RUSAK_BERAT: 'rusak_berat',
} as const;
export type KondisiAset = (typeof KondisiAset)[keyof typeof KondisiAset];

export const JenisKeuangan = {
  ANGGARAN: 'anggaran',
  REALISASI: 'realisasi',
} as const;
export type JenisKeuangan = (typeof JenisKeuangan)[keyof typeof JenisKeuangan];

export const ModulType = {
  KEPEGAWAIAN: 'kepegawaian',
  PROGRAM: 'program',
  ASET: 'aset',
  KEUANGAN: 'keuangan',
} as const;
export type ModulType = (typeof ModulType)[keyof typeof ModulType];

export const RoleType = {
  ADMIN: 'admin',
  OPERATOR_KEPEGAWAIAN: 'operator-kepegawaian',
  OPERATOR_PROGRAM: 'operator-program',
  OPERATOR_ASET: 'operator-aset',
  OPERATOR_KEUANGAN: 'operator-keuangan',
  VIEWER: 'viewer',
} as const;
export type RoleType = (typeof RoleType)[keyof typeof RoleType];

// ─── Database Row Types ──────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  unit_kerja: string | null;
  is_active: boolean;
  two_factor_secret: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole extends User {
  role: RoleType;
}

export interface Folder {
  id: number;
  modul: ModulType;
  parent_id: number | null;
  nama: string;
  created_by: string;
  updated_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FolderWithChildren extends Folder {
  children?: Folder[];
  parent?: Folder | null;
}

export interface Pegawai {
  id: number;
  folder_id: number | null;
  nip: string;
  nama: string;
  jabatan: string;
  golongan: string | null;
  unit_kerja: string;
  pendidikan_terakhir: string | null;
  tmt_jabatan: string | null;
  status: StatusPegawai;
  created_by: string;
  updated_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: number;
  folder_id: number | null;
  kode_program: string;
  nama_program: string;
  tahun_anggaran: number;
  unit_pelaksana: string;
  target: number;
  realisasi: number;
  status: StatusProgram;
  keterangan: string | null;
  created_by: string;
  updated_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgramWithCapaian extends Program {
  persen_capaian: number; // computed: (realisasi/target)*100
}

export interface Aset {
  id: number;
  folder_id: number | null;
  kode_aset: string;
  nama_aset: string;
  kategori: string;
  lokasi: string;
  kondisi: KondisiAset;
  tahun_perolehan: number | null;
  nilai_perolehan: number;
  foto_path: string | null;
  created_by: string;
  updated_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Keuangan {
  id: number;
  folder_id: number | null;
  program_id: number | null;
  no_transaksi: string;
  jenis: JenisKeuangan;
  nominal: number;
  tanggal: string;
  keterangan: string | null;
  created_by: string;
  updated_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KeuanganWithProgram extends Keuangan {
  program: Program | null;
}

export interface Attachment {
  id: number;
  attachable_type: string;
  attachable_id: number;
  path: string;
  original_name: string;
  mime_type: string;
  size: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  log_name: string | null;
  description: string;
  subject_type: string | null;
  subject_id: number | null;
  causer_type: string | null;
  causer_id: string | null;
  properties: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  causer?: User;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ─── Form Types ──────────────────────────────────────────────────────────────

export interface PegawaiForm {
  folder_id?: number | null;
  nip: string;
  nama: string;
  jabatan: string;
  golongan?: string;
  unit_kerja: string;
  pendidikan_terakhir?: string;
  tmt_jabatan?: string;
  status: StatusPegawai;
}

export interface ProgramForm {
  folder_id?: number | null;
  kode_program: string;
  nama_program: string;
  tahun_anggaran: number;
  unit_pelaksana: string;
  target: number;
  realisasi: number;
  status: StatusProgram;
  keterangan?: string;
}

export interface AsetForm {
  folder_id?: number | null;
  kode_aset: string;
  nama_aset: string;
  kategori: string;
  lokasi: string;
  kondisi: KondisiAset;
  tahun_perolehan?: number;
  nilai_perolehan: number;
}

export interface KeuanganForm {
  folder_id?: number | null;
  program_id?: number | null;
  no_transaksi: string;
  jenis: JenisKeuangan;
  nominal: number;
  tanggal: string;
  keterangan?: string;
}

// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  unit_kerja: string | null;
  is_active: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface TwoFAForm {
  code: string;
}
