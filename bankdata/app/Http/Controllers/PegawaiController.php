<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesSecureUploads;
use App\Http\Requests\StorePegawaiRequest;
use App\Http\Requests\UpdatePegawaiRequest;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PegawaiController extends Controller
{
    use HandlesSecureUploads;

    public function __construct()
    {
        // Semua route modul ini WAJIB login + role yang sesuai (didaftarkan juga di routes/web.php,
        // ditulis dobel di sini sebagai lapisan pertahanan kedua / defense in depth).
        $this->middleware(['auth', 'verified']);
        $this->middleware('role:admin,operator-kepegawaian')->except(['index', 'show']);
        $this->middleware('role:admin,operator-kepegawaian,viewer')->only(['index', 'show']);
    }

    public function index(Request $request)
    {
        $pegawai = Pegawai::query()
            ->cari($request->get('q'))
            ->when($request->get('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return view('pegawai.index', compact('pegawai'));
    }

    public function create(Request $request)
    {
        $folderId = $request->integer('folder_id');
        return view('pegawai.create', compact('folderId'));
    }

    public function store(StorePegawaiRequest $request)
    {
        $pegawai = null;
        DB::transaction(function () use ($request, &$pegawai) {
            $pegawai = Pegawai::create([
                ...$request->safe()->except('dokumen_sk'),
                'folder_id' => $request->input('folder_id'),
                'created_by' => $request->user()->id,
            ]);

            if ($request->hasFile('dokumen_sk')) {
                $this->simpanLampiran($request->file('dokumen_sk'), $pegawai, $request->user()->id);
            }

            activity('kepegawaian')
                ->causedBy($request->user())
                ->performedOn($pegawai)
                ->log("Menambah data pegawai atas nama {$pegawai->nama}");
        });

        return redirect()->route('folder.index', ['modul' => 'kepegawaian', 'folder' => $pegawai->folder_id])
                ->with('sukses', 'Data pegawai berhasil ditambahkan.');
    }

    public function show(Pegawai $pegawai)
    {
        $pegawai->load('attachments', 'pembuat', 'pengubah');
        return view('pegawai.show', compact('pegawai'));
    }

    public function edit(Pegawai $pegawai)
    {
        return view('pegawai.edit', compact('pegawai'));
    }

    public function update(UpdatePegawaiRequest $request, Pegawai $pegawai)
    {
        DB::transaction(function () use ($request, $pegawai) {
            $dataSebelum = $pegawai->only(['nama', 'jabatan', 'unit_kerja', 'status']);

            $pegawai->update([
                ...$request->safe()->except('dokumen_sk'),
                'updated_by' => $request->user()->id,
            ]);

            if ($request->hasFile('dokumen_sk')) {
                $this->simpanLampiran($request->file('dokumen_sk'), $pegawai, $request->user()->id);
            }

            activity('kepegawaian')
                ->causedBy($request->user())
                ->performedOn($pegawai)
                ->withProperties(['sebelum' => $dataSebelum, 'sesudah' => $pegawai->only(array_keys($dataSebelum))])
                ->log("Mengubah data pegawai atas nama {$pegawai->nama}");
        });

        return redirect()->route('folder.index', ['modul' => 'kepegawaian', 'folder' => $pegawai->folder_id])
                ->with('sukses', 'Data pegawai berhasil diperbarui.');
    }

    public function destroy(Request $request, Pegawai $pegawai)
    {
        abort_unless($request->user()->can('kepegawaian.hapus'), 403);

        $nama = $pegawai->nama;
        $folderId = $pegawai->folder_id;
        $pegawai->delete(); // soft delete, data tidak benar-benar hilang (arsip)

        activity('kepegawaian')
            ->causedBy($request->user())
            ->log("Menghapus (arsip) data pegawai atas nama {$nama}");

        return redirect()->route('folder.index', ['modul' => 'kepegawaian', 'folder' => $folderId])
                ->with('sukses', 'Data pegawai berhasil dihapus.');
    }
}
