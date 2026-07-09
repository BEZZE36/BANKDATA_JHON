<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Folder extends Model
{
    use SoftDeletes;

    protected $fillable = ['modul', 'parent_id', 'nama', 'created_by', 'updated_by'];

    public function parent()
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Folder::class, 'parent_id')->orderBy('nama');
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    /**
     * Ambil query builder ke tabel data sesuai modul folder ini
     * (pegawai / program / aset / keuangan), dipakai FolderController
     * supaya tidak perlu 4 method index terpisah.
     */
    public function itemQuery()
    {
        return match ($this->modul) {
            'kepegawaian' => Pegawai::where('folder_id', $this->id),
            'program' => Program::where('folder_id', $this->id),
            'aset' => Aset::where('folder_id', $this->id),
            'keuangan' => Keuangan::where('folder_id', $this->id),
        };
    }

    /**
     * Jejak breadcrumb dari root sampai folder ini, dipakai untuk
     * navigasi "Data Kepegawaian > Tahun 2021 > Sekretariat Daerah".
     */
    public function breadcrumb(): array
    {
        $trail = [];
        $node = $this;
        while ($node) {
            array_unshift($trail, $node);
            $node = $node->parent;
        }
        return $trail;
    }
}
