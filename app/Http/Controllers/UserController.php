<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $authUser = auth()->user();

        $users = User::with(['unit', 'companyGroup'])
            ->when($authUser->company_group_id, function ($q) use ($authUser) {
                $q->where('company_group_id', $authUser->company_group_id);
            })
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->role, function ($q, $role) {
                $q->where('role', $role);
            })
            ->when($request->unit_id, function ($q, $unitId) {
                $q->where('unit_id', $unitId);
            })
            ->orderBy('name')
            ->paginate(15)
            ->through(fn($user) => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->role,
                'role_label' => $user->role_label,
                'unit'       => $user->unit ? [
                    'id'   => $user->unit->id,
                    'name' => $user->unit->name,
                ] : null,
                'company_group' => $user->companyGroup ? [
                    'id'         => $user->companyGroup->id,
                    'name'       => $user->companyGroup->name,
                    'group_code' => $user->companyGroup->group_code,
                ] : null,
                'created_at' => $user->created_at->format('d M Y'),
            ]);

        $units = $authUser->company_group_id
            ? Unit::where('company_group_id', $authUser->company_group_id)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'level', 'parent_id', 'description'])
            : collect([]);

        $roles = [
            ['value' => User::ROLE_ADMIN, 'label' => 'Administrator'],
            ['value' => User::ROLE_DIREKTUR, 'label' => 'Direktur'],
            ['value' => User::ROLE_WAKIL_DIREKTUR, 'label' => 'Wakil Direktur'],
            ['value' => User::ROLE_KEPALA_BIDANG, 'label' => 'Kepala Bidang'],
            ['value' => User::ROLE_KEPALA_UNIT, 'label' => 'Kepala Unit'],
            ['value' => User::ROLE_PROJECT_MANAGER, 'label' => 'Project Manager'],
            ['value' => User::ROLE_MEMBER, 'label' => 'Member'],
        ];

        return Inertia::render('Users/Index', [
            'users'   => $users,
            'units'   => $units,
            'roles'   => $roles,
            'filters' => $request->only(['search', 'role', 'unit_id']),
        ]);
    }

    public function store(Request $request)
    {
        $authUser = auth()->user();

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => ['required', Rule::in(array_keys(User::ROLE_HIERARCHY))],
            'unit_id'  => [
                'nullable',
                Rule::exists('units', 'id')->where('company_group_id', $authUser->company_group_id),
            ],
        ]);

        User::create([
            'name'             => $validated['name'],
            'email'            => $validated['email'],
            'password'         => Hash::make($validated['password']),
            'role'             => $validated['role'],
            'unit_id'          => $validated['unit_id'] ?? null,
            'company_group_id' => $authUser->company_group_id,
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $authUser = auth()->user();
        if ($authUser->company_group_id && $user->company_group_id !== $authUser->company_group_id) {
            abort(403, 'Anda tidak dapat mengubah user dari grup perusahaan lain.');
        }

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role'     => ['required', Rule::in(array_keys(User::ROLE_HIERARCHY))],
            'unit_id'  => [
                'nullable',
                Rule::exists('units', 'id')->where('company_group_id', $authUser->company_group_id),
            ],
        ]);

        $data = [
            'name'    => $validated['name'],
            'email'   => $validated['email'],
            'role'    => $validated['role'],
            'unit_id' => $validated['unit_id'] ?? null,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        return redirect()->route('users.index')
            ->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $authUser = auth()->user();
        if ($authUser->company_group_id && $user->company_group_id !== $authUser->company_group_id) {
            abort(403, 'Anda tidak dapat menghapus user dari grup perusahaan lain.');
        }

        if ($user->id === $authUser->id) {
            return back()->with('error', 'Tidak dapat menghapus akun sendiri.');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User berhasil dihapus.');
    }
}
