<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function store(Request $request, Project $project)
    {
        if (!$project->canBeManagedBy(Auth::user())) {
            abort(403, 'Anda tidak memiliki hak akses untuk membuat task pada project ini.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'milestone_id' => [
                'nullable',
                Rule::exists('milestones', 'id')->where('project_id', $project->id),
            ],
            'status' => 'nullable|in:todo,in_progress,review,completed',
            'priority' => 'nullable|in:low,medium,high,critical',
            'weight' => 'nullable|integer|min:1',
            'due_date' => 'nullable|date',
            'assignees' => 'nullable|array',
            'assignees.*' => [
                'required',
                Rule::exists('users', 'id')->where(function ($q) use ($project) {
                    if ($project->company_group_id) {
                        $q->where('company_group_id', $project->company_group_id);
                    }
                }),
            ],
        ]);

        $status = $validated['status'] ?? 'todo';
        $progress = $status === 'completed' ? 100 : 0;

        $task = $project->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'milestone_id' => $validated['milestone_id'] ?? null,
            'status' => $status,
            'priority' => $validated['priority'] ?? 'medium',
            'weight' => $validated['weight'] ?? 1,
            'progress' => $progress,
            'due_date' => $validated['due_date'] ?? null,
        ]);

        if (!empty($validated['assignees'])) {
            $task->assignees()->attach($validated['assignees']);

            // Ensure all task assignees are also registered as project members
            foreach ($validated['assignees'] as $assigneeId) {
                if (!$project->members()->where('user_id', $assigneeId)->exists()) {
                    $project->members()->attach($assigneeId, ['role' => 'member']);
                }
            }
        }

        if ($task->milestone_id) {
            $task->milestone?->syncStatusFromTasks();
        }

        return back()->with('success', 'Task berhasil ditambahkan.');
    }

    public function update(Request $request, Project $project, Task $task)
    {
        if (!$project->canBeManagedBy(Auth::user()) || $task->project_id !== $project->id) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengubah task ini.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'milestone_id' => [
                'nullable',
                Rule::exists('milestones', 'id')->where('project_id', $project->id),
            ],
            'status' => 'required|in:todo,in_progress,review,completed',
            'priority' => 'required|in:low,medium,high,critical',
            'weight' => 'required|integer|min:1',
            'due_date' => 'nullable|date',
            'assignees' => 'nullable|array',
            'assignees.*' => [
                'required',
                Rule::exists('users', 'id')->where(function ($q) use ($project) {
                    if ($project->company_group_id) {
                        $q->where('company_group_id', $project->company_group_id);
                    }
                }),
            ],
        ]);

        $oldMilestoneId = $task->milestone_id;

        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'milestone_id' => $validated['milestone_id'] ?? null,
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'weight' => $validated['weight'],
            'due_date' => $validated['due_date'] ?? null,
        ];

        if ($validated['status'] === 'completed') {
            $updateData['progress'] = 100;
        } elseif ($validated['status'] === 'todo') {
            $updateData['progress'] = 0;
        }

        $task->update($updateData);

        if (array_key_exists('assignees', $validated)) {
            $assignees = $validated['assignees'] ?? [];
            $task->assignees()->sync($assignees);

            foreach ($assignees as $assigneeId) {
                if (!$project->members()->where('user_id', $assigneeId)->exists()) {
                    $project->members()->attach($assigneeId, ['role' => 'member']);
                }
            }
        }

        if ($oldMilestoneId && $oldMilestoneId !== $task->milestone_id) {
            Milestone::find($oldMilestoneId)?->syncStatusFromTasks();
        }
        if ($task->milestone_id) {
            $task->milestone()->first()?->syncStatusFromTasks();
        }

        return back()->with('success', 'Task berhasil diperbarui.');
    }

    public function destroy(Project $project, Task $task)
    {
        if (!$project->canBeManagedBy(Auth::user()) || $task->project_id !== $project->id) {
            abort(403, 'Anda tidak memiliki hak akses untuk menghapus task ini.');
        }

        $milestone = $task->milestone;
        $task->delete();

        if ($milestone) {
            $milestone->syncStatusFromTasks();
        }

        return back()->with('success', 'Task berhasil dihapus.');
    }

    /**
     * Assign user(s) to a task
     */
    public function assign(Request $request, Project $project, Task $task)
    {
        if (!$project->canBeManagedBy(Auth::user()) || $task->project_id !== $project->id) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola assignee.');
        }

        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => [
                'required',
                Rule::exists('users', 'id')->where(function ($q) use ($project) {
                    if ($project->company_group_id) {
                        $q->where('company_group_id', $project->company_group_id);
                    }
                }),
            ],
        ]);

        $task->assignees()->syncWithoutDetaching($validated['user_ids']);

        return back()->with('success', 'Assignee berhasil ditambahkan.');
    }

    /**
     * Unassign a user from a task
     */
    public function unassign(Project $project, Task $task, User $user)
    {
        if (!$project->canBeManagedBy(Auth::user()) || $task->project_id !== $project->id) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola assignee.');
        }

        $task->assignees()->detach($user->id);

        return back()->with('success', 'Assignee berhasil dihapus.');
    }
}
