<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $projects = Project::visibleTo($user)
            ->with(['creator', 'unit', 'members'])
            ->withCount('tasks')
            ->when($request->search, function ($q, $search) {
                $q->where('title', 'like', "%{$search}%");
            })
            ->when($request->status, function ($q, $status) {
                $q->where('status', $status);
            })
            ->when($request->priority, function ($q, $priority) {
                $q->where('priority', $priority);
            })
            ->orderByDesc('updated_at')
            ->paginate(12)
            ->through(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                    'status' => $project->status,
                    'status_label' => $project->status_label,
                    'priority' => $project->priority,
                    'priority_label' => $project->priority_label,
                    'progress' => $project->progress_percentage,
                    'start_date' => $project->start_date?->format('Y-m-d'),
                    'end_date' => $project->end_date?->format('Y-m-d'),
                    'creator' => $project->creator?->name,
                    'unit' => $project->unit?->name,
                    'members_count' => $project->members->count(),
                    'tasks_count' => $project->tasks_count,
                    'task_stats' => $project->task_stats,
                ];
            });

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'status', 'priority']),
        ]);
    }

    public function create()
    {
        $user = Auth::user();

        if (!$user->company_group_id) {
            return redirect()->route('dashboard')
                ->with('error', 'Silakan buat atau gabung Grup Perusahaan terlebih dahulu sebelum membuat project.');
        }

        $users = $this->getGroupUsers($user);

        return Inertia::render('Projects/Create', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user->company_group_id) {
            return redirect()->route('dashboard')
                ->with('error', 'Anda harus tergabung dalam Grup Perusahaan untuk membuat project.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:draft,active,on_hold,completed,cancelled',
            'priority' => 'required|in:low,medium,high,critical',
            'budget' => 'nullable|numeric|min:0',
            'members' => 'nullable|array',
            'members.*' => [
                'required',
                Rule::exists('users', 'id')->where(function ($query) use ($user) {
                    $query->where('company_group_id', $user->company_group_id);
                }),
            ],
        ], [
            'members.*.exists' => 'User yang dipilih tidak berasal dari grup perusahaan Anda.',
        ]);

        $project = Project::create([
            ...$validated,
            'created_by' => $user->id,
            'unit_id' => $user->unit_id,
            'company_group_id' => $user->company_group_id,
        ]);

        // Add creator as manager
        $project->members()->attach($user->id, ['role' => 'manager']);

        // Add additional members
        if (!empty($validated['members'])) {
            foreach ($validated['members'] as $memberId) {
                if ((int) $memberId !== $user->id) {
                    $project->members()->attach($memberId, ['role' => 'member']);
                }
            }
        }

        return redirect()->route('projects.show', $project)
            ->with('success', 'Project berhasil dibuat.');
    }

    public function show(Project $project)
    {
        $this->authorizeGroupAccess($project);

        $project->load([
            'creator',
            'unit',
            'companyGroup',
            'members',
            'milestones.tasks.assignees',
            'milestones.tasks.progressUpdates' => function ($q) {
                $q->with(['approver', 'submitter'])->orderByDesc('created_at');
            },
            'tasks.assignees',
            'tasks.progressUpdates' => function ($q) {
                $q->with(['approver', 'submitter'])->orderByDesc('created_at');
            },
        ]);

        $projectData = [
            'id' => $project->id,
            'title' => $project->title,
            'description' => $project->description,
            'status' => $project->status,
            'status_label' => $project->status_label,
            'priority' => $project->priority,
            'priority_label' => $project->priority_label,
            'progress' => $project->progress_percentage,
            'budget' => $project->budget,
            'start_date' => $project->start_date?->format('Y-m-d'),
            'end_date' => $project->end_date?->format('Y-m-d'),
            'creator' => [
                'id' => $project->creator->id,
                'name' => $project->creator->name,
            ],
            'unit' => $project->unit ? [
                'id' => $project->unit->id,
                'name' => $project->unit->name,
            ] : null,
            'company_group' => $project->companyGroup ? [
                'id' => $project->companyGroup->id,
                'name' => $project->companyGroup->name,
                'group_code' => $project->companyGroup->group_code,
            ] : null,
            'members' => $project->members->map(fn($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'role' => $m->pivot->role,
                'role_label' => $m->role_label,
            ]),
            'milestones' => $project->milestones->map(fn($ms) => [
                'id' => $ms->id,
                'title' => $ms->title,
                'description' => $ms->description,
                'due_date' => $ms->due_date?->format('Y-m-d'),
                'status' => $ms->status,
                'status_label' => $ms->status_label,
                'progress' => $ms->progress_percentage,
                'tasks' => $ms->tasks->map(fn($t) => $this->formatTask($t)),
            ]),
            'tasks' => $project->tasks->map(fn($t) => $this->formatTask($t)),
            'task_stats' => $project->task_stats,
        ];

        $users = $this->getGroupUsers(Auth::user(), $project->company_group_id);

        return Inertia::render('Projects/Show', [
            'project' => $projectData,
            'users' => $users,
            'canManage' => Auth::user()->isAdmin()
                || Auth::user()->isProjectManager()
                || $project->created_by === Auth::id()
                || $project->members()->where('user_id', Auth::id())->wherePivot('role', 'manager')->exists(),
        ]);
    }

    public function edit(Project $project)
    {
        $this->authorizeGroupAccess($project);

        $users = $this->getGroupUsers(Auth::user(), $project->company_group_id);

        return Inertia::render('Projects/Edit', [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'start_date' => $project->start_date?->format('Y-m-d'),
                'end_date' => $project->end_date?->format('Y-m-d'),
                'status' => $project->status,
                'priority' => $project->priority,
                'budget' => $project->budget,
                'members' => $project->members->pluck('id'),
            ],
            'users' => $users,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorizeGroupAccess($project);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:draft,active,on_hold,completed,cancelled',
            'priority' => 'required|in:low,medium,high,critical',
            'budget' => 'nullable|numeric|min:0',
        ]);

        $project->update($validated);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Project berhasil diperbarui.');
    }

    public function destroy(Project $project)
    {
        $this->authorizeGroupAccess($project);

        $user = auth()->user();
        if (!in_array($user->role, ['project_manager', 'kepala_unit', 'admin']) && $project->created_by !== $user->id) {
            abort(403, 'Anda tidak memiliki hak akses untuk menghapus project ini.');
        }

        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Project berhasil dihapus.');
    }

    /**
     * Add a member to project (must belong to the same company group)
     */
    public function addMember(Request $request, Project $project)
    {
        $this->authorizeGroupAccess($project);

        $targetGroupId = $project->company_group_id ?? Auth::user()->company_group_id;

        $validated = $request->validate([
            'user_id' => [
                'required',
                Rule::exists('users', 'id')->where(function ($query) use ($targetGroupId) {
                    $query->where('company_group_id', $targetGroupId);
                }),
            ],
            'role' => 'required|in:manager,member',
        ], [
            'user_id.exists' => 'User yang dipilih tidak berada dalam grup perusahaan yang sama.',
        ]);

        $project->members()->syncWithoutDetaching([
            $validated['user_id'] => ['role' => $validated['role']],
        ]);

        return back()->with('success', 'Member berhasil ditambahkan.');
    }

    /**
     * Remove a member from project
     */
    public function removeMember(Project $project, User $user)
    {
        $this->authorizeGroupAccess($project);

        $project->members()->detach($user->id);

        return back()->with('success', 'Member berhasil dihapus.');
    }

    // ── Helpers ─────────────────────────────────────────

    /**
     * Get users strictly within the same company group
     */
    private function getGroupUsers(User $authUser, ?int $groupId = null)
    {
        $targetGroupId = $groupId ?? $authUser->company_group_id;

        if (!$targetGroupId) {
            return collect([]);
        }

        return User::where('company_group_id', $targetGroupId)
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();
    }

    /**
     * Ensure user belongs to the same company group as the project
     */
    private function authorizeGroupAccess(Project $project): void
    {
        $user = Auth::user();

        if ($project->company_group_id && $user->company_group_id !== $project->company_group_id) {
            abort(403, 'Akses ditolak. Project ini milik grup perusahaan lain.');
        }
    }

    private function formatTask($task): array
    {
        $latestProgress = $task->progressUpdates->first();

        return [
            'id' => $task->id,
            'milestone_id' => $task->milestone_id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'status_label' => $task->status_label,
            'priority' => $task->priority,
            'priority_label' => $task->priority_label,
            'weight' => $task->weight,
            'progress' => $task->progress,
            'due_date' => $task->due_date?->format('Y-m-d'),
            'assignees' => $task->assignees->map(fn($a) => [
                'id' => $a->id,
                'name' => $a->name,
            ]),
            'has_pending_progress' => $task->progressUpdates->where('approval_status', 'pending')->isNotEmpty(),
            'latest_revision' => ($rev = $task->progressUpdates->where('approval_status', 'revision')->first()) ? [
                'id' => $rev->id,
                'percentage' => $rev->percentage,
                'rejection_reason' => $rev->rejection_reason,
                'approver_name' => $rev->approver?->name,
                'created_at' => $rev->created_at->diffForHumans(),
                'updated_at' => $rev->updated_at->diffForHumans(),
            ] : null,
            'latest_progress' => $latestProgress ? [
                'id' => $latestProgress->id,
                'percentage' => $latestProgress->percentage,
                'notes' => $latestProgress->notes,
                'file_name' => $latestProgress->file_name,
                'file_url' => $latestProgress->file_url,
                'submitter_name' => $latestProgress->submitter?->name,
                'approval_status' => $latestProgress->approval_status,
                'rejection_reason' => $latestProgress->rejection_reason,
                'created_at' => $latestProgress->created_at->diffForHumans(),
            ] : null,
        ];
    }
}

