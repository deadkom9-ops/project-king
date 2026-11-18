<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    protected $fillable = [
        'company_group_id',
        'name',
        'code',
        'parent_id',
        'head_id',
        'level',
        'description',
    ];

    // ── Relationships ───────────────────────────────────

    public function companyGroup(): BelongsTo
    {
        return $this->belongsTo(CompanyGroup::class, 'company_group_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Unit::class, 'parent_id');
    }

    /**
     * Recursively get all descendant units
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    public function head(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(User::class, 'unit_id');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'unit_id');
    }

    // ── Helpers ─────────────────────────────────────────

    /**
     * Check if this unit is under (or equal to) the given unit
     */
    public function isUnder(?int $ancestorUnitId): bool
    {
        if (!$ancestorUnitId) return false;
        if ($this->id === $ancestorUnitId) return true;

        $current = $this;
        while ($current->parent_id) {
            if ($current->parent_id === $ancestorUnitId) {
                return true;
            }
            $current = $current->parent;
            if (!$current) break;
        }

        return false;
    }

    /**
     * Get all descendant unit IDs (flat array)
     */
    public function getAllDescendantIds(): array
    {
        $ids = [$this->id];

        foreach ($this->children as $child) {
            $ids = array_merge($ids, $child->getAllDescendantIds());
        }

        return $ids;
    }
}
