<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'created_by',
        'unit_id',
        'company_group_id',
        'start_date',
        'end_date',
        'status',
        'priority',
        'budget',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'budget' => 'decimal:2',
        ];
    }

    // ── Relationships ───────────────────────────────────

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function companyGroup(): BelongsTo
    {
        return $this->belongsTo(CompanyGroup::class, 'company_group_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->withPivot('role', 'created_at');
    }

    public function managers(): BelongsToMany
    {
        return $this->members()->wherePivot('role', 'manager');
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class)->orderBy('sort_order');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    // ── Accessors ───────────────────────────────────────

    /**
     * Calculate overall project progress based on weighted tasks
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

    /**
     * Get task statistics
     */
    public function getTaskStatsAttribute(): array
    {
        $tasks = $this->tasks;

        return [
            'total' => $tasks->count(),
            'todo' => $tasks->where('status', 'todo')->count(),
            'in_progress' => $tasks->where('status', 'in_progress')->count(),
            'review' => $tasks->where('status', 'review')->count(),
            'completed' => $tasks->where('status', 'completed')->count(),
        ];
    }

    /**
     * Get status label with color mapping
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'Draft',
            'active' => 'Aktif',
            'on_hold' => 'Ditunda',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => 'Unknown',
        };
    }

    /**
     * Get priority label
     */
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

    // ── Authorization Helpers ───────────────────────────

    /**
     * Check if user belongs to the same company group as this project
     */
    public function isAccessibleBy(User $user): bool
    {
        if ($this->company_group_id && $user->company_group_id !== $this->company_group_id) {
            return false;
        }

        return true;
    }

    /**
     * Check if user can manage (edit, add tasks/milestones, approve progress) this project
     */
    public function canBeManagedBy(User $user): bool
    {
        if (!$this->isAccessibleBy($user)) {
            return false;
        }

        return $user->isAdmin()
            || $user->hasRoleLevel(User::ROLE_PROJECT_MANAGER)
            || $this->created_by === $user->id
            || $this->members()->where('user_id', $user->id)->wherePivot('role', 'manager')->exists();
    }

    // ── Scopes ──────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForUnit($query, int $unitId)
    {
        return $query->where('unit_id', $unitId);
    }

    /**
     * Scope to filter projects visible to a user based on their company group and role
     */
    public function scopeVisibleTo($query, User $user)
    {
        // Strict Company Group isolation:
        // If user belongs to a company group, only show projects from that group.
        // If user has no company group yet, they can only see projects they created or are members of (with no group).
        if ($user->company_group_id) {
            $query->where('company_group_id', $user->company_group_id);
        } elseif (!$user->isAdmin()) {
            return $query->where('id', 0);
        }

        if ($user->isAdmin() || $user->isDirektur()) {
            return $query; // can see all within their company group
        }

        if ($user->isWakilDirektur() || $user->isKepalaBidang() || $user->isKepalaUnit()) {
            // Can see projects in their unit hierarchy within the group
            if ($user->unit_id) {
                $unit = Unit::with('children')->find($user->unit_id);
                if ($unit) {
                    $unitIds = $unit->getAllDescendantIds();
                    return $query->whereIn('unit_id', $unitIds);
                }
            }
            return $query;
        }

        // PM and Member: projects they created or are members of within their company group
        return $query->where(function ($sub) use ($user) {
            $sub->where('created_by', $user->id)
                ->orWhereHas('members', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                });
        });
    }
}
