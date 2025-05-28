<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class AuditLog extends Model
{
    use HasFactory;
    // MODIFIED LINE: Added 'metadata' to the $fillable array
    protected $fillable = ['user_id', 'action', 'target_type', 'target_id', 'metadata'];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }
}
