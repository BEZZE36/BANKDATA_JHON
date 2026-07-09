<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Keuangan extends Model
{
    use SoftDeletes;

    protected $table = 'keuangan';

    protected $fillable = [
        'folder_id', 'no_transaksi', 'jenis', 'nominal', 'program_id', 'tanggal',
        'keterangan', 'bukti_path', 'created_by', 'updated_by',
    ];

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    protected $casts = [
        'tanggal' => 'date',
        'nominal' => 'decimal:2',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}
