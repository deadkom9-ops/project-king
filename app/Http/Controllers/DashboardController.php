<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProgressUpdate;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get projects visible to this user
        $projects = Project::visibleTo($user)
            ->with(['tasks', 'members', 'unit'])
            ->withCount('tasks')
            ->get();

        // Calculate stats
        $totalProjects = $projects->count();
        $activeProjects = $projects->where('status', 'active')->count();
        $completedProjects = $projects->where('status', 'completed')->count();

        // Task stats
        $taskQuery = Task::whereIn('project_id', $projects->pluck('id'));
        $totalTasks = $taskQuery->count();
        $completedTasks = (clone $taskQuery)->where('status', 'completed')->count();
        $inProgressTasks = (clone $taskQuery)->where('status', 'in_progress')->count();

        // Pending approvals (for PM and above)
        $pendingApprovals = 0;
        if ($user->hasRoleLevel('project_manager')) {
            $pendingApprovals = ProgressUpdate::pending()
                ->whereHas('task', function ($q) use ($projects) {
                    $q->whereIn('project_id', $projects->pluck('id'));
                })
                ->count();
        }

        // Overall progress
        $overallProgress = $projects->avg(function ($project) {
            return $project->progress_percentage;
        }) ?? 0;

        // Project progress data for charts
        $projectProgress = $projects->where('status', 'active')->map(function ($project) {
            return [
                'id' => $project->id,
                'title' => $project->title,
                'progress' => $project->progress_percentage,
                'status' => $project->status,
                'priority' => $project->priority,
                'task_stats' => $project->task_stats,
                'start_date' => $project->start_date?->format('Y-m-d'),
                'end_date' => $project->end_date?->format('Y-m-d'),
            ];
        })->values();

        // Recent progress updates
        $recentUpdates = ProgressUpdate::with(['task.project', 'submitter'])
            ->whereHas('task', function ($q) use ($projects) {
                $q->whereIn('project_id', $projects->pluck('id'));
            })
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($update) {
                return [
                    'id' => $update->id,
                    'task_title' => $update->task->title,
                    'project_title' => $update->task->project->title,
                    'submitter_name' => $update->submitter->name,
                    'percentage' => $update->percentage,
                    'approval_status' => $update->approval_status,
                    'status_label' => $update->status_label,
                    'created_at' => $update->created_at->diffForHumans(),
                ];
            });

        // Tasks by status for pie chart
        $tasksByStatus = [
            ['name' => 'To Do', 'value' => (clone $taskQuery)->where('status', 'todo')->count(), 'color' => '#64748b'],
            ['name' => 'In Progress', 'value' => $inProgressTasks, 'color' => '#3b82f6'],
            ['name' => 'Review', 'value' => (clone $taskQuery)->where('status', 'review')->count(), 'color' => '#f59e0b'],
            ['name' => 'Completed', 'value' => $completedTasks, 'color' => '#10b981'],
        ];

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'totalProjects' => $totalProjects,
                'activeProjects' => $activeProjects,
                'completedProjects' => $completedProjects,
                'totalTasks' => $totalTasks,
                'completedTasks' => $completedTasks,
                'inProgressTasks' => $inProgressTasks,
                'pendingApprovals' => $pendingApprovals,
                'overallProgress' => round($overallProgress, 1),
            ],
            'projectProgress' => $projectProgress,
            'recentUpdates' => $recentUpdates,
            'tasksByStatus' => $tasksByStatus,
        ]);
    }
}
