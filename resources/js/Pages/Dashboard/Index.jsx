import { Head, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    FolderKanban, ListChecks, Clock, TrendingUp,
    ArrowUpRight, CheckCircle2, AlertCircle, Building2, KeyRound, Copy, Check, Plus,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subtitle, color, glowClass }) => (
    <div className={`glass-card p-6 ${glowClass} animate-fade-in-up`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                <p className="text-3xl font-extrabold text-slate-900">{value}</p>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const ProgressBar = ({ label, progress, color = 'from-teal-600 to-teal-400' }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 truncate mr-4">{label}</span>
            <span className="text-sm font-bold text-teal-700">{progress.toFixed(1)}%</span>
        </div>
        <div className="progress-bar-container">
            <div
                className={`progress-bar-fill bg-gradient-to-r ${color}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
            />
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card !rounded-lg p-3 !border-white/10">
                <p className="text-sm text-white font-medium">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs text-gray-400">
                        {entry.name}: <span className="text-white font-medium">{entry.value}%</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardIndex({ stats, projectProgress, recentUpdates, tasksByStatus }) {
    const { auth } = usePage().props;
    const companyGroup = auth.user?.company_group;
    const [copied, setCopied] = useState(false);

    const createGroupForm = useForm({ name: '' });
    const joinGroupForm = useForm({ group_code: '' });

    const copyCode = () => {
        if (!companyGroup?.group_code) return;
        navigator.clipboard.writeText(companyGroup.group_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateGroup = (e) => {
        e.preventDefault();
        createGroupForm.post('/company-groups', {
            onSuccess: () => createGroupForm.reset(),
        });
    };

    const handleJoinGroup = (e) => {
        e.preventDefault();
        joinGroupForm.post('/company-groups/join', {
            onSuccess: () => joinGroupForm.reset(),
        });
    };

    const progressColors = [
        'from-fuchsia-600 via-purple-600 to-cyan-500',
        'from-purple-600 to-indigo-500',
        'from-indigo-500 to-cyan-500',
        'from-fuchsia-500 to-pink-500',
        'from-cyan-500 to-teal-500',
    ];

    return (
        <AuthenticatedLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Company Group Onboarding / Active Group Info Banner */}
                {!companyGroup ? (
                    <div className="rounded-2xl bg-white border-2 border-purple-200 p-6 sm:p-8 shadow-sm animate-fade-in-up">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider mb-3">
                                <Building2 className="w-3.5 h-3.5" />
                                Setup Grup Perusahaan Anda
                            </div>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                                Selamat Datang! Mulai dengan Grup Perusahaan Anda
                            </h2>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                Agar project dan daftar anggota tim tidak tercampur dengan perusahaan lain, buat Grup Perusahaan baru atau bergabung menggunakan Kode ID Grup dari rekan Anda.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
                            {/* Buat Grup Baru */}
                            <form onSubmit={handleCreateGroup} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-1">
                                        <Plus className="w-4.5 h-4.5 text-purple-600" />
                                        <span>Buat Grup Perusahaan Baru</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Tentukan nama grup Anda. Sistem akan menambahkan 6 digit kode unik secara otomatis.
                                    </p>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Nama Perusahaan / Grup
                                    </label>
                                    <input
                                        type="text"
                                        value={createGroupForm.data.name}
                                        onChange={(e) => createGroupForm.setData('name', e.target.value)}
                                        className="w-full h-10 px-3.5 rounded-xl text-sm text-slate-900 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                                        placeholder="Contoh: Perusahaan A"
                                        required
                                    />
                                    {createGroupForm.errors.name && (
                                        <p className="mt-1 text-xs text-rose-600 font-medium">{createGroupForm.errors.name}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={createGroupForm.processing}
                                    className="w-full h-10 rounded-xl text-xs sm:text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-60"
                                >
                                    {createGroupForm.processing ? 'Membuat Grup...' : 'Buat Grup & Generate Kode ID'}
                                </button>
                            </form>

                            {/* Gabung Grup yang Sudah Ada */}
                            <form onSubmit={handleJoinGroup} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-1">
                                        <KeyRound className="w-4.5 h-4.5 text-indigo-600" />
                                        <span>Gabung Grup dengan Kode ID</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Sudah punya grup perusahaan? Masukkan kode <code className="font-mono text-slate-700">NAMA-GRUP-6DIGIT</code> dari rekan Anda.
                                    </p>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Kode ID Grup
                                    </label>
                                    <input
                                        type="text"
                                        value={joinGroupForm.data.group_code}
                                        onChange={(e) => joinGroupForm.setData('group_code', e.target.value.toUpperCase())}
                                        className="w-full h-10 px-3.5 rounded-xl text-sm font-mono uppercase tracking-wider text-slate-900 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                                        placeholder="Contoh: PERUSAHAAN-A-X7K9M2"
                                        required
                                    />
                                    {joinGroupForm.errors.group_code && (
                                        <p className="mt-1 text-xs text-rose-600 font-medium">{joinGroupForm.errors.group_code}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={joinGroupForm.processing}
                                    className="w-full h-10 rounded-xl text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer disabled:opacity-60"
                                >
                                    {joinGroupForm.processing ? 'Memproses...' : 'Gabung ke Grup'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-base font-extrabold text-slate-900">{companyGroup.name}</h2>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Workspace Aktif
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Seluruh project & anggota tim di bawah ini terisolasi khusus untuk grup perusahaan Anda.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/90">
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    ID Grup Perusahaan
                                </span>
                                <code className="text-xs sm:text-sm font-mono font-extrabold text-purple-700 tracking-wider">
                                    {companyGroup.group_code}
                                </code>
                            </div>
                            <button
                                type="button"
                                onClick={copyCode}
                                className="ml-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-purple-700 hover:border-purple-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-700">Tersalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Salin ID</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={FolderKanban}
                        label="Total Projects"
                        value={stats.totalProjects}
                        subtitle={`${stats.activeProjects} aktif`}
                        color="bg-gradient-to-br from-fuchsia-600 to-purple-700"
                        glowClass="stat-glow-brand"
                    />
                    <StatCard
                        icon={ListChecks}
                        label="Total Tasks"
                        value={stats.totalTasks}
                        subtitle={`${stats.completedTasks} selesai`}
                        color="bg-gradient-to-br from-purple-500 to-indigo-600"
                        glowClass="stat-glow-indigo"
                    />
                    <StatCard
                        icon={Clock}
                        label="Pending Approvals"
                        value={stats.pendingApprovals}
                        subtitle="menunggu review"
                        color="bg-gradient-to-br from-amber-500 to-amber-600"
                        glowClass="stat-glow-amber"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Overall Progress"
                        value={`${stats.overallProgress}%`}
                        subtitle="rata-rata semua project"
                        color="bg-gradient-to-br from-cyan-500 to-teal-600"
                        glowClass="stat-glow-cyan"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Project Progress Chart */}
                    <div className="lg:col-span-2 glass-card p-6 animate-fade-in-up delay-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Progress Project Aktif</h3>
                        {projectProgress.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={projectProgress} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="title"
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        angle={-30}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="progress"
                                        name="Progress"
                                        fill="url(#progressGradient)"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={60}
                                    />
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#d946ef" />
                                            <stop offset="50%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                <p>Belum ada project aktif</p>
                            </div>
                        )}
                    </div>

                    {/* Tasks by Status Pie */}
                    <div className="glass-card p-6 animate-fade-in-up delay-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Tasks by Status</h3>
                        {tasksByStatus.some(t => t.value > 0) ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={tasksByStatus.filter(t => t.value > 0)}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {tasksByStatus.filter(t => t.value > 0).map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            color: '#0f172a',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                <p>Belum ada tasks</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Progress Bars */}
                    <div className="glass-card p-6 animate-fade-in-up delay-300">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Project Progress</h3>
                        <div className="space-y-5">
                            {projectProgress.length > 0 ? (
                                projectProgress.slice(0, 6).map((project, index) => (
                                    <ProgressBar
                                        key={project.id}
                                        label={project.title}
                                        progress={project.progress}
                                        color={progressColors[index % progressColors.length]}
                                    />
                                ))
                            ) : (
                                <p className="text-slate-500 text-sm">Belum ada project aktif</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Updates */}
                    <div className="glass-card p-6 animate-fade-in-up delay-400">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Aktivitas Terbaru</h3>
                        <div className="space-y-4">
                            {recentUpdates.length > 0 ? (
                                recentUpdates.map((update) => (
                                    <div key={update.id} className="flex items-start gap-3 group">
                                        <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            update.approval_status === 'approved' ? 'bg-emerald-500/20' :
                                            update.approval_status === 'rejected' ? 'bg-red-500/20' :
                                            update.approval_status === 'revision' ? 'bg-orange-500/20' :
                                            'bg-amber-500/20'
                                        }`}>
                                            {update.approval_status === 'approved' ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            ) : update.approval_status === 'rejected' ? (
                                                <AlertCircle className="w-4 h-4 text-red-400" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-amber-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-600">
                                                <span className="font-semibold text-slate-800">{update.submitter_name}</span>
                                                {' submitted '}
                                                <span className="font-bold text-teal-600">{update.percentage}%</span>
                                                {' untuk '}
                                                <span className="font-semibold text-slate-800">{update.task_title}</span>
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-500">{update.project_title}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-xs text-slate-400">{update.created_at}</span>
                                            </div>
                                        </div>
                                        <span className={`badge badge-${update.approval_status} text-[10px]`}>
                                            {update.status_label}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">Belum ada aktivitas</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
