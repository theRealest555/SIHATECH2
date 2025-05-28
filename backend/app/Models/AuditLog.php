<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class AuditLog extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'action', 'target_type', 'target_id'];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }
}
