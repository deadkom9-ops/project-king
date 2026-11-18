<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CompanyGroup extends Model
{
    protected $fillable = [
        'name',
        'prefix_code',
        'group_code',
        'owner_id',
    ];

    // ── Relationships ───────────────────────────────────

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'company_group_id');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'company_group_id');
    }

    // ── Helpers ─────────────────────────────────────────

    /**
     * Generate unique 6-character alphanumeric code and full group_code: NAMA-GRUP-KODE6DIGIT
     */
    public static function generateCodes(string $name): array
    {
        $slugName = strtoupper(Str::slug($name, '-'));
        if (empty($slugName)) {
            $slugName = 'GRUP';
        }

        do {
            $prefixCode = strtoupper(Str::random(6));
            $groupCode = "{$slugName}-{$prefixCode}";
        } while (self::where('group_code', $groupCode)->exists());

        return [
            'prefix_code' => $prefixCode,
            'group_code'  => $groupCode,
        ];
    }
}
