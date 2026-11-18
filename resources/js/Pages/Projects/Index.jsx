import { Head, Link, router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import {
    Plus,
    Search,
    Filter,
    FolderKanban,
    Users,
    ListChecks,
    Calendar,
    Trash2,
    X,
    Building2,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
} from 'lucide-react';
import { useState, useId } from 'react';
import { usePage } from '@inertiajs/react';

/* ── Accessible Modal Component ─────────────────────────── */
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen || typeof document === 'undefined') return null;

    const handleBackdropMouseDown = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
            onMouseDown={handleBackdropMouseDown}
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200/90 animate-fade-in-up">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Tutup modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="pt-4">{children}</div>
            </div>
        </div>,
        document.body
    );
};

/* ── Project Card Component ─────────────────────────────── */
const ProjectCard = ({ project, canDelete, onDeleteClick }) => {
    const priorityConfig = {
        low: {
            bg: 'bg-slate-50 text-slate-700 border-slate-200',
            bar: 'from-slate-400 to-slate-500',
        },
        medium: {
            bg: 'bg-sky-50 text-sky-700 border-sky-200',
            bar: 'from-sky-500 to-indigo-500',
        },
        high: {
            bg: 'bg-amber-50 text-amber-700 border-amber-200',
            bar: 'from-amber-500 to-orange-500',
        },
        critical: {
            bg: 'bg-rose-50 text-rose-700 border-rose-200',
            bar: 'from-rose-500 to-red-600',
        },
    };

    const statusConfig = {
        draft: {
            badge: 'bg-slate-100 text-slate-700 border-slate-200',
            dot: 'bg-slate-400',
        },
        active: {
            badge: 'bg-purple-50 text-purple-700 border-purple-200',
            dot: 'bg-purple-600 animate-pulse',
        },
        on_hold: {
            badge: 'bg-amber-50 text-amber-700 border-amber-200',
            dot: 'bg-amber-500',
        },
        completed: {
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            dot: 'bg-emerald-600',
        },
        cancelled: {
            badge: 'bg-rose-50 text-rose-700 border-rose-200',
            dot: 'bg-rose-500',
        },
    };

    const currentPriority = priorityConfig[project.priority] || priorityConfig.medium;
    const currentStatus = statusConfig[project.status] || statusConfig.active;
    const progressVal = Math.min(Math.max(project.progress || 0, 0), 100);

    return (
        <div className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-xl hover:shadow-slate-900/[0.04] hover:border-purple-200 transition-all duration-200">
            <div>
                {/* Header: Unit & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {project.unit ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium truncate">
                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{project.unit}</span>
                            </span>
                        ) : (
                            <span className="text-xs text-slate-400 font-medium">Umum</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStatus.badge}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
                            {project.status_label || project.status}
                        </span>

                        {canDelete && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onDeleteClick(project);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-80 group-hover:opacity-100"
                                title="Hapus Project"
                                aria-label={`Hapus project ${project.title}`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Title & Link */}
                <Link
                    href={`/projects/${project.id}`}
                    className="block group/link focus:outline-none"
                >
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover/link:text-purple-600 transition-colors line-clamp-2 leading-snug">
                            {project.title}
                        </h3>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
                    </div>

                    {/* Description */}
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                        {project.description || 'Tidak ada deskripsi detail project.'}
                    </p>
                </Link>
            </div>

            {/* Bottom Section */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3.5">
                {/* Progress bar */}
                <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-500">Progres Keseluruhan</span>
                        <span className="font-bold text-slate-900">{progressVal.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${currentPriority.bar} transition-all duration-700 ease-out`}
                            style={{ width: `${progressVal}%` }}
                        />
                    </div>
                </div>

                {/* Meta details */}
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        <span
                            className="inline-flex items-center gap-1 font-medium text-slate-600"
                            title="Jumlah Anggota"
                        >
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {project.members_count || 0}
                        </span>
                        <span
                            className="inline-flex items-center gap-1 font-medium text-slate-600"
                            title="Task Selesai / Total"
                        >
                            <ListChecks className="w-3.5 h-3.5 text-slate-400" />
                            {project.task_stats?.completed || 0}/{project.tasks_count || 0}
                        </span>
                    </div>

                    <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${currentPriority.bg}`}
                    >
                        {project.priority_label || project.priority}
                    </span>
                </div>

                {/* Dates */}
                {(project.start_date || project.end_date) && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                            {project.start_date || '–'} s/d {project.end_date || '–'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Main Projects Page ─────────────────────────────────── */
export default function ProjectsIndex({ projects, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [deletingProject, setDeletingProject] = useState(null);

    const userRole = auth.user?.role;
    const canCreate = [
        'admin',
        'project_manager',
        'kepala_unit',
        'kepala_bidang',
        'wakil_direktur',
        'direktur',
    ].includes(userRole);
    const canDelete = ['project_manager', 'kepala_unit', 'admin'].includes(userRole);

    const applyFilters = (customSearch = search, customStatus = status) => {
        router.get(
            '/projects',
            {
                search: customSearch || undefined,
                status: customStatus || undefined,
            },
            { preserveState: true }
        );
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') applyFilters();
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        applyFilters('', '');
    };

    const handleDelete = () => {
        if (!deletingProject) return;
        router.delete(`/projects/${deletingProject.id}`, {
            onSuccess: () => setDeletingProject(null),
        });
    };

    const projectList = projects.data || [];
    const totalCount = projects.total ?? projectList.length;

    return (
        <AuthenticatedLayout title="Daftar Projects">
            <Head title="Daftar Projects - Project Management" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Page Header with Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Projects & Business Plan
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Kelola jadwal, pantau milestone, dan tinjau progres pelaksanaan program kerja.
                        </p>
                    </div>

                    {canCreate && (
                        <Link
                            href="/projects/create"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:via-indigo-700 hover:to-cyan-700 shadow-sm shadow-indigo-500/25 active:scale-[0.98] transition-all duration-150 shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Project Baru</span>
                        </Link>
                    )}
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full h-10 pl-10 pr-10 rounded-xl text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all placeholder:text-slate-400"
                            placeholder="Cari judul project atau topik..."
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    applyFilters('', status);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                aria-label="Hapus teks pencarian"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <select
                            value={status}
                            onChange={(e) => {
                                const newStatus = e.target.value;
                                setStatus(newStatus);
                                applyFilters(search, newStatus);
                            }}
                            className="h-10 px-3.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all min-w-[140px] cursor-pointer"
                        >
                            <option value="">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="active">Aktif</option>
                            <option value="on_hold">Ditunda</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>

                        <button
                            type="button"
                            onClick={() => applyFilters()}
                            className="h-10 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5 text-slate-500" />
                            <span>Filter</span>
                        </button>

                        {(search || status) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="h-10 px-3 rounded-xl text-xs font-semibold text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Projects Grid */}
                {projectList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projectList.map((project, idx) => (
                            <div
                                key={project.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${idx * 0.04}s` }}
                            >
                                <ProjectCard
                                    project={project}
                                    canDelete={canDelete}
                                    onDeleteClick={setDeletingProject}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 sm:p-16 text-center border border-slate-200/90 shadow-2xs">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
                            <FolderKanban className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                            {search || status ? 'Tidak ada project yang cocok' : 'Belum ada project terdaftar'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            {search || status
                                ? 'Coba ubah kata kunci pencarian atau bersihkan filter yang aktif.'
                                : 'Mulai dengan membuat project baru untuk memantau rencana kerja dan milestone.'}
                        </p>
                        {canCreate && !search && !status && (
                            <Link
                                href="/projects/create"
                                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Buat Project Pertama</span>
                            </Link>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {projects.links && projects.last_page > 1 && (
                    <nav
                        className="flex items-center justify-center gap-1.5 pt-4 pb-8"
                        aria-label="Navigasi Halaman"
                    >
                        {projects.links.map((link, index) => {
                            const isEdge = link.label.includes('Previous') || link.label.includes('Next');
                            return (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                        link.active
                                            ? 'bg-purple-600 text-white shadow-xs'
                                            : link.url
                                            ? 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
                                            : 'text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </nav>
                )}
            </div>

            {/* ── Accessible Delete Confirmation Modal ───────────────── */}
            <Modal
                isOpen={!!deletingProject}
                onClose={() => setDeletingProject(null)}
                title="Hapus Project"
            >
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                Apakah Anda yakin ingin menghapus project ini?
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                                Project: <span className="font-bold text-slate-800">{deletingProject?.title}</span>
                            </p>
                            <p className="text-xs text-rose-700 mt-2 font-medium">
                                Seluruh milestone, task, dan riwayat approval progress di dalam project ini akan terhapus permanen.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={() => setDeletingProject(null)}
                            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Hapus Permanen</span>
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
