@extends('layouts.app')
@section('title', 'Data ' . ucfirst($modul))

@section('content')
@php
    $labelModul = ['kepegawaian' => 'Data Kepegawaian', 'program' => 'Data Program', 'aset' => 'Data Aset', 'keuangan' => 'Data Keuangan'][$modul];
    $rutePembuatan = ['kepegawaian' => 'pegawai.create', 'program' => 'program.create', 'aset' => 'aset.create', 'keuangan' => 'keuangan.create'][$modul];
    $ruteLihat = ['kepegawaian' => 'pegawai.show', 'program' => 'program.show', 'aset' => 'aset.show', 'keuangan' => 'keuangan.show'][$modul];
    $ruteUbah = ['kepegawaian' => 'pegawai.edit', 'program' => 'program.edit', 'aset' => 'aset.edit', 'keuangan' => 'keuangan.edit'][$modul];
    $prefixHapusItem = ['kepegawaian' => '/pegawai/', 'program' => '/program/', 'aset' => '/aset/', 'keuangan' => '/keuangan/'][$modul];
@endphp

<!-- Breadcrumb -->
<div class="flex items-center gap-2 text-sm text-slate-500 mb-4 flex-wrap">
    <a href="{{ route('folder.index', ['modul' => $modul]) }}" class="hover:text-emerald-600 font-medium">{{ $labelModul }}</a>
    @foreach ($breadcrumb as $node)
        <i class="fa-solid fa-chevron-right text-xs"></i>
        <a href="{{ route('folder.index', ['modul' => $modul, 'folder' => $node->id]) }}"
           class="hover:text-emerald-600 {{ $loop->last ? 'text-slate-900 font-medium' : '' }}">{{ $node->nama }}</a>
    @endforeach
</div>

<!-- Toolbar: satu tombol utama + menu titik tiga untuk aksi jarang dipakai -->
@if ($bisaKelola)
<div class="flex items-center gap-2 mb-6">
    <div class="relative">
        <button onclick="document.getElementById('menu-tambah').classList.toggle('hidden')"
                class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2">
            <i class="fa-solid fa-plus"></i> Tambah <i class="fa-solid fa-chevron-down text-xs"></i>
        </button>
        <div id="menu-tambah" class="hidden absolute left-0 mt-1 w-52 bg-white border rounded-lg shadow-lg z-40 py-1 text-sm">
            <button onclick="document.getElementById('modal-folder').classList.remove('hidden'); this.closest('#menu-tambah').classList.add('hidden')"
                    class="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                <i class="fa-solid fa-folder-plus text-amber-500 w-4"></i> Folder Baru
            </button>
            <a href="{{ route($rutePembuatan, ['folder_id' => $folder?->id]) }}"
               class="block px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                <i class="fa-solid fa-file-circle-plus text-blue-500 w-4"></i> Data Baru
            </a>
            @if ($folder)
                <button onclick="document.getElementById('modal-upload').classList.remove('hidden'); this.closest('#menu-tambah').classList.add('hidden')"
                        class="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                    <i class="fa-solid fa-paperclip text-slate-500 w-4"></i> Upload File
                </button>
            @endif
        </div>
    </div>

    @if ($folder)
        <div class="relative">
            <button onclick="document.getElementById('menu-lainnya').classList.toggle('hidden')"
                    class="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                <i class="fa-solid fa-ellipsis"></i>
            </button>
            <div id="menu-lainnya" class="hidden absolute left-0 mt-1 w-52 bg-white border rounded-lg shadow-lg z-40 py-1 text-sm">
                <button onclick="document.getElementById('modal-import').classList.remove('hidden'); this.closest('#menu-lainnya').classList.add('hidden')"
                        class="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                    <i class="fa-solid fa-file-excel text-green-600 w-4"></i> Import dari Excel
                </button>
                <a href="{{ route('import.template', ['modul' => $modul, 'folder' => $folder->id]) }}" class="block px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                    <i class="fa-solid fa-download text-slate-500 w-4"></i> Unduh Template
                </a>
                <a href="{{ route('import.export', ['modul' => $modul, 'folder' => $folder->id]) }}" class="block px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                    <i class="fa-solid fa-file-export text-slate-500 w-4"></i> Export ke Excel
                </a>
            </div>
        </div>
    @endif
