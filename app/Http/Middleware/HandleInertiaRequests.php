<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        $user = $request->user()?->loadMissing('companyGroup');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'role_label' => $user->role_label,
                    'avatar' => $user->avatar,
                    'company_group_id' => $user->company_group_id,
                    'company_group' => $user->companyGroup ? [
                        'id' => $user->companyGroup->id,
                        'name' => $user->companyGroup->name,
                        'prefix_code' => $user->companyGroup->prefix_code,
                        'group_code' => $user->companyGroup->group_code,
                        'is_owner' => $user->companyGroup->owner_id === $user->id,
                    ] : null,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
