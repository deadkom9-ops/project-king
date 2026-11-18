<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressUpdate extends Model
{
    protected $fillable = [
        'task_id',
        'submitted_by',
        'percentage',
        'notes',
        'file_path',
        'file_name',
        'approval_status',
        'approved_by',
        'rejection_reason',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'percentage' => 'integer',
            'approved_at' => 'datetime',
        ];
    }

    // ── Relationships ───────────────────────────────────

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ── Accessors ───────────────────────────────────────

    public function getStatusLabelAttribute(): string
    {
        return match ($this->approval_status) {
            'pending' => 'Menunggu Approval',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'revision' => 'Perlu Revisi',
            default => 'Unknown',
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->approval_status) {
            'pending' => 'yellow',
            'approved' => 'green',
            'rejected' => 'red',
            'revision' => 'orange',
            default => 'gray',
        };
    }

    /**
     * Check if this progress update has an attached file
     */
    public function hasFile(): bool
    {
        return !empty($this->file_path);
    }

    /**
     * Get the full URL for the attached file
     */
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) return null;

        return asset('storage/' . $this->file_path);
    }

    // ── Scopes ──────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopeNeedsRevision($query)
    {
        return $query->where('approval_status', 'revision');
    }
}
