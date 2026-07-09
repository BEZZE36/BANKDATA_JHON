<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesSecureUploads;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class FolderController extends Controller
{
    use HandlesSecureUploads;

    private const MODUL_KE_ROLE = [
        'kepegawaian' => 'operator-kepegawaian',
        'program' => 'operator-program',
        'aset' => 'operator-aset',
        'keuangan' => 'operator-keuangan',
    ];

    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
    }

    /**
     * Tampilkan isi folder: daftar sub-folder + item data (pegawai/program/dst)
     * yang ada di folder ini. Jika $folder null, berarti sedang di root modul.
     */
    public function index(Request $request, string $modul, ?Folder $folder = null)
    {
        $this->pastikanModulValid($modul);
        $this->pastikanFolderMilikModul($folder, $modul);

        $subfolder = Folder::where('modul', $modul)
            ->where('parent_id', $folder?->id)
            ->orderBy('nama')
            ->get();

        // Data sekarang bisa ada di root (folder_id null) MAUPUN di dalam folder,
        // supaya user tidak wajib bikin folder dulu sebelum bisa input data.
        $items = $this->itemQueryUntukModul($modul, $folder?->id)->latest()->get();

        $breadcrumb = $folder ? $folder->breadcrumb() : [];

        return view('folder.index', [
            'modul' => $modul,
            'folder' => $folder,
            'subfolder' => $subfolder,
            'items' => $items,
            'breadcrumb' => $breadcrumb,
            'bisaKelola' => $request->user()->hasAnyRole(['admin', self::MODUL_KE_ROLE[$modul]]),
        ]);
    }

    private function itemQueryUntukModul(string $modul, ?int $folderId)
    {
        return match ($modul) {
            'kepegawaian' => \App\Models\Pegawai::where('folder_id', $folderId),
            'program' => \App\Models\Program::where('folder_id', $folderId),
            'aset' => \App\Models\Aset::where('folder_id', $folderId),
            'keuangan' => \App\Models\Keuangan::where('folder_id', $folderId),
        };
    }

    public function storeFolder(Request $request, string $modul, ?Folder $folder = null)
    {
        $this->pastikanModulValid($modul);
        $this->otorisasiKelola($request, $modul);

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:150'],
        ]);

        $baru = Folder::create([
            'modul' => $modul,
            'parent_id' => $folder?->id,
            'nama' => $data['nama'],
            'created_by' => $request->user()->id,
        ]);

        activity('folder')->causedBy($request->user())->performedOn($baru)
            ->log("Membuat folder \"{$baru->nama}\" di modul {$modul}");

        return back()->with('sukses', 'Folder berhasil dibuat.');
    }

    public function renameFolder(Request $request, Folder $folder)
    {
        $this->otorisasiKelola($request, $folder->modul);

        $data = $request->validate(['nama' => ['required', 'string', 'max:150']]);
        $namaLama = $folder->nama;
        $folder->update(['nama' => $data['nama'], 'updated_by' => $request->user()->id]);

        activity('folder')->causedBy($request->user())->performedOn($folder)
            ->log("Mengubah nama folder \"{$namaLama}\" menjadi \"{$folder->nama}\"");

        return back()->with('sukses', 'Folder berhasil diubah.');
    }

    public function destroyFolder(Request $request, Folder $folder)
    {
        $this->otorisasiKelola($request, $folder->modul);

        if ($folder->children()->exists() || $folder->itemQuery()->exists()) {
            return back()->withErrors(['folder' => 'Folder tidak kosong. Hapus dulu isi di dalamnya sebelum menghapus folder ini.']);
        }

        $nama = $folder->nama;
        $folder->delete();

        activity('folder')->causedBy($request->user())->log("Menghapus folder \"{$nama}\"");

        return redirect()->route('folder.index', ['modul' => $folder->modul, 'folder' => $folder->parent_id])
            ->with('sukses', 'Folder berhasil dihapus.');
    }

    public function uploadLampiran(Request $request, Folder $folder)
    {
        $this->otorisasiKelola($request, $folder->modul);

        $request->validate([
            'file' => ['required', 'file', 'max:5120', 'mimes:pdf,jpg,jpeg,png,xlsx,docx'],
        ]);

        $this->simpanLampiran($request->file('file'), $folder, $request->user()->id);

        activity('folder')->causedBy($request->user())->performedOn($folder)
            ->log("Mengunggah lampiran ke folder \"{$folder->nama}\"");

        return back()->with('sukses', 'File berhasil diunggah.');
    }

    /**
     * Hapus banyak item sekaligus: folder, baris data (pegawai/program/dst),
     * dan lampiran, dikirim dari checkbox yang dicentang di halaman explorer.
     * Folder yang belum kosong akan DILEWATI (bukan dipaksa hapus) demi keamanan data.
     */
    public function bulkDestroy(Request $request, string $modul, ?Folder $folder = null)
    {
        $this->pastikanModulValid($modul);
        $this->otorisasiKelola($request, $modul);

        $folderIds = (array) $request->input('folder_ids', []);
        $itemIds = (array) $request->input('item_ids', []);
        $attachmentIds = (array) $request->input('attachment_ids', []);

        $dilewati = 0;

        foreach (Folder::whereIn('id', $folderIds)->where('modul', $modul)->get() as $f) {
            if ($f->children()->exists() || $f->itemQuery()->exists()) {
                $dilewati++;
                continue;
            }
            activity('folder')->causedBy($request->user())->log("Menghapus folder \"{$f->nama}\" (hapus massal)");
            $f->delete();
        }

        if (!empty($itemIds)) {
            $modelClass = match ($modul) {
                'kepegawaian' => \App\Models\Pegawai::class,
                'program' => \App\Models\Program::class,
                'aset' => \App\Models\Aset::class,
                'keuangan' => \App\Models\Keuangan::class,
            };

            $items = $modelClass::whereIn('id', $itemIds)->get();
            foreach ($items as $item) {
                $item->delete();
            }
            if ($items->isNotEmpty()) {
                activity($modul)->causedBy($request->user())
                    ->log($items->count() . ' data dihapus sekaligus (hapus massal)');
            }
        }

        if (!empty($attachmentIds)) {
            foreach (\App\Models\Attachment::whereIn('id', $attachmentIds)->get() as $a) {
                if ($request->user()->hasRole('admin') || $request->user()->id === $a->uploaded_by) {
                    \Illuminate\Support\Facades\Storage::disk('local')->delete($a->path);
                    $a->delete();
                }
            }
        }

        $pesan = 'Item terpilih berhasil dihapus.';
        if ($dilewati > 0) {
            $pesan .= " ({$dilewati} folder dilewati karena belum kosong.)";
        }

        return back()->with('sukses', $pesan);
    }

    private function pastikanModulValid(string $modul): void
    {
        abort_unless(array_key_exists($modul, self::MODUL_KE_ROLE), 404);
    }

    private function pastikanFolderMilikModul(?Folder $folder, string $modul): void
    {
        abort_if($folder && $folder->modul !== $modul, 404);
    }

    private function otorisasiKelola(Request $request, string $modul): void
    {
        abort_unless(
            $request->user()->hasAnyRole(['admin', self::MODUL_KE_ROLE[$modul]]),
            403,
            'Anda tidak memiliki izin mengelola folder di modul ini.'
        );
    }
}
