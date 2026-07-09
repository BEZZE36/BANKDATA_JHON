<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesSecureUploads;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProgramController extends Controller
{
    use HandlesSecureUploads;

    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('role:admin,operator-program')->except(['index', 'show']);
        $this->middleware('role:admin,operator-program,viewer')->only(['index', 'show']);
    }

    protected function rules(?int $ignoreId = null): array
    {
        return [
            'kode_program' => ['required', 'string', 'max:30', Rule::unique('program', 'kode_program')->ignore($ignoreId)],
            'nama_program' => ['required', 'string', 'max:200'],
            'tahun_anggaran' => ['required', 'digits:4'],
            'unit_pelaksana' => ['required', 'string', 'max:150'],
            'target' => ['required', 'numeric', 'min:0'],
            'realisasi' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:perencanaan,berjalan,selesai,ditunda'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
            'dokumen' => ['nullable', 'file', 'max:5120', 'mimes:pdf,jpg,jpeg,png,xlsx,docx'],
        ];
    }

    public function index(Request $request)
    {
        $program = Program::query()
            ->cari($request->get('q'))
            ->when($request->get('tahun_anggaran'), fn ($q, $t) => $q->where('tahun_anggaran', $t))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return view('program.index', compact('program'));
    }

    public function create(Request $request)
    {
        $folderId = $request->integer('folder_id');
        return view('program.create', compact('folderId'));
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $program = null;

        DB::transaction(function () use ($request, $data, &$program) {
            $program = Program::create([
                ...collect($data)->except('dokumen')->toArray(),
                'folder_id' => $request->input('folder_id'),
                'created_by' => $request->user()->id,
            ]);

            if ($request->hasFile('dokumen')) {
                $this->simpanLampiran($request->file('dokumen'), $program, $request->user()->id);
            }

            activity('program')->causedBy($request->user())->performedOn($program)
                ->log("Menambah program {$program->nama_program}");
        });

        return redirect()->route('folder.index', ['modul' => 'program', 'folder' => $program->folder_id])
                ->with('sukses', 'Data program berhasil ditambahkan.');
    }

    public function show(Program $program)
    {
        $program->load('attachments', 'transaksiKeuangan');
        return view('program.show', compact('program'));
    }

    public function edit(Program $program)
    {
        return view('program.edit', compact('program'));
    }

    public function update(Request $request, Program $program)
    {
        $data = $request->validate($this->rules($program->id));

        DB::transaction(function () use ($request, $program, $data) {
            $program->update([
                ...collect($data)->except('dokumen')->toArray(),
                'updated_by' => $request->user()->id,
            ]);

            if ($request->hasFile('dokumen')) {
                $this->simpanLampiran($request->file('dokumen'), $program, $request->user()->id);
            }

            activity('program')->causedBy($request->user())->performedOn($program)
                ->log("Mengubah program {$program->nama_program}");
        });

        return redirect()->route('program.index')->with('sukses', 'Data program berhasil diperbarui.');
    }

    public function destroy(Request $request, Program $program)
    {
        abort_unless($request->user()->can('program.hapus'), 403);

        $nama = $program->nama_program;
        $folderId = $program->folder_id;
        $program->delete();

        activity('program')->causedBy($request->user())->log("Menghapus (arsip) program {$nama}");

        return redirect()->route('folder.index', ['modul' => 'program', 'folder' => $folderId])
                ->with('sukses', 'Data program berhasil dihapus.');
    }
}