</div>
@endif

<!-- Bar aksi massal -->
@if ($bisaKelola)
<div id="bar-massal" class="hidden sticky top-0 z-30 mb-4 flex items-center justify-between bg-slate-900 text-white rounded-xl px-4 py-3">
    <span class="text-sm"><span id="jumlah-terpilih">0</span> item dipilih</span>
    <div class="flex gap-2">
        <button type="button" onclick="batalkanPilihan()" class="px-3 py-1.5 bg-slate-700 rounded-lg text-sm hover:bg-slate-600">Batal</button>
        <button type="button" onclick="hapusMassal()" class="px-3 py-1.5 bg-rose-600 rounded-lg text-sm hover:bg-rose-700">
            <i class="fa-solid fa-trash mr-1"></i> Hapus Terpilih
        </button>
    </div>
</div>
@endif

@if ($subfolder->isNotEmpty())
<p class="text-xs font-semibold text-slate-400 uppercase mb-2">Folder</p>
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
    @foreach ($subfolder as $f)
        <div class="group relative bg-white border rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition">
            @if ($bisaKelola)
                <input type="checkbox" class="cb-massal absolute top-2 left-2 w-4 h-4 opacity-0 group-hover:opacity-100 checked:opacity-100"
                       data-tipe="folder" value="{{ $f->id }}" onchange="perbaruiBarMassal()">
            @endif
            <a href="{{ route('folder.index', ['modul' => $modul, 'folder' => $f->id]) }}" class="flex flex-col items-center gap-2 w-full">
                <i class="fa-solid fa-folder text-4xl text-amber-400"></i>
                <span class="text-xs font-medium text-slate-700 break-words w-full">{{ $f->nama }}</span>
            </a>
            @if ($bisaKelola)
                <div class="absolute top-2 right-2 hidden group-hover:flex gap-1">
                    <button onclick="bukaRenameFolder({{ $f->id }}, '{{ addslashes($f->nama) }}')" class="text-slate-400 hover:text-blue-600 text-xs"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="hapusSatu('/folder/', {{ $f->id }})" class="text-slate-400 hover:text-rose-600 text-xs"><i class="fa-solid fa-trash"></i></button>
                </div>
            @endif
        </div>
    @endforeach
</div>
@endif

@if ($items->isNotEmpty())
<p class="text-xs font-semibold text-slate-400 uppercase mb-2">Data</p>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
    @foreach ($items as $item)
        <div class="group relative bg-white border rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition">
            @if ($bisaKelola)
                <input type="checkbox" class="cb-massal w-4 h-4 flex-shrink-0" data-tipe="item" value="{{ $item->id }}" onchange="perbaruiBarMassal()">
            @endif
            <a href="{{ route($ruteLihat, $item) }}" class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <i class="fa-regular fa-file-lines"></i>
                </div>
                <div class="min-w-0">
                    <p class="text-sm font-medium text-slate-800 truncate">
                        @switch($modul)
                            @case('kepegawaian') {{ $item->nama }} @break
                            @case('program') {{ $item->nama_program }} @break
                            @case('aset') {{ $item->nama_aset }} @break
                            @case('keuangan') {{ $item->no_transaksi }} @break
                        @endswitch
                    </p>
                    <span class="inline-block text-[10px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 rounded px-1.5 py-0.5 mt-0.5">Data</span>
                </div>
            </a>
            @if ($bisaKelola)
                <div class="hidden group-hover:flex gap-2 flex-shrink-0">
                    <a href="{{ route($ruteUbah, $item) }}" class="text-slate-400 hover:text-blue-600 text-sm"><i class="fa-solid fa-pen"></i></a>
                    <button onclick="hapusSatu('{{ $prefixHapusItem }}', {{ $item->id }})" class="text-slate-400 hover:text-rose-600 text-sm"><i class="fa-solid fa-trash"></i></button>
                </div>
            @endif
        </div>
    @endforeach
</div>
@endif

