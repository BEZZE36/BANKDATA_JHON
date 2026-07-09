<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\AsetController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\KeuanganController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\ProgramController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])
        ->middleware('throttle:10,1'); // lapisan kedua rate-limit di level HTTP
});

Route::post('/logout', [LoginController::class, 'logout'])->name('logout')->middleware('auth');

// Di LUAR grup auth: harus bisa diakses server Google Docs Viewer tanpa sesi login,
// keamanannya dijamin lewat signature URL sementara (lihat AttachmentController::preview).
Route::get('/lampiran/{attachment}/raw', [AttachmentController::class, 'raw'])->name('attachment.raw');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Navigasi ala Windows Explorer: /data/kepegawaian, /data/kepegawaian/5 (masuk ke folder id 5), dst.
    Route::get('/data/{modul}/{folder?}', [FolderController::class, 'index'])
        ->where('modul', 'kepegawaian|program|aset|keuangan')
        ->name('folder.index');
    Route::post('/data/{modul}/folder/{folder?}', [FolderController::class, 'storeFolder'])
        ->where('modul', 'kepegawaian|program|aset|keuangan')
        ->name('folder.store');
    Route::put('/folder/{folder}/rename', [FolderController::class, 'renameFolder'])->name('folder.rename');
    Route::delete('/folder/{folder}', [FolderController::class, 'destroyFolder'])->name('folder.destroy');
    Route::post('/folder/{folder}/upload', [FolderController::class, 'uploadLampiran'])->name('folder.upload');

    Route::post('/data/{modul}/hapus-massal/{folder?}', [FolderController::class, 'bulkDestroy'])
        ->where('modul', 'kepegawaian|program|aset|keuangan')
        ->name('folder.bulkDestroy');

    // Download file lampiran yang tersimpan aman di storage/app/private (bukan folder public)
    Route::get('/lampiran/{attachment}/unduh', [AttachmentController::class, 'download'])->name('attachment.download');
    Route::get('/lampiran/{attachment}/lihat', [AttachmentController::class, 'preview'])->name('attachment.preview');
    Route::put('/lampiran/{attachment}/rename', [AttachmentController::class, 'rename'])->name('attachment.rename');
    Route::delete('/lampiran/{attachment}', [AttachmentController::class, 'destroy'])->name('attachment.destroy');

    // Import Excel per modul, dan export Excel/PDF
    Route::post('/data/{modul}/{folder}/import', [ImportController::class, 'import'])
        ->where('modul', 'kepegawaian|program|aset|keuangan')
        ->name('import.store');
    Route::get('/data/{modul}/{folder}/export', [ImportController::class, 'export'])
        ->where('modul', 'kepegawaian|program|aset|keuangan')
        ->name('import.export');
    Route::get('/data/{modul}/{folder}/template', [ImportController::class, 'template'])
        ->where('modul', 'kepegawaian|program|aset|keuangan')
        ->name('import.template');

    Route::resource('pegawai', PegawaiController::class);
    Route::resource('program', ProgramController::class);
    Route::resource('aset', AsetController::class);
    Route::resource('keuangan', KeuanganController::class);
});

// Redirect halaman utama tak dikenal ke dashboard/login
Route::fallback(function () {
    return redirect(auth()->check() ? route('dashboard') : route('login'));
});
