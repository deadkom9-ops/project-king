<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MilestoneController extends Controller
{
    public function store(Request $request, Project $project)
    {
        if (!$project->canBeManagedBy(Auth::user())) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola milestone pada project ini.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $validated['sort_order'] = $validated['sort_order']
            ?? (($project->milestones()->max('sort_order') ?? 0) + 1);

        $project->milestones()->create($validated);

        return back()->with('success', 'Milestone berhasil ditambahkan.');
    }

    public function update(Request $request, Project $project, Milestone $milestone)
    {
        if (!$project->canBeManagedBy(Auth::user()) || $milestone->project_id !== $project->id) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengubah milestone ini.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'required|in:pending,in_progress,completed',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $milestone->update($validated);

        return back()->with('success', 'Milestone berhasil diperbarui.');
    }

    public function destroy(Project $project, Milestone $milestone)
    {
        if (!$project->canBeManagedBy(Auth::user()) || $milestone->project_id !== $project->id) {
            abort(403, 'Anda tidak memiliki hak akses untuk menghapus milestone ini.');
        }

        $milestone->delete();

        return back()->with('success', 'Milestone berhasil dihapus.');
    }
}
