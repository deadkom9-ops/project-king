<?php

namespace App\Http\Controllers;

use App\Models\CompanyGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyGroupController extends Controller
{
    /**
     * Create a new company group (workspace) and assign the authenticated user to it.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->company_group_id) {
            return back()->with('error', 'Anda sudah tergabung dalam grup perusahaan dan tidak dapat membuat grup baru.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ], [
            'name.required' => 'Nama grup/perusahaan wajib diisi.',
        ]);

        $codes = CompanyGroup::generateCodes($validated['name']);

        $group = CompanyGroup::create([
            'name'        => $validated['name'],
            'prefix_code' => $codes['prefix_code'],
            'group_code'  => $codes['group_code'],
            'owner_id'    => $user->id,
        ]);

        // Set user's company_group_id and elevate group creator to admin of their group
        $updateData = ['company_group_id' => $group->id];
        if ($user->role === 'member') {
            $updateData['role'] = 'admin';
        }
        $user->update($updateData);

        return back()->with('success', "Grup \"{$group->name}\" berhasil dibuat dengan kode ID: {$group->group_code}");
    }

    /**
     * Join an existing company group using its unique group_code (NAMA-GRUP-KODEPREFIX).
     */
    public function join(Request $request)
    {
        $user = Auth::user();

        if ($user->company_group_id) {
            return back()->with('error', 'Anda sudah tergabung dalam grup perusahaan.');
        }

        $validated = $request->validate([
            'group_code' => 'required|string|max:255',
        ], [
            'group_code.required' => 'Kode ID Grup wajib diisi.',
        ]);

        $normalizedCode = strtoupper(trim($validated['group_code']));
        $group = CompanyGroup::where('group_code', $normalizedCode)->first();

        if (!$group) {
            return back()->withErrors([
                'group_code' => 'Kode ID Grup tidak ditemukan. Pastikan format kode sesuai (contoh: NAMA-GRUP-A1B2C3).',
            ]);
        }

        $user->update([
            'company_group_id' => $group->id,
        ]);

        return back()->with('success', "Berhasil bergabung ke grup \"{$group->name}\" ({$group->group_code}).");
    }
}
