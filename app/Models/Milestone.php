<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Milestone extends Model
{
    protected $fillable = [
        'project_id',
        'title',
        'description',
        'due_date',
        'sort_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
        ];
    }

    // ── Relationships ───────────────────────────────────

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    // ── Accessors ───────────────────────────────────────

    /**
     * Calculate milestone progress based on its tasks
     */
    public function getProgressPercentageAttribute(): float
    {
        $tasks = $this->tasks;

        if ($tasks->isEmpty()) {
            return 0;
        }

        $totalWeight = $tasks->sum('weight');
        if ($totalWeight === 0) return 0;

        $weightedProgress = $tasks->sum(function ($task) {
            return $task->progress * $task->weight;
        });

        return round($weightedProgress / $totalWeight, 1);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Menunggu',
            'in_progress' => 'Berjalan',
            'completed' => 'Selesai',
            default => 'Unknown',
        };
    }

    /**
     * Automatically synchronize milestone status based on its tasks' progress and status
     */
    public function syncStatusFromTasks(): void
    {
        $tasks = $this->tasks()->get();

        if ($tasks->isEmpty()) {
            return;
        }

        $allCompleted = $tasks->every(fn ($t) => $t->status === 'completed' || $t->progress >= 100);
        $anyStarted = $tasks->contains(fn ($t) => $t->progress > 0 || in_array($t->status, ['in_progress', 'review', 'completed']));

        $newStatus = 'pending';
        if ($allCompleted) {
            $newStatus = 'completed';
        } elseif ($anyStarted) {
            $newStatus = 'in_progress';
        }

        if ($this->status !== $newStatus) {
            $this->update(['status' => $newStatus]);
        }
    }
}
