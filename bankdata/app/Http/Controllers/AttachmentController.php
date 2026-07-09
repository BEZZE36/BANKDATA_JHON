<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class AttachmentController extends Controller
{
    public function __construct()
    {
        // 'raw' sengaja TIDAK ikut middleware auth karena harus bisa diakses
        // server Google (Google Docs Viewer) tanpa sesi login kita.
        // Keamanannya digantikan oleh tanda tangan URL sementara (signed route).
        $this->middleware(['auth', 'verified'])->except(['raw']);
        $this->middleware('signed')->only(['raw']);
    }

    public function download(Request $request, Attachment $attachment)
    {
        abort_unless(Storage::disk('local')->exists($attachment->path), 404, 'File tidak ditemukan.');

        activity('lampiran')->causedBy($request->user())
            ->log("Mengunduh file {$attachment->original_name}");

        return Storage::disk('local')->download($attachment->path, $attachment->original_name);
    }

    /**
     * Diklik lewat ikon mata. PDF & gambar langsung ditampilkan di tab baru.
     * Dokumen Word/Excel diarahkan ke Google Docs Viewer lewat link sementara.
     */
    public function preview(Request $request, Attachment $attachment)
    {
        abort_unless(Storage::disk('local')->exists($attachment->path), 404, 'File tidak ditemukan.');

        activity('lampiran')->causedBy($request->user())
            ->log("Melihat pratinjau file {$attachment->original_name}");

        $bisaTampilLangsung = in_array($attachment->mime_type, ['application/pdf', 'image/jpeg', 'image/png']);

        if ($bisaTampilLangsung) {
            return response()->file(Storage::disk('local')->path($attachment->path), [
                'Content-Type' => $attachment->mime_type,
                'Content-Disposition' => 'inline; filename="' . $attachment->original_name . '"',
            ]);
        }

        // Dokumen Office (docx/xlsx) -> lewat Google Docs Viewer, butuh URL sementara
        // yang bisa diakses tanpa login (kadaluarsa 10 menit demi keamanan).
        $urlSementara = URL::temporarySignedRoute('attachment.raw', now()->addMinutes(10), ['attachment' => $attachment->id]);

        return redirect('https://docs.google.com/viewer?url=' . urlencode($urlSementara) . '&embedded=true');
    }

    /**
     * Endpoint mentah khusus dipanggil Google Docs Viewer. Hanya bisa diakses
     * dengan signature URL yang valid & belum kadaluarsa (bukan lewat login biasa).
     */
    public function raw(Attachment $attachment)
    {
        abort_unless(Storage::disk('local')->exists($attachment->path), 404);

        return response()->file(Storage::disk('local')->path($attachment->path), [
            'Content-Type' => $attachment->mime_type,
        ]);
    }

    public function rename(Request $request, Attachment $attachment)
    {
        abort_unless(
            $request->user()->hasRole('admin') || $request->user()->id === $attachment->uploaded_by,
            403
        );

        $data = $request->validate(['original_name' => ['required', 'string', 'max:255']]);
        $namaLama = $attachment->original_name;
        $attachment->update(['original_name' => $data['original_name']]);

        activity('lampiran')->causedBy($request->user())
            ->log("Mengubah nama file \"{$namaLama}\" menjadi \"{$attachment->original_name}\"");

        return back()->with('sukses', 'Nama file berhasil diubah.');
    }

    public function destroy(Request $request, Attachment $attachment)
    {
        // Hanya admin atau si pengunggah sendiri yang boleh hapus lampiran
        abort_unless(
            $request->user()->hasRole('admin') || $request->user()->id === $attachment->uploaded_by,
            403
        );

        Storage::disk('local')->delete($attachment->path);
        $nama = $attachment->original_name;
        $attachment->delete();

        activity('lampiran')->causedBy($request->user())->log("Menghapus file {$nama}");

        return back()->with('sukses', 'File berhasil dihapus.');
    }
}

