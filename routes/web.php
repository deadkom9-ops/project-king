<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyGroupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ── Guest Routes ────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// ── Authenticated Routes ────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Company Groups (Workspace Create & Join)
    Route::post('/company-groups', [CompanyGroupController::class, 'store'])->name('company-groups.store');
    Route::post('/company-groups/join', [CompanyGroupController::class, 'join'])->name('company-groups.join');

    // Projects
    Route::resource('projects', ProjectController::class);
    Route::post('/projects/{project}/members', [ProjectController::class, 'addMember'])->name('projects.members.add');
    Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember'])->name('projects.members.remove');

    // Milestones (nested under projects)
    Route::post('/projects/{project}/milestones', [MilestoneController::class, 'store'])->name('milestones.store');
    Route::put('/projects/{project}/milestones/{milestone}', [MilestoneController::class, 'update'])->name('milestones.update');
    Route::delete('/projects/{project}/milestones/{milestone}', [MilestoneController::class, 'destroy'])->name('milestones.destroy');

    // Tasks (nested under projects)
    Route::post('/projects/{project}/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('/projects/{project}/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/projects/{project}/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::post('/projects/{project}/tasks/{task}/assign', [TaskController::class, 'assign'])->name('tasks.assign');
    Route::delete('/projects/{project}/tasks/{task}/unassign/{user}', [TaskController::class, 'unassign'])->name('tasks.unassign');

    // Progress
    Route::post('/projects/{project}/tasks/{task}/progress', [ProgressController::class, 'store'])->name('progress.store');
    Route::post('/progress/{progress}/approve', [ProgressController::class, 'approve'])->name('progress.approve');
    Route::post('/progress/{progress}/reject', [ProgressController::class, 'reject'])->name('progress.reject');
    Route::post('/progress/{progress}/revision', [ProgressController::class, 'revision'])->name('progress.revision');

    // Approvals page
    Route::get('/approvals', [ProgressController::class, 'approvals'])->name('approvals.index');

    // Notifications (API)
    Route::get('/api/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/api/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/api/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // ── Admin / Group Owner: User & Unit Management ──────
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        Route::post('/units', [UnitController::class, 'store'])->name('units.store');
        Route::put('/units/{unit}', [UnitController::class, 'update'])->name('units.update');
        Route::delete('/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');
    });
});
