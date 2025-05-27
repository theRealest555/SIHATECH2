<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Speciality extends Model
{
    use HasFactory;
    protected $table = 'specialities';
    protected $fillable = ['nom', 'description'];

    public function doctors()
    {
        return $this->hasMany(Doctor::class);
    }
}
