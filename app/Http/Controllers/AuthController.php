<?php

namespace App\Http\Controllers;

use App\Models\CompanyGroup;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|string|min:8|confirmed',
            'group_code' => 'nullable|string|max:255',
        ]);

        $companyGroupId = null;

        if (!empty(trim($validated['group_code'] ?? ''))) {
            $normalizedCode = strtoupper(trim($validated['group_code']));
            $group = CompanyGroup::where('group_code', $normalizedCode)->first();

            if (!$group) {
                throw ValidationException::withMessages([
                    'group_code' => 'Kode ID Grup tidak ditemukan. Periksa kembali kode grup perusahaan Anda.',
                ]);
            }

            $companyGroupId = $group->id;
        }

        $user = User::create([
            'name'             => $validated['name'],
            'email'            => $validated['email'],
            'password'         => Hash::make($validated['password']),
            'role'             => 'member',
            'company_group_id' => $companyGroupId,
        ]);

        return redirect()->route('login')
            ->with('success', 'Pendaftaran berhasil! Silakan masuk menggunakan email dan password Anda.');
    }
}