@if ($folder && $folder->attachments->isNotEmpty())
<p class="text-xs font-semibold text-slate-400 uppercase mb-2">File</p>
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
    @foreach ($folder->attachments as $lampiran)
        <div class="group relative bg-white border rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition">
            @if ($bisaKelola)
                <input type="checkbox" class="cb-massal absolute top-2 left-2 w-4 h-4 opacity-0 group-hover:opacity-100 checked:opacity-100"
                       data-tipe="attachment" value="{{ $lampiran->id }}" onchange="perbaruiBarMassal()">
            @endif
            <div class="relative w-full">
                <div class="flex flex-col items-center gap-2 w-full">
                    <i class="fa-solid fa-file text-4xl text-slate-400"></i>
                    <span class="text-xs font-medium text-slate-700 break-words w-full">{{ $lampiran->original_name }}</span>
                    <span class="inline-block text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">File</span>
                </div>
                <a href="{{ route('attachment.preview', $lampiran) }}" target="_blank"
                   class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-white/80 rounded-lg"
                   title="Lihat file">
                    <i class="fa-solid fa-eye text-2xl text-slate-700"></i>
                </a>
            </div>
            @if ($bisaKelola)
                <div class="absolute top-2 right-2 hidden group-hover:flex gap-1">
                    <button onclick="bukaRenameLampiran({{ $lampiran->id }}, '{{ addslashes($lampiran->original_name) }}')" class="text-slate-400 hover:text-blue-600 text-xs"><i class="fa-solid fa-pen"></i></button>
                    <a href="{{ route('attachment.download', $lampiran) }}" class="text-slate-400 hover:text-emerald-600 text-xs"><i class="fa-solid fa-download"></i></a>
                    <button onclick="hapusSatu('/lampiran/', {{ $lampiran->id }})" class="text-slate-400 hover:text-rose-600 text-xs"><i class="fa-solid fa-trash"></i></button>
                </div>
            @endif
        </div>
    @endforeach
</div>
@endif

@if ($subfolder->isEmpty() && $items->isEmpty() && (!$folder || $folder->attachments->isEmpty()))
    <div class="text-center text-slate-400 py-16 border rounded-xl bg-white">
        <i class="fa-regular fa-folder-open text-4xl mb-2"></i>
        <p class="text-sm">Belum ada apa-apa di sini. Klik <strong>+ Tambah</strong> untuk mulai.</p>
    </div>
@endif

<!-- Modal: Folder Baru -->
<div id="modal-folder" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-80">
        <p class="font-semibold mb-3">Buat Folder Baru</p>
        <form action="{{ route('folder.store', ['modul' => $modul, 'folder' => $folder?->id]) }}" method="POST">
            @csrf
            <input type="text" name="nama" required placeholder="Contoh: Tahun 2026" class="w-full rounded-lg border-slate-300 mb-4">
            <div class="flex gap-2 justify-end">
                <button type="button" onclick="document.getElementById('modal-folder').classList.add('hidden')" class="px-4 py-2 bg-slate-100 rounded-lg text-sm">Batal</button>
                <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Simpan</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal: Rename Folder -->
<div id="modal-rename-folder" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-80">
        <p class="font-semibold mb-3">Ubah Nama Folder</p>
        <form id="form-rename-folder" method="POST">
            @csrf @method('PUT')
            <input type="text" name="nama" id="rename-folder-input" required class="w-full rounded-lg border-slate-300 mb-4">
            <div class="flex gap-2 justify-end">
                <button type="button" onclick="document.getElementById('modal-rename-folder').classList.add('hidden')" class="px-4 py-2 bg-slate-100 rounded-lg text-sm">Batal</button>
                <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Simpan</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal: Rename Lampiran -->
<div id="modal-rename-lampiran" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-80">
        <p class="font-semibold mb-3">Ubah Nama File</p>
        <form id="form-rename-lampiran" method="POST">
            @csrf @method('PUT')
            <input type="text" name="original_name" id="rename-lampiran-input" required class="w-full rounded-lg border-slate-300 mb-4">
            <div class="flex gap-2 justify-end">
                <button type="button" onclick="document.getElementById('modal-rename-lampiran').classList.add('hidden')" class="px-4 py-2 bg-slate-100 rounded-lg text-sm">Batal</button>
                <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Simpan</button>
            </div>
        </form>
    </div>
</div>

<form id="form-hapus-satu" method="POST" class="hidden">
    @csrf @method('DELETE')
