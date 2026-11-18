<?php

namespace Database\Seeders;

use App\Models\CompanyGroup;
use App\Models\Milestone;
use App\Models\ProgressUpdate;
use App\Models\Project;
use App\Models\Task;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // ── Units ───────────────────────────────────────
        $direktorat = Unit::create([
            'name' => 'Direktorat Utama',
            'code' => 'DIR-01',
            'level' => 'direktorat',
            'description' => 'Direktorat utama organisasi',
        ]);

        $bidangIT = Unit::create([
            'name' => 'Bidang IT & Digital',
            'code' => 'BID-IT',
            'parent_id' => $direktorat->id,
            'level' => 'bidang',
        ]);

        $bidangHR = Unit::create([
            'name' => 'Bidang SDM & HR',
            'code' => 'BID-HR',
            'parent_id' => $direktorat->id,
            'level' => 'bidang',
        ]);

        $unitDev = Unit::create([
            'name' => 'Unit Development',
            'code' => 'UNT-DEV',
            'parent_id' => $bidangIT->id,
            'level' => 'unit',
        ]);

        $unitInfra = Unit::create([
            'name' => 'Unit Infrastructure',
            'code' => 'UNT-INF',
            'parent_id' => $bidangIT->id,
            'level' => 'unit',
        ]);

        // ── Users ───────────────────────────────────────
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@projectking.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $direktur = User::create([
            'name' => 'Dr. Ahmad Direktur',
            'email' => 'direktur@projectking.com',
            'password' => Hash::make('password'),
            'role' => 'direktur',
            'unit_id' => $direktorat->id,
        ]);

        $wadir = User::create([
            'name' => 'Ir. Budi Wakil Direktur',
            'email' => 'wadir@projectking.com',
            'password' => Hash::make('password'),
            'role' => 'wakil_direktur',
            'unit_id' => $direktorat->id,
        ]);

        $kepalaBidang = User::create([
            'name' => 'Citra Kepala Bidang IT',
            'email' => 'kabid@projectking.com',
            'password' => Hash::make('password'),
            'role' => 'kepala_bidang',
            'unit_id' => $bidangIT->id,
        ]);

        $kepalaUnit = User::create([
            'name' => 'Deni Kepala Unit Dev',
            'email' => 'kaunit@projectking.com',
            'password' => Hash::make('password'),
            'role' => 'kepala_unit',
            'unit_id' => $unitDev->id,
        ]);

        $pm = User::create([
            'name' => 'Eka Project Manager',
            'email' => 'pm@projectking.com',
            'password' => Hash::make('password'),
            'role' => 'project_manager',
            'unit_id' => $unitDev->id,
        ]);

        $member1 = User::create([
            'name' => 'Faisal Developer',
            'email' => 'faisal@projectking.com',
            'password' => Hash::make('password'),
            'role' => 'member',
            'unit_id' => $unitDev->id,
        ]);

        $member2 = User::create([
            'name' => 'Gita Designer',
            'email' => 'gita@projectking.com',
            'password' => Hash::make('password'),
            'role' => 'member',
            'unit_id' => $unitDev->id,
        ]);

        $member3 = User::create([
            'name' => 'Hasan Backend Dev',
            'email' => 'hasan@projectking.com',
            'password' => Hash::make('password'),
            'role' => 'member',
            'unit_id' => $unitDev->id,
        ]);

        // Update unit heads
        $direktorat->update(['head_id' => $direktur->id]);
        $bidangIT->update(['head_id' => $kepalaBidang->id]);
        $unitDev->update(['head_id' => $kepalaUnit->id]);

        // ── Company Group ───────────────────────────────
        $demoGroup = CompanyGroup::create([
            'name' => 'Project King Demo',
            'prefix_code' => 'DEMO01',
            'group_code' => 'PROJECT-KING-DEMO-DEMO01',
            'owner_id' => $admin->id,
        ]);

        Unit::whereIn('id', [
            $direktorat->id,
            $bidangIT->id,
            $bidangHR->id,
            $unitDev->id,
            $unitInfra->id,
        ])->update(['company_group_id' => $demoGroup->id]);

        User::whereIn('id', [
            $admin->id,
            $direktur->id,
            $wadir->id,
            $kepalaBidang->id,
            $kepalaUnit->id,
            $pm->id,
            $member1->id,
            $member2->id,
            $member3->id,
        ])->update(['company_group_id' => $demoGroup->id]);

        // ── Project 1: Sistem Informasi ─────────────────
        $project1 = Project::create([
            'title' => 'Pengembangan Sistem Informasi Manajemen',
            'description' => 'Membangun sistem informasi manajemen terintegrasi untuk meningkatkan efisiensi operasional organisasi. Mencakup modul HR, Finance, dan Inventory.',
            'created_by' => $pm->id,
            'unit_id' => $unitDev->id,
            'company_group_id' => $demoGroup->id,
            'start_date' => now()->subMonths(2),
            'end_date' => now()->addMonths(4),
            'status' => 'active',
            'priority' => 'high',
            'budget' => 500000000,
        ]);

        $project1->members()->attach([
            $pm->id => ['role' => 'manager'],
            $member1->id => ['role' => 'member'],
            $member2->id => ['role' => 'member'],
            $member3->id => ['role' => 'member'],
        ]);

        // Milestones
        $ms1 = Milestone::create([
            'project_id' => $project1->id,
            'title' => 'Fase 1: Analisis & Design',
            'description' => 'Requirement gathering, system design, dan prototyping',
            'due_date' => now()->subMonth(),
            'sort_order' => 1,
            'status' => 'completed',
        ]);

        $ms2 = Milestone::create([
            'project_id' => $project1->id,
            'title' => 'Fase 2: Development',
            'description' => 'Coding, unit testing, integration',
            'due_date' => now()->addMonths(2),
            'sort_order' => 2,
            'status' => 'in_progress',
        ]);

        $ms3 = Milestone::create([
            'project_id' => $project1->id,
            'title' => 'Fase 3: Testing & Deployment',
            'description' => 'UAT, bug fixing, deployment to production',
            'due_date' => now()->addMonths(4),
            'sort_order' => 3,
            'status' => 'pending',
        ]);

        // Tasks for Milestone 1
        $task1 = Task::create(['project_id' => $project1->id, 'milestone_id' => $ms1->id, 'title' => 'Requirement Gathering', 'status' => 'completed', 'priority' => 'high', 'weight' => 3, 'progress' => 100, 'due_date' => now()->subMonths(2)]);
        $task1->assignees()->attach([$member1->id, $member2->id]);

        $task2 = Task::create(['project_id' => $project1->id, 'milestone_id' => $ms1->id, 'title' => 'System Architecture Design', 'status' => 'completed', 'priority' => 'high', 'weight' => 4, 'progress' => 100, 'due_date' => now()->subMonth()]);
        $task2->assignees()->attach([$member1->id]);

        $task3 = Task::create(['project_id' => $project1->id, 'milestone_id' => $ms1->id, 'title' => 'UI/UX Wireframe & Prototype', 'status' => 'completed', 'priority' => 'medium', 'weight' => 3, 'progress' => 100, 'due_date' => now()->subMonth()]);
        $task3->assignees()->attach([$member2->id]);

        // Tasks for Milestone 2
        $task4 = Task::create(['project_id' => $project1->id, 'milestone_id' => $ms2->id, 'title' => 'Backend API Development', 'status' => 'in_progress', 'priority' => 'critical', 'weight' => 5, 'progress' => 65, 'due_date' => now()->addMonth()]);
        $task4->assignees()->attach([$member1->id, $member3->id]);

        $task5 = Task::create(['project_id' => $project1->id, 'milestone_id' => $ms2->id, 'title' => 'Frontend Development', 'status' => 'in_progress', 'priority' => 'high', 'weight' => 5, 'progress' => 45, 'due_date' => now()->addMonth()]);
        $task5->assignees()->attach([$member2->id]);

        $task6 = Task::create(['project_id' => $project1->id, 'milestone_id' => $ms2->id, 'title' => 'Database Schema & Migration', 'status' => 'completed', 'priority' => 'high', 'weight' => 2, 'progress' => 100, 'due_date' => now()->subWeeks(2)]);
        $task6->assignees()->attach([$member3->id]);

        $task7 = Task::create(['project_id' => $project1->id, 'milestone_id' => $ms2->id, 'title' => 'Integration Testing', 'status' => 'todo', 'priority' => 'medium', 'weight' => 3, 'progress' => 0, 'due_date' => now()->addMonths(2)]);
        $task7->assignees()->attach([$member1->id, $member3->id]);

        // Tasks for Milestone 3
        Task::create(['project_id' => $project1->id, 'milestone_id' => $ms3->id, 'title' => 'User Acceptance Testing', 'status' => 'todo', 'priority' => 'high', 'weight' => 3, 'progress' => 0, 'due_date' => now()->addMonths(3)]);
        Task::create(['project_id' => $project1->id, 'milestone_id' => $ms3->id, 'title' => 'Production Deployment', 'status' => 'todo', 'priority' => 'critical', 'weight' => 2, 'progress' => 0, 'due_date' => now()->addMonths(4)]);

        // Progress Updates
        ProgressUpdate::create([
            'task_id' => $task4->id, 'submitted_by' => $member1->id, 'percentage' => 65,
            'notes' => 'API endpoint untuk modul HR dan Finance sudah selesai. Tinggal modul Inventory.',
            'approval_status' => 'approved', 'approved_by' => $pm->id, 'approved_at' => now()->subDays(2),
        ]);

        ProgressUpdate::create([
            'task_id' => $task5->id, 'submitted_by' => $member2->id, 'percentage' => 45,
            'notes' => 'Dashboard dan halaman HR sudah selesai. Sedang mengerjakan halaman Finance.',
            'approval_status' => 'approved', 'approved_by' => $pm->id, 'approved_at' => now()->subDay(),
        ]);

        // Pending progress
        ProgressUpdate::create([
            'task_id' => $task4->id, 'submitted_by' => $member3->id, 'percentage' => 75,
            'notes' => 'Menambahkan endpoint untuk modul Inventory. Perlu review code quality.',
            'approval_status' => 'pending',
        ]);

        ProgressUpdate::create([
            'task_id' => $task5->id, 'submitted_by' => $member2->id, 'percentage' => 55,
            'notes' => 'Halaman Finance reports sudah selesai dikerjakan. Mohon di-review.',
            'approval_status' => 'pending',
        ]);

        // ── Project 2: Website Redesign ─────────────────
        $project2 = Project::create([
            'title' => 'Redesign Website Resmi Organisasi',
            'description' => 'Merancang ulang website resmi dengan design modern dan responsif.',
            'created_by' => $pm->id,
            'unit_id' => $unitDev->id,
            'company_group_id' => $demoGroup->id,
            'start_date' => now()->subWeeks(3),
            'end_date' => now()->addMonths(2),
            'status' => 'active',
            'priority' => 'medium',
            'budget' => 150000000,
        ]);

        $project2->members()->attach([
            $pm->id => ['role' => 'manager'],
            $member2->id => ['role' => 'member'],
        ]);

        $t2_1 = Task::create(['project_id' => $project2->id, 'title' => 'Design Mockup', 'status' => 'completed', 'priority' => 'high', 'weight' => 3, 'progress' => 100]);
        $t2_1->assignees()->attach([$member2->id]);

        $t2_2 = Task::create(['project_id' => $project2->id, 'title' => 'HTML/CSS Slicing', 'status' => 'in_progress', 'priority' => 'medium', 'weight' => 4, 'progress' => 30]);
        $t2_2->assignees()->attach([$member2->id]);

        Task::create(['project_id' => $project2->id, 'title' => 'CMS Integration', 'status' => 'todo', 'priority' => 'medium', 'weight' => 3, 'progress' => 0]);

        // ── Project 3: Completed ────────────────────────
        $project3 = Project::create([
            'title' => 'Migrasi Server ke Cloud',
            'description' => 'Migrasi seluruh infrastruktur server ke AWS Cloud.',
            'created_by' => $pm->id,
            'unit_id' => $unitInfra->id,
            'company_group_id' => $demoGroup->id,
            'start_date' => now()->subMonths(4),
            'end_date' => now()->subMonth(),
            'status' => 'completed',
            'priority' => 'critical',
            'budget' => 300000000,
        ]);

        $project3->members()->attach([
            $pm->id => ['role' => 'manager'],
            $member1->id => ['role' => 'member'],
            $member3->id => ['role' => 'member'],
        ]);

        Task::create(['project_id' => $project3->id, 'title' => 'Audit Server Existing', 'status' => 'completed', 'weight' => 2, 'progress' => 100]);
        Task::create(['project_id' => $project3->id, 'title' => 'Setup AWS Infrastructure', 'status' => 'completed', 'weight' => 4, 'progress' => 100]);
        Task::create(['project_id' => $project3->id, 'title' => 'Data Migration', 'status' => 'completed', 'weight' => 3, 'progress' => 100]);
        Task::create(['project_id' => $project3->id, 'title' => 'Testing & Cutover', 'status' => 'completed', 'weight' => 3, 'progress' => 100]);

        $this->command->info('✅ Demo data seeded successfully!');
        $this->command->info("Demo Group Code:   {$demoGroup->group_code}");
        $this->command->info('');
        $this->command->info('Login credentials:');
        $this->command->info('───────────────────────────────────');
        $this->command->info('Admin:             admin@projectking.com / password');
        $this->command->info('Direktur:          direktur@projectking.com / password');
        $this->command->info('Wakil Direktur:    wadir@projectking.com / password');
        $this->command->info('Kepala Bidang:     kabid@projectking.com / password');
        $this->command->info('Kepala Unit:       kaunit@projectking.com / password');
        $this->command->info('Project Manager:   pm@projectking.com / password');
        $this->command->info('Member (Faisal):   faisal@projectking.com / password');
        $this->command->info('Member (Gita):     gita@projectking.com / password');
        $this->command->info('Member (Hasan):    hasan@projectking.com / password');
    }
}
