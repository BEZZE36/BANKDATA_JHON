<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Aset extends Model
{
    use SoftDeletes;

    protected $table = 'aset';

    protected $fillable = [
        'folder_id', 'kode_aset', 'nama_aset', 'kategori', 'lokasi', 'kondisi',
        'tahun_perolehan', 'nilai_perolehan', 'foto_path',
        'created_by', 'updated_by',
    ];

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    public function scopeCari($query, ?string $keyword)
    {
        if (!$keyword) return $query;
        return $query->where(function ($q) use ($keyword) {
            $q->where('nama_aset', 'like', "%{$keyword}%")
              ->orWhere('kode_aset', 'like', "%{$keyword}%")
              ->orWhere('lokasi', 'like', "%{$keyword}%");
        });
    }
}
