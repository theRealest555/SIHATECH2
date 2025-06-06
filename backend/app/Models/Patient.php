<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory; // Add this line

class Patient extends Model
{
    use HasFactory; // Add this line

    protected $fillable = ['user_id', 'medecin_favori_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function medecinFavori(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'medecin_favori_id');
    }

    public function rendezvous() {
        return $this->hasMany(Rendezvous::class);
    }
}
