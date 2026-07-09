<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesSecureUploads;
use App\Models\Aset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AsetController extends Controller
{
    use HandlesSecureUploads;

    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('role:admin,operator-aset')->except(['index', 'show']);
        $this->middleware('role:admin,operator-aset,viewer')->only(['index', 'show']);
    }

    protected function rules(?int $ignoreId = null): array
    {
        return [
            'kode_aset' => ['required', 'string', 'max:30', Rule::unique('aset', 'kode_aset')->ignore($ignoreId)],
            'nama_aset' => ['required', 'string', 'max:200'],
            'kategori' => ['required', 'string', 'max:100'],
            'lokasi' => ['required', 'string', 'max:150'],
            'kondisi' => ['required', 'in:baik,rusak_ringan,rusak_berat'],
            'tahun_perolehan' => ['nullable', 'digits:4'],
            'nilai_perolehan' => ['required', 'numeric', 'min:0'],
            'foto' => ['nullable', 'image', 'max:3072'],
        ];
    }

    public function index(Request $request)
    {
        $aset = Aset::query()
            ->cari($request->get('q'))
            ->when($request->get('kondisi'), fn ($q, $k) => $q->where('kondisi', $k))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return view('aset.index', compact('aset'));
    }

    public function create(Request $request)
    {
        $folderId = $request->integer('folder_id');
        return view('aset.create', compact('folderId'));
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $aset = null;

        DB::transaction(function () use ($request, $data, &$aset) {
            $fotoPath = $request->hasFile('foto')
                ? $request->file('foto')->store('foto-aset', 'public')
                : null;

            $aset = Aset::create([
                ...collect($data)->except('foto')->toArray(),
                'foto_path' => $fotoPath,
                'folder_id' => $request->input('folder_id'),
                'created_by' => $request->user()->id,
            ]);

            activity('aset')->causedBy($request->user())->performedOn($aset)
                ->log("Menambah aset {$aset->nama_aset}");
        });

        return redirect()->route('folder.index', ['modul' => 'aset', 'folder' => $aset->folder_id])
                ->with('sukses', 'Data aset berhasil ditambahkan.');
    }

    public function show(Aset $aset)
    {
        return view('aset.show', compact('aset'));
    }

    public function edit(Aset $aset)
    {
        return view('aset.edit', compact('aset'));
    }

    public function update(Request $request, Aset $aset)
    {
        $data = $request->validate($this->rules($aset->id));

        DB::transaction(function () use ($request, $aset, $data) {
            $payload = collect($data)->except('foto')->toArray();
            $payload['updated_by'] = $request->user()->id;

            if ($request->hasFile('foto')) {
                $payload['foto_path'] = $request->file('foto')->store('foto-aset', 'public');
            }

            $aset->update($payload);

            activity('aset')->causedBy($request->user())->performedOn($aset)
                ->log("Mengubah aset {$aset->nama_aset}");
        });

        return redirect()->route('aset.index')->with('sukses', 'Data aset berhasil diperbarui.');
    }

    public function destroy(Request $request, Aset $aset)
    {
        abort_unless($request->user()->can('aset.hapus'), 403);

        $nama = $aset->nama_aset;
        $folderId = $aset->folder_id;
        $aset->delete();

        activity('aset')->causedBy($request->user())->log("Menghapus (arsip) aset {$nama}");

        return redirect()->route('folder.index', ['modul' => 'aset', 'folder' => $folderId])
                ->with('sukses', 'Data aset berhasil dihapus.');
    }
}
