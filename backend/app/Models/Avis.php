<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory; // Add this line

class Avis extends Model
{
    use HasFactory; // Add this line

    protected $table = 'reviews'; // Correct table name from migration

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_id', // Corrected from rendezvous_id to match migration
        'rating',
        'comment',
        'status',
        'moderated_at',
        'moderated_by'
    ];

    protected $casts = [
        'moderated_at' => 'datetime',
        'rating' => 'integer'
    ];

    /**
     * Get the patient (user) who wrote the review
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the doctor (user) being reviewed
     */
    public function doctor(): BelongsTo
    {
        // Assuming doctor_id in reviews table refers to the user_id of the doctor
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the appointment this review is for
     */
    public function appointment(): BelongsTo
    {
        // Corrected foreign key to match migration: rendezvous_id
        return $this->belongsTo(Rendezvous::class, 'rendezvous_id');
    }

    /**
     * Get the admin who moderated this review
     */
    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    /**
     * Check if review is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if review is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if review is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Scope for approved reviews
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for pending reviews
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for rejected reviews
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope for reviews by rating
     */
    public function scopeByRating($query, int $rating)
    {
        return $query->where('rating', $rating);
    }
}
