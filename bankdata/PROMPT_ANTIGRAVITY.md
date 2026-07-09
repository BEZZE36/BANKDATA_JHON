# PROMPT UNTUK ANTIGRAVITY — Lengkapi Aplikasi Bank Data

Salin semua teks di bawah ini ke Antigravity.

---

Saya sedang membangun aplikasi web **"Bank Data"** untuk Kantor Gubernur Sulawesi Tengah menggunakan **Laravel 11 + MySQL + Tailwind CSS (via CDN, tanpa build step)**. Sebagian besar project sudah saya buat (migrations, models, controllers, sebagian view, auth, middleware role). Tolong lengkapi dan sempurnakan sesuai spesifikasi berikut.

## 1. Konteks Aplikasi
Aplikasi bank data internal dengan 4 modul utama:
1. **Data Kepegawaian** — data pegawai (NIP, nama, jabatan, golongan, unit kerja, status)
2. **Data Program** — program kerja per tahun anggaran (kode, nama, target, realisasi, status)
3. **Data Aset** — inventaris aset (kode, nama, kategori, lokasi, kondisi, foto)
4. **Data Keuangan** — transaksi anggaran/realisasi terhubung ke Data Program

Setiap modul memakai pola **CRUD + soft delete + audit log + upload lampiran** yang identik. Modul **Data Kepegawaian** (`app/Http/Controllers/PegawaiController.php` dan `resources/views/pegawai/*.blade.php`) adalah **contoh referensi lengkap** yang harus dijadikan pola untuk modul lain.

## 2. Yang Perlu Anda Kerjakan

### A. Lengkapi view yang belum ada
Buat view Blade untuk modul **Program, Aset, dan Keuangan** (index, create, edit, show), meniru gaya visual dan struktur `resources/views/pegawai/*.blade.php` persis, tapi sesuaikan field masing-masing modul dengan controller yang sudah ada di:
- `app/Http/Controllers/ProgramController.php`
- `app/Http/Controllers/AsetController.php`
- `app/Http/Controllers/KeuanganController.php`

Untuk Data Program, tambahkan progress bar visual (persentase realisasi vs target) di index & show, menggunakan `$program->persen_capaian` (accessor sudah tersedia di model).

Untuk Data Aset, tampilkan foto aset (`foto_path`, disimpan di disk `public`) sebagai thumbnail di index dan gambar besar di show.

Untuk Data Keuangan, tampilkan filter rentang tanggal dan jenis (anggaran/realisasi) di index, serta ringkasan total di bagian atas tabel.

### B. Prinsip Desain UI/UX (WAJIB diikuti)
- Gunakan Tailwind CSS via CDN (`https://cdn.tailwindcss.com`) — sudah ada di `layouts/app.blade.php`, jangan diganti ke build step (Vite/npm) karena akan di-deploy ke hosting gratis tanpa Node.js.
- Font heading: **Space Grotesk** (sudah dimuat via Google Fonts di layout), font body: **Inter**.
- Palet warna: emerald-600 sebagai warna aksi utama, slate-900 untuk sidebar gelap, kartu putih dengan border tipis dan rounded-2xl, hover dengan efek shadow + translate halus (`hover:-translate-y-0.5`).
- Semua tabel data harus: bisa dicari (search box), bisa difilter, ada pagination, dan responsif (scroll horizontal di mobile dengan `overflow-x-auto`).
- Semua form harus menampilkan pesan error validasi per-field secara jelas, dan flash message sukses/gagal di atas halaman (pola sudah ada di layout, pakai `session('sukses')` dan `$errors`).
- Ikon pakai Font Awesome (sudah dimuat via CDN).
- Jangan gunakan `<form>` HTML native untuk apapun selain form Blade biasa (tidak relevan di sini karena bukan React, tapi tetap pastikan semua form pakai `@csrf`).

### C. Keamanan (WAJIB, jangan dilonggarkan)
- Setiap controller modul HARUS tetap memvalidasi role via middleware `role:...` seperti pola di `PegawaiController` — jangan hapus middleware ini demi "mempermudah testing".
- Setiap upload file HARUS divalidasi ulang MIME asli (bukan ekstensi) dan ukuran maksimal, ikuti pola `HandlesSecureUploads` trait.
- Setiap create/update/delete HARUS tercatat di `activity log` dengan `causedBy()` dan deskripsi bahasa Indonesia yang jelas.
- Jangan pernah menampilkan pesan error mentah dari exception ke user di production — gunakan pesan bahasa Indonesia yang ramah.
- Jangan hardcode kredensial database, API key, atau password apapun di kode — semua lewat `.env`.

### D. Fitur Tambahan yang Perlu Dibuat
1. **Export laporan** — tambahkan tombol "Export ke Excel" di index Data Keuangan dan Data Aset menggunakan package `maatwebsite/excel` yang sudah ada di `composer.json`.
2. **Export PDF** — tambahkan tombol "Cetak PDF" di halaman show Data Program (laporan realisasi program) menggunakan `barryvdh/laravel-dompdf`.
3. **Halaman manajemen user** (khusus role `admin`) — CRUD user + assign role, di route `/pengguna`, dengan view bergaya sama seperti modul lain.
4. **Halaman activity log** (khusus role `admin`) — tabel riwayat aktivitas seluruh sistem, bisa difilter per modul dan per user, di route `/log-aktivitas`.
5. **Verifikasi 2FA** — buat controller & view untuk `route('2fa.verify')` yang sudah direferensikan di `LoginController`, menggunakan package `pragmarx/google2fa-laravel` (input kode 6 digit dari aplikasi authenticator).

### E. Constraint Teknis
- PHP 8.2, Laravel 11, MySQL/MariaDB.
- Tidak boleh menambahkan dependency yang butuh Node.js/npm build step (karena target deploy ke hosting gratis PHP shared hosting tanpa akses SSH/Node).
- Semua teks antarmuka dalam **Bahasa Indonesia**.
- Ikuti konvensi penamaan yang sudah ada: nama variabel/field/tabel dalam Bahasa Indonesia (`pegawai`, `nama_program`, dll), nama class/method dalam PascalCase/camelCase standar Laravel.

Setelah selesai, tampilkan ringkasan file apa saja yang dibuat/diubah.
