<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Task extends Model
{
    protected $fillable = [
        'project_id',
        'milestone_id',
        'title',
        'description',
        'status',
        'priority',
        'weight',
        'progress',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'weight' => 'integer',
            'progress' => 'integer',
        ];
    }

    // ── Relationships ───────────────────────────────────

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(Milestone::class);
    }

    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_assignees')
            ->withPivot('created_at');
    }

    public function progressUpdates(): HasMany
    {
        return $this->hasMany(ProgressUpdate::class)->orderByDesc('created_at');
    }

    public function latestApprovedProgress(): HasOne
    {
        return $this->hasOne(ProgressUpdate::class)
            ->where('approval_status', 'approved')
            ->orderByDesc('approved_at');
    }

    public function pendingProgress(): HasMany
    {
        return $this->hasMany(ProgressUpdate::class)
            ->where('approval_status', 'pending');
    }

    // ── Accessors ───────────────────────────────────────

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'todo' => 'To Do',
            'in_progress' => 'Dalam Proses',
            'review' => 'Menunggu Review',
            'completed' => 'Selesai',
            default => 'Unknown',
        };
    }

    public function getPriorityLabelAttribute(): string
    {
        return match ($this->priority) {
            'low' => 'Rendah',
            'medium' => 'Sedang',
            'high' => 'Tinggi',
            'critical' => 'Kritis',
            default => 'Unknown',
        };
    }

    // ── Scopes ──────────────────────────────────────────

    public function scopeForUser($query, User $user)
    {
        return $query->whereHas('assignees', function ($q) use ($user) {
            $q->where('users.id', $user->id);
        });
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
