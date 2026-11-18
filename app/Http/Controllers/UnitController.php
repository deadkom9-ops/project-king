<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UnitController extends Controller
{
    public function store(Request $request)
    {
        $authUser = auth()->user();

        if (!$authUser->company_group_id) {
            return back()->with('error', 'Anda harus tergabung dalam Grup Perusahaan terlebih dahulu.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|in:direktorat,bidang,unit',
            'parent_id' => [
                'nullable',
                Rule::exists('units', 'id')->where('company_group_id', $authUser->company_group_id),
            ],
            'description' => 'nullable|string|max:500',
        ]);

        $prefix = match ($validated['level']) {
            'direktorat' => 'DIR',
            'bidang' => 'BID',
            default => 'UNT',
        };

        $slug = strtoupper(Str::limit(Str::slug($validated['name'], ''), 6, ''));
        if (empty($slug)) {
            $slug = 'UNIT';
        }

        do {
            $code = "{$prefix}-{$slug}-" . strtoupper(Str::random(3));
        } while (
            Unit::where('company_group_id', $authUser->company_group_id)
                ->where('code', $code)
                ->exists()
        );

        Unit::create([
            'company_group_id' => $authUser->company_group_id,
            'name' => $validated['name'],
            'code' => $code,
            'level' => $validated['level'],
            'parent_id' => $validated['parent_id'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', "Unit \"{$validated['name']}\" berhasil ditambahkan.");
    }

    public function update(Request $request, Unit $unit)
    {
        $authUser = auth()->user();

        if ($unit->company_group_id !== $authUser->company_group_id) {
            abort(403, 'Anda tidak dapat mengubah unit dari grup perusahaan lain.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|in:direktorat,bidang,unit',
            'parent_id' => [
                'nullable',
                Rule::exists('units', 'id')
                    ->where('company_group_id', $authUser->company_group_id)
                    ->whereNot('id', $unit->id),
            ],
            'description' => 'nullable|string|max:500',
        ]);

        $unit->update([
            'name' => $validated['name'],
            'level' => $validated['level'],
            'parent_id' => $validated['parent_id'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', "Unit \"{$unit->name}\" berhasil diperbarui.");
    }

    public function destroy(Unit $unit)
    {
        $authUser = auth()->user();

        if ($unit->company_group_id !== $authUser->company_group_id) {
            abort(403, 'Anda tidak dapat menghapus unit dari grup perusahaan lain.');
        }

        $unit->delete();

        return back()->with('success', 'Unit berhasil dihapus.');
    }
}
