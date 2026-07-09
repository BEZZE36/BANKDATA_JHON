# Bank Data — Kantor Gubernur Sulawesi Tengah

Aplikasi bank data internal dengan 4 modul: **Data Kepegawaian, Data Program, Data Aset, Data Keuangan**.
Dibangun dengan Laravel 11 + MySQL, role-based access (Spatie Permission), audit log (Spatie Activitylog), dan proteksi upload dokumen.

## 1. Instalasi Lokal

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Atur `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` di `.env`, lalu:

```bash
php artisan migrate
php artisan db:seed --class=Database\\Seeders\\RoleAndAdminSeeder
php artisan storage:link
php artisan serve
```

Login pertama kali: `[email protected]` / `GantiSegera!2026` — **wajib ganti password setelah login**.

Perlu tambahan publish untuk paket pihak ketiga:
```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"
php artisan migrate
```

## 2. Struktur Peran (Role)

| Role | Akses |
|---|---|
| `admin` | Semua modul, satu-satunya yang boleh hapus data keuangan |
| `operator-kepegawaian` | Tambah/ubah/hapus Data Kepegawaian |
| `operator-program` | Tambah/ubah/hapus Data Program |
| `operator-aset` | Tambah/ubah/hapus Data Aset |
| `operator-keuangan` | Tambah/ubah Data Keuangan (tidak bisa hapus) |
| `viewer` | Hanya lihat semua modul |

## 3. Keamanan yang Sudah Diterapkan

- Password di-hash bcrypt otomatis (`'password' => 'hashed'` di model User)
- CSRF token di semua form (`@csrf`)
- Rate limiting login: 5x gagal → kunci 5 menit (per email + IP)
- Session regenerate saat login/logout (cegah session fixation)
- Role & permission granular per modul (Spatie Permission)
- Middleware `role:` custom yang otomatis mencatat percobaan akses ilegal ke activity log
- Validasi MIME asli file (bukan sekadar ekstensi) + ukuran maksimal
- Nama file upload di-random (UUID) agar tidak bisa ditebak/dieksekusi
- Soft delete di semua modul data (data terhapus tetap ada sebagai arsip, bukan hilang permanen)
- Header keamanan (`X-Frame-Options`, `X-Content-Type-Options`, dst.) di `bootstrap/app.php`
- Activity log untuk setiap create/update/delete + siapa pelakunya
- `APP_DEBUG=false` di production (mencegah bocornya stack trace/source code ke publik)

**Yang WAJIB Anda lakukan tambahan sebelum go-live:**
1. Ganti password admin default.
2. Pasang SSL/HTTPS (gratis lewat Let's Encrypt atau Cloudflare).
3. Aktifkan backup database otomatis harian.
4. Jangan expose `.env` — pastikan document root hosting mengarah ke folder `public/`, bukan root project.

## 4. Rekomendasi Hosting Gratis (dan Batasannya)

Untuk **belajar/demo/prototipe**, opsi gratis yang bisa dipakai:

- **InfinityFree** — gratis selamanya, dukung PHP 8.1+, MySQL, tapi ada `open_basedir` restriction sehingga struktur folder Laravel harus diratakan (index.php & isi folder `public/` dipindah ke `htdocs/`), dan Anda tidak bisa menjalankan `php artisan` langsung di server (generate `APP_KEY` di lokal dulu, lalu tempel ke `.env` server).
- **Laravel Cloud** — bukan gratis permanen, tapi ada kredit gratis awal ($5) dan jauh lebih mudah untuk Laravel (deploy langsung dari Git, database & storage sudah terintegrasi).

**Catatan penting karena ini untuk instansi kantor gubernur:** hosting gratis (InfinityFree, dsb.) punya keterbatasan uptime, tidak ada SLA, dan alamatnya berupa subdomain gratis (`.great-site.net`, dsb.) — kurang kredibel dan kurang aman untuk sistem data kepegawaian/keuangan resmi pemerintah. Untuk **prototipe/demo ke atasan atau dosen**, hosting gratis di atas sudah cukup. Untuk **penggunaan produksi sesungguhnya**, sebaiknya ajukan domain resmi (`.go.id`) dan hosting ke Dinas Kominfo setempat — biasanya tersedia gratis untuk instansi pemerintah daerah.

## 5. Struktur Modul yang Perlu Dilengkapi

Controller untuk **Program, Aset, Keuangan** sudah lengkap (`app/Http/Controllers/`). View untuk ketiganya belum dibuat — silakan duplikasi pola di `resources/views/pegawai/` (index, create, edit, show) dan sesuaikan field-nya. Lihat file `PROMPT_ANTIGRAVITY.md` untuk instruksi lengkap men-generate sisanya secara otomatis.
