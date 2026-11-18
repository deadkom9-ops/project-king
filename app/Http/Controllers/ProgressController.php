<?php

namespace App\Http\Controllers;

use App\Models\ProgressUpdate;
use App\Models\Task;
use App\Models\Project;
use App\Notifications\ProgressApprovedNotification;
use App\Notifications\ProgressRejectedNotification;
use App\Notifications\ProgressRevisionNotification;
use App\Notifications\ProgressSubmittedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProgressController extends Controller
{
    /**
     * Submit progress for a task
     */
    public function store(Request $request, Project $project, Task $task)
    {
        $user = Auth::user();

        if (!$project->isAccessibleBy($user) || $task->project_id !== $project->id) {
            abort(403, 'Akses ditolak.');
        }

        $isAssignee = $task->assignees()->where('users.id', $user->id)->exists();
        if (!$isAssignee && !$project->canBeManagedBy($user)) {
            abort(403, 'Hanya anggota yang ditugaskan pada task ini yang dapat mengirim progress.');
        }

        $validated = $request->validate([
            'percentage' => 'required|integer|min:0|max:100',
            'notes' => 'nullable|string|max:2000',
            'file' => 'nullable|file|mimes:jpg,jpeg,pdf|max:5120', // 5MB max
        ]);

        // Check if there is already a pending progress update for this task to avoid duplicate pending entries
        $existingPending = ProgressUpdate::where('task_id', $task->id)
            ->where('approval_status', 'pending')
            ->first();

        $filePath = $existingPending?->file_path;
        $fileName = $existingPending?->file_name;

        if ($request->hasFile('file')) {
            if ($existingPending && $existingPending->file_path) {
                Storage::disk('public')->delete($existingPending->file_path);
            }
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $filePath = $file->store('progress-files/' . $project->id, 'public');
        }

        if ($existingPending) {
            $existingPending->update([
                'submitted_by' => $user->id,
                'percentage' => $validated['percentage'],
                'notes' => $validated['notes'] ?? null,
                'file_path' => $filePath,
                'file_name' => $fileName,
            ]);
            $progress = $existingPending;
        } else {
            $progress = ProgressUpdate::create([
                'task_id' => $task->id,
                'submitted_by' => $user->id,
                'percentage' => $validated['percentage'],
                'notes' => $validated['notes'] ?? null,
                'file_path' => $filePath,
                'file_name' => $fileName,
                'approval_status' => 'pending',
            ]);
        }

        // Update task status to review
        if ($task->status !== 'review') {
            $task->update(['status' => 'review']);
        }

        $task->milestone?->syncStatusFromTasks();

        // Notify project managers
        $managers = $project->managers()->get();
        foreach ($managers as $manager) {
            if ($manager->id !== $user->id) {
                $manager->notify(new ProgressSubmittedNotification($progress));
            }
        }

        return back()->with('success', 'Progress berhasil disubmit dan menunggu approval.');
    }

    /**
     * Approve a progress update
     */
    public function approve(Request $request, ProgressUpdate $progress)
    {
        $progress->load(['task.project', 'task.milestone', 'submitter']);
        $project = $progress->task?->project;

        if (!$project || !$project->canBeManagedBy(Auth::user())) {
            abort(403, 'Anda tidak memiliki hak akses untuk meng-approve progress ini.');
        }

        $progress->update([
            'approval_status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        // Update the task progress
        $task = $progress->task;
        $task->update([
            'progress' => $progress->percentage,
            'status' => $progress->percentage >= 100 ? 'completed' : 'in_progress',
        ]);

        // Sync parent milestone status automatically
        $task->milestone?->syncStatusFromTasks();

        // Notify submitter
        if ($progress->submitter && $progress->submitter->id !== Auth::id()) {
            $progress->submitter->notify(new ProgressApprovedNotification($progress));
        }

        return back()->with('success', 'Progress berhasil di-approve.');
    }

    /**
     * Reject a progress update
     */
    public function reject(Request $request, ProgressUpdate $progress)
    {
        $progress->load(['task.project', 'task.milestone', 'submitter']);
        $project = $progress->task?->project;

        if (!$project || !$project->canBeManagedBy(Auth::user())) {
            abort(403, 'Anda tidak memiliki hak akses untuk menolak progress ini.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $progress->update([
            'approval_status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        // Revert task status
        $task = $progress->task;
        if ($task->status === 'review') {
            $task->update(['status' => $task->progress > 0 ? 'in_progress' : 'todo']);
        }

        $task->milestone?->syncStatusFromTasks();

        // Notify submitter
        if ($progress->submitter && $progress->submitter->id !== Auth::id()) {
            $progress->submitter->notify(new ProgressRejectedNotification($progress));
        }

        return back()->with('success', 'Progress telah ditolak.');
    }

    /**
     * Request revision for a progress update
     */
    public function revision(Request $request, ProgressUpdate $progress)
    {
        $progress->load(['task.project', 'task.milestone', 'submitter']);
        $project = $progress->task?->project;

        if (!$project || !$project->canBeManagedBy(Auth::user())) {
            abort(403, 'Anda tidak memiliki hak akses untuk meminta revisi progress ini.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $progress->update([
            'approval_status' => 'revision',
            'approved_by' => Auth::id(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        // Set task back to in_progress
        $task = $progress->task;
        if ($task->status === 'review') {
            $task->update(['status' => 'in_progress']);
        }

        $task->milestone?->syncStatusFromTasks();

        // Notify submitter
        if ($progress->submitter && $progress->submitter->id !== Auth::id()) {
            $progress->submitter->notify(new ProgressRevisionNotification($progress));
        }

        return back()->with('success', 'Revisi telah diminta.');
    }

    /**
     * List all pending approvals
     */
    public function approvals(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasRoleLevel('project_manager')) {
            abort(403, 'Halaman ini hanya untuk Project Manager dan Pimpinan.');
        }

        $projects = Project::visibleTo($user)->pluck('id');

        $pendingUpdates = ProgressUpdate::with(['task.project', 'submitter'])
            ->pending()
            ->whereHas('task', function ($q) use ($projects) {
                $q->whereIn('project_id', $projects);
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(function ($update) {
                return [
                    'id' => $update->id,
                    'task' => [
                        'id' => $update->task->id,
                        'title' => $update->task->title,
                        'current_progress' => $update->task->progress,
                    ],
                    'project' => [
                        'id' => $update->task->project->id,
                        'title' => $update->task->project->title,
                    ],
                    'submitter' => [
                        'id' => $update->submitter->id,
                        'name' => $update->submitter->name,
                    ],
                    'percentage' => $update->percentage,
                    'notes' => $update->notes,
                    'file_name' => $update->file_name,
                    'file_url' => $update->file_url,
                    'approval_status' => $update->approval_status,
                    'created_at' => $update->created_at->format('d M Y H:i'),
                    'created_at_human' => $update->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Approvals/Index', [
            'pendingUpdates' => $pendingUpdates,
        ]);
    }
}
