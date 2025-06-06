<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Document extends Model
{
    use HasFactory;
    protected $fillable = [
        'doctor_id',
        'type',
        'file_path',
        'original_name',
        'status',
        'rejection_reason',
        'admin_id',
        'verified_at'
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