</form>
<form id="form-hapus-massal" method="POST"
      action="{{ route('folder.bulkDestroy', ['modul' => $modul, 'folder' => $folder?->id]) }}" class="hidden">
    @csrf
</form>

@if ($folder)
<div id="modal-upload" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-80">
        <p class="font-semibold mb-3">Unggah File</p>
        <form action="{{ route('folder.upload', $folder) }}" method="POST" enctype="multipart/form-data">
            @csrf
            <input type="file" name="file" required class="w-full text-sm mb-2">
            <p class="text-xs text-slate-400 mb-4">PDF/JPG/PNG/XLSX/DOCX, maks 5MB.</p>
            <div class="flex gap-2 justify-end">
                <button type="button" onclick="document.getElementById('modal-upload').classList.add('hidden')" class="px-4 py-2 bg-slate-100 rounded-lg text-sm">Batal</button>
                <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Unggah</button>
            </div>
        </form>
    </div>
</div>

<div id="modal-import" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-96">
        <p class="font-semibold mb-1">Import Data dari Excel</p>
        <p class="text-xs text-slate-400 mb-3">Gunakan template yang sesuai kolomnya agar tidak gagal diimpor.</p>
        <form action="{{ route('import.store', ['modul' => $modul, 'folder' => $folder->id]) }}" method="POST" enctype="multipart/form-data">
            @csrf
            <input type="file" name="file" required accept=".xlsx,.xls,.csv" class="w-full text-sm mb-4">
            <div class="flex gap-2 justify-end">
                <button type="button" onclick="document.getElementById('modal-import').classList.add('hidden')" class="px-4 py-2 bg-slate-100 rounded-lg text-sm">Batal</button>
                <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Import</button>
            </div>
        </form>
    </div>
</div>
@endif

<script>
document.addEventListener('click', function (e) {
    ['menu-tambah', 'menu-lainnya'].forEach(id => {
        const menu = document.getElementById(id);
        if (menu && !menu.contains(e.target) && !e.target.closest('button')?.getAttribute('onclick')?.includes(id)) {
            menu.classList.add('hidden');
        }
    });
});

function bukaRenameFolder(id, namaLama) {
    document.getElementById('rename-folder-input').value = namaLama;
    document.getElementById('form-rename-folder').action = '/folder/' + id + '/rename';
    document.getElementById('modal-rename-folder').classList.remove('hidden');
}

function bukaRenameLampiran(id, namaLama) {
    document.getElementById('rename-lampiran-input').value = namaLama;
    document.getElementById('form-rename-lampiran').action = '/lampiran/' + id + '/rename';
    document.getElementById('modal-rename-lampiran').classList.remove('hidden');
}

function hapusSatu(prefixUrl, id) {
    if (!confirm('Yakin ingin menghapus item ini?')) return;
    const form = document.getElementById('form-hapus-satu');
    form.action = prefixUrl + id;
    form.submit();
}

function perbaruiBarMassal() {
    const dicentang = document.querySelectorAll('.cb-massal:checked');
    const bar = document.getElementById('bar-massal');
    if (!bar) return;
    document.getElementById('jumlah-terpilih').textContent = dicentang.length;
    bar.classList.toggle('hidden', dicentang.length === 0);
}

function batalkanPilihan() {
    document.querySelectorAll('.cb-massal:checked').forEach(cb => cb.checked = false);
    perbaruiBarMassal();
}

function hapusMassal() {
    const dicentang = document.querySelectorAll('.cb-massal:checked');
    if (dicentang.length === 0) return;
    if (!confirm(`Yakin ingin menghapus ${dicentang.length} item terpilih?`)) return;

    const form = document.getElementById('form-hapus-massal');
    form.querySelectorAll('input[type=hidden].massal-input').forEach(el => el.remove());

    dicentang.forEach(cb => {
        const tipe = cb.dataset.tipe;
        const namaField = tipe === 'folder' ? 'folder_ids[]' : (tipe === 'item' ? 'item_ids[]' : 'attachment_ids[]');
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = namaField;
        input.value = cb.value;
        input.classList.add('massal-input');
        form.appendChild(input);
    });

    form.submit();
}
</script>
@endsection
