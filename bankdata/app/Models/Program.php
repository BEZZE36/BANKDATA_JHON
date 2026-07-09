<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use SoftDeletes;

    protected $table = 'program';

    protected $fillable = [
        'folder_id', 'kode_program', 'nama_program', 'tahun_anggaran', 'unit_pelaksana',
        'target', 'realisasi', 'status', 'keterangan',
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

    public function transaksiKeuangan(): HasMany
    {
        return $this->hasMany(Keuangan::class, 'program_id');
    }

    public function getPersenCapaianAttribute(): float
    {
        if ((float) $this->target <= 0) return 0;
        return round(((float) $this->realisasi / (float) $this->target) * 100, 1);
    }

    public function scopeCari($query, ?string $keyword)
    {
        if (!$keyword) return $query;
        return $query->where(function ($q) use ($keyword) {
            $q->where('nama_program', 'like', "%{$keyword}%")
              ->orWhere('kode_program', 'like', "%{$keyword}%");
        });
    }
}
