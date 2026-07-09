<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesSecureUploads;
use App\Models\Keuangan;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class KeuanganController extends Controller
{
    use HandlesSecureUploads;

    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        // Modul keuangan paling sensitif -> hanya admin & operator-keuangan yang boleh ubah/hapus.
        $this->middleware('role:admin,operator-keuangan')->except(['index', 'show']);
        $this->middleware('role:admin,operator-keuangan,viewer')->only(['index', 'show']);
    }

    protected function rules(?int $ignoreId = null): array
    {
        return [
            'no_transaksi' => ['required', 'string', 'max:40', Rule::unique('keuangan', 'no_transaksi')->ignore($ignoreId)],
            'jenis' => ['required', 'in:anggaran,realisasi'],
            'nominal' => ['required', 'numeric', 'min:0'],
            'program_id' => ['nullable', 'exists:program,id'],
            'tanggal' => ['required', 'date'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
            'bukti' => ['nullable', 'file', 'max:5120', 'mimes:pdf,jpg,jpeg,png'],
        ];
    }

    public function index(Request $request)
    {
        $keuangan = Keuangan::with('program')
            ->when($request->get('jenis'), fn ($q, $j) => $q->where('jenis', $j))
            ->when($request->get('dari'), fn ($q, $d) => $q->whereDate('tanggal', '>=', $d))
            ->when($request->get('sampai'), fn ($q, $s) => $q->whereDate('tanggal', '<=', $s))
            ->latest('tanggal')
            ->paginate(15)
            ->withQueryString();

        return view('keuangan.index', compact('keuangan'));
    }

    public function create(Request $request)
    {
        $programList = Program::orderBy('nama_program')->get(['id', 'nama_program']);
        $folderId = $request->integer('folder_id');
        return view('keuangan.create', compact('programList', 'folderId'));
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $keuangan = null;

        DB::transaction(function () use ($request, $data, &$keuangan) {
            $keuangan = Keuangan::create([
                ...collect($data)->except('bukti')->toArray(),
                'folder_id' => $request->input('folder_id'),
                'created_by' => $request->user()->id,
            ]);

            if ($request->hasFile('bukti')) {
                $this->simpanLampiran($request->file('bukti'), $keuangan, $request->user()->id);
            }

            activity('keuangan')->causedBy($request->user())->performedOn($keuangan)
                ->log("Menambah transaksi keuangan {$keuangan->no_transaksi} senilai Rp" . number_format((float) $keuangan->nominal, 0, ',', '.'));
        });

        return redirect()->route('folder.index', ['modul' => 'keuangan', 'folder' => $keuangan->folder_id])
                ->with('sukses', 'Transaksi berhasil dicatat.');
    }

    public function show(Keuangan $keuangan)
    {
        $keuangan->load('attachments', 'program');
        return view('keuangan.show', compact('keuangan'));
    }

    public function edit(Keuangan $keuangan)
    {
        $programList = Program::orderBy('nama_program')->get(['id', 'nama_program']);
        return view('keuangan.edit', compact('keuangan', 'programList'));
    }

    public function update(Request $request, Keuangan $keuangan)
    {
        $data = $request->validate($this->rules($keuangan->id));

        DB::transaction(function () use ($request, $keuangan, $data) {
            $keuangan->update([
                ...collect($data)->except('bukti')->toArray(),
                'updated_by' => $request->user()->id,
            ]);

            if ($request->hasFile('bukti')) {
                $this->simpanLampiran($request->file('bukti'), $keuangan, $request->user()->id);
            }

            activity('keuangan')->causedBy($request->user())->performedOn($keuangan)
                ->log("Mengubah transaksi keuangan {$keuangan->no_transaksi}");
        });

        return redirect()->route('keuangan.index')->with('sukses', 'Transaksi berhasil diperbarui.');
    }

    public function destroy(Request $request, Keuangan $keuangan)
    {
        // Hapus data keuangan HANYA boleh admin (bukan operator), demi jejak audit yang ketat.
        abort_unless($request->user()->hasRole('admin'), 403, 'Hanya admin yang dapat menghapus data keuangan.');

        $no = $keuangan->no_transaksi;
        $folderId = $keuangan->folder_id;
        $keuangan->delete();

        activity('keuangan')->causedBy($request->user())->log("Menghapus (arsip) transaksi {$no}");

        return redirect()->route('folder.index', ['modul' => 'keuangan', 'folder' => $folderId])
                ->with('sukses', 'Transaksi berhasil dihapus.');
    }
}
