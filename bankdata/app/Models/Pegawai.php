<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Pegawai extends Model
{
    use SoftDeletes;

    protected $table = 'pegawai';

    protected $fillable = [
        'folder_id', 'nip', 'nama', 'jabatan', 'golongan', 'unit_kerja',
        'pendidikan_terakhir', 'tmt_jabatan', 'status',
        'created_by', 'updated_by',
    ];

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    protected $casts = [
        'tmt_jabatan' => 'date',
    ];

    public function pembuat()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function pengubah()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    public function scopeCari($query, ?string $keyword)
    {
        if (!$keyword) return $query;

        return $query->where(function ($q) use ($keyword) {
            $q->where('nama', 'like', "%{$keyword}%")
              ->orWhere('nip', 'like', "%{$keyword}%")
              ->orWhere('unit_kerja', 'like', "%{$keyword}%");
        });
    }
}
