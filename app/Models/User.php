<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'unit_id', 'company_group_id', 'avatar'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Role constants
     */
    const ROLE_ADMIN = 'admin';
    const ROLE_DIREKTUR = 'direktur';
    const ROLE_WAKIL_DIREKTUR = 'wakil_direktur';
    const ROLE_KEPALA_BIDANG = 'kepala_bidang';
    const ROLE_KEPALA_UNIT = 'kepala_unit';
    const ROLE_PROJECT_MANAGER = 'project_manager';
    const ROLE_MEMBER = 'member';

    /**
     * Role hierarchy (higher index = higher authority)
     */
    const ROLE_HIERARCHY = [
        self::ROLE_MEMBER => 0,
        self::ROLE_PROJECT_MANAGER => 1,
        self::ROLE_KEPALA_UNIT => 2,
        self::ROLE_KEPALA_BIDANG => 3,
        self::ROLE_WAKIL_DIREKTUR => 4,
        self::ROLE_DIREKTUR => 5,
        self::ROLE_ADMIN => 6,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ── Role Helpers ────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isDirektur(): bool
    {
        return $this->role === self::ROLE_DIREKTUR;
    }

    public function isWakilDirektur(): bool
    {
        return $this->role === self::ROLE_WAKIL_DIREKTUR;
    }

    public function isKepalaBidang(): bool
    {
        return $this->role === self::ROLE_KEPALA_BIDANG;
    }

    public function isKepalaUnit(): bool
    {
        return $this->role === self::ROLE_KEPALA_UNIT;
    }

    public function isProjectManager(): bool
    {
        return $this->role === self::ROLE_PROJECT_MANAGER;
    }

    public function isMember(): bool
    {
        return $this->role === self::ROLE_MEMBER;
    }

    /**
     * Check if user has at least the given role level
     */
    public function hasRoleLevel(string $role): bool
    {
        $userLevel = self::ROLE_HIERARCHY[$this->role] ?? 0;
        $requiredLevel = self::ROLE_HIERARCHY[$role] ?? 0;

        return $userLevel >= $requiredLevel;
    }

    /**
     * Check if user can monitor/view projects in a given unit
     */
    public function canMonitorUnit(int $unitId): bool
    {
        if ($this->isAdmin() || $this->isDirektur()) {
            return true;
        }

        if ($this->isWakilDirektur() || $this->isKepalaBidang() || $this->isKepalaUnit()) {
            // Check if the unit is in user's hierarchy
            $unit = Unit::find($unitId);
            if (!$unit) return false;

            return $unit->isUnder($this->unit_id);
        }

        return false;
    }

    // ── Relationships ───────────────────────────────────

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function companyGroup(): BelongsTo
    {
        return $this->belongsTo(CompanyGroup::class, 'company_group_id');
    }

    public function createdProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'created_by');
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function assignedTasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_assignees')
            ->withTimestamps();
    }

    public function progressUpdates(): HasMany
    {
        return $this->hasMany(ProgressUpdate::class, 'submitted_by');
    }

    /**
     * Get readable role name
     */
    public function getRoleLabelAttribute(): string
    {
        return match ($this->role) {
            self::ROLE_ADMIN => 'Administrator',
            self::ROLE_DIREKTUR => 'Direktur',
            self::ROLE_WAKIL_DIREKTUR => 'Wakil Direktur',
            self::ROLE_KEPALA_BIDANG => 'Kepala Bidang',
            self::ROLE_KEPALA_UNIT => 'Kepala Unit',
            self::ROLE_PROJECT_MANAGER => 'Project Manager',
            self::ROLE_MEMBER => 'Member',
            default => 'Unknown',
        };
    }
}

