import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { useState } from 'react';
import {
    ArrowLeft, Plus, Edit2, Trash2, Users, Calendar, Target,
    CheckCircle2, Clock, Upload, FileText, Image, ExternalLink,
    ChevronDown, ChevronUp, UserPlus, X, RotateCcw, Building2,
} from 'lucide-react';

// ── Modal Component ─────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen || typeof document === 'undefined') return null;

    const handleBackdropMouseDown = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div className="modal-overlay animate-fade-in" onMouseDown={handleBackdropMouseDown}>
            <div className="modal-content animate-fade-in-up" style={{ maxWidth: '520px' }}>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
};

// ── Task Row ────────────────────────────────────────────
const TaskRow = ({ task, projectId, canManage, onEditTask, onDeleteTask }) => {
    const { auth } = usePage().props;
    const [expanded, setExpanded] = useState(Boolean(task.has_pending_progress));
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(null);

    const isAssignee = task.assignees?.some(a => a.id === auth.user?.id);
    const canSubmitProgress = isAssignee || canManage;

    const progressForm = useForm({ percentage: task.progress, notes: '', file: null });
    const approvalForm = useForm({ rejection_reason: '' });

    const submitProgress = (e) => {
        e.preventDefault();
        progressForm.post(`/projects/${projectId}/tasks/${task.id}/progress`, {
            forceFormData: true,
            onSuccess: () => { setShowProgressModal(false); progressForm.reset(); },
        });
    };

    const handleApproval = (progressId, action) => {
        if (action === 'approve') {
            router.post(`/progress/${progressId}/approve`);
        } else {
            approvalForm.post(`/progress/${progressId}/${action}`, {
                onSuccess: () => { setShowApprovalModal(null); approvalForm.reset(); },
            });
        }
    };

    return (
        <>
            <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs hover:border-purple-200 transition-all">
                <div className="flex items-center gap-3">
                    {/* Status indicator */}
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        task.latest_revision ? 'bg-orange-500 ring-2 ring-orange-200 animate-pulse' :
                        task.status === 'completed' ? 'bg-emerald-500' :
                        task.status === 'in_progress' ? 'bg-blue-500' :
                        task.status === 'review' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{task.title}</h4>
                            <span className={`badge badge-${task.status} !text-[10px] !px-2 !py-0.5`}>{task.status_label}</span>
                            <span className={`badge badge-${task.priority} !text-[10px] !px-2 !py-0.5`}>{task.priority_label}</span>
                            {task.latest_revision && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700 border border-orange-300">
                                    <RotateCcw className="w-3 h-3" />
                                    Perlu Revisi
                                </span>
                            )}
                        </div>
                        {task.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-slate-500 flex-wrap">
                            <span className="text-xs font-medium">Bobot: {task.weight}</span>
                            {task.due_date && (
                                <span className="text-xs flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {task.due_date}
                                </span>
                            )}
                            {task.assignees?.length > 0 && (
                                <span className="text-xs flex items-center gap-1 text-slate-600 font-medium">
                                    <Users className="w-3 h-3 text-purple-600" />
                                    {task.assignees.map(a => a.name).join(', ')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Progress & Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="w-20 sm:w-24">
                            <div className="progress-bar-container !h-1.5">
                                <div className="progress-bar-fill" style={{ width: `${task.progress}%` }} />
                            </div>
                            <p className="text-xs font-semibold text-slate-600 text-right mt-0.5">{task.progress}%</p>
                        </div>

                        {canSubmitProgress && task.status !== 'completed' && (
                            <button
                                type="button"
                                onClick={() => setShowProgressModal(true)}
                                className={`btn-primary !px-3 !py-1.5 text-xs flex items-center gap-1.5 cursor-pointer ${
                                    task.latest_revision ? '!bg-gradient-to-r !from-orange-500 !to-amber-500 shadow-md shadow-orange-500/20' : ''
                                }`}
                                title={task.latest_revision ? 'Submit Ulang Revisi' : 'Submit Progress'}
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{task.latest_revision ? 'Kirim Revisi' : 'Progress'}</span>
                            </button>
                        )}

                        {canManage && (
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => onEditTask(task)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                                    title="Edit Task"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteTask(task)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Hapus Task"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {task.has_pending_progress && (
                            <button
                                type="button"
                                onClick={() => setExpanded(!expanded)}
                                className="p-1 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                                title="Lihat Progress Menunggu Review"
                            >
                                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Revision Notice Banner */}
                {task.latest_revision && (
                    <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-2.5">
                        <RotateCcw className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold text-orange-800 uppercase tracking-wide">
                                    Catatan Revisi {task.latest_revision.approver_name ? `dari ${task.latest_revision.approver_name}` : ''}:
                                </p>
                                <span className="text-[10px] text-orange-600">{task.latest_revision.updated_at}</span>
                            </div>
                            <p className="text-xs text-orange-700 mt-1 whitespace-pre-wrap leading-relaxed">
                                {task.latest_revision.rejection_reason || 'Mohon perbaiki progress sesuai arahan.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Expanded: Pending Progress Details & Approval Actions */}
                {expanded && task.has_pending_progress && task.latest_progress && task.latest_progress.approval_status === 'pending' && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                                            Pengajuan Progress: <span className="text-amber-700">{task.latest_progress.percentage}%</span>
                                            {task.latest_progress.submitter_name && (
                                                <span className="font-normal text-slate-600"> oleh {task.latest_progress.submitter_name}</span>
                                            )}
                                        </p>
                                        <p className="text-[11px] text-slate-500">{task.latest_progress.created_at}</p>
                                    </div>
                                </div>

                                {canManage && (
                                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                                        <button
                                            type="button"
                                            onClick={() => handleApproval(task.latest_progress.id, 'approve')}
                                            className="btn-success !px-3 !py-1.5 text-xs cursor-pointer"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowApprovalModal({ id: task.latest_progress.id, action: 'revision' })}
                                            className="btn-warning !px-3 !py-1.5 text-xs cursor-pointer"
                                        >
                                            Revisi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowApprovalModal({ id: task.latest_progress.id, action: 'reject' })}
                                            className="btn-danger !px-3 !py-1.5 text-xs cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>

                            {task.latest_progress.notes && (
                                <p className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-amber-200/60 whitespace-pre-wrap">
                                    {task.latest_progress.notes}
                                </p>
                            )}

                            {task.latest_progress.file_name && (
                                <div>
                                    <a
                                        href={task.latest_progress.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors"
                                    >
                                        {task.latest_progress.file_name.endsWith('.pdf') ? (
                                            <FileText className="w-3.5 h-3.5" />
                                        ) : (
                                            <Image className="w-3.5 h-3.5" />
                                        )}
                                        <span>Lihat Bukti: {task.latest_progress.file_name}</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Submit Progress Modal */}
            <Modal
                isOpen={showProgressModal}
                onClose={() => setShowProgressModal(false)}
                title={task.latest_revision ? 'Submit Ulang Revisi Progress' : 'Submit Progress Task'}
            >
                <form onSubmit={submitProgress} className="space-y-4">
                    {task.latest_revision && (
                        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                            <p className="text-xs font-bold text-orange-800 uppercase tracking-wide flex items-center gap-1.5">
                                <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                                Catatan Revisi {task.latest_revision.approver_name ? `(${task.latest_revision.approver_name})` : ''}:
                            </p>
                            <p className="text-xs text-orange-700 mt-1 whitespace-pre-wrap leading-relaxed">
                                {task.latest_revision.rejection_reason}
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Progress (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={progressForm.data.percentage}
                            onChange={(e) => progressForm.setData('percentage', e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan Perbaikan / Progress</label>
                        <textarea
                            value={progressForm.data.notes}
                            onChange={(e) => progressForm.setData('notes', e.target.value)}
                            className="input-field min-h-[80px]"
                            placeholder="Jelaskan apa yang sudah dikerjakan..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">File Bukti (JPG/PDF, maks 5MB)</label>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.pdf"
                            onChange={(e) => progressForm.setData('file', e.target.files[0])}
                            className="input-field !py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 file:font-semibold file:text-xs file:px-3 file:py-1.5 file:cursor-pointer"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowProgressModal(false)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={progressForm.processing} className="btn-primary cursor-pointer">
                            {progressForm.processing ? 'Mengirim...' : 'Submit Progress'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Reject/Revision Modal */}
            <Modal
                isOpen={!!showApprovalModal}
                onClose={() => setShowApprovalModal(null)}
                title={showApprovalModal?.action === 'reject' ? 'Tolak Progress' : 'Minta Revisi'}
            >
                <form onSubmit={(e) => { e.preventDefault(); handleApproval(showApprovalModal.id, showApprovalModal.action); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            {showApprovalModal?.action === 'reject' ? 'Alasan Penolakan *' : 'Catatan Revisi *'}
                        </label>
                        <textarea
                            value={approvalForm.data.rejection_reason}
                            onChange={(e) => approvalForm.setData('rejection_reason', e.target.value)}
                            className="input-field min-h-[100px]"
                            required
                            placeholder={showApprovalModal?.action === 'reject' ? 'Jelaskan alasan penolakan...' : 'Jelaskan apa yang perlu direvisi...'}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowApprovalModal(null)} className="btn-secondary">Batal</button>
                        <button type="submit" className={showApprovalModal?.action === 'reject' ? 'btn-danger' : 'btn-warning'}>
                            {showApprovalModal?.action === 'reject' ? 'Tolak' : 'Minta Revisi'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

// ── Main Page ───────────────────────────────────────────
export default function ProjectShow({ project, users, canManage }) {
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [showMemberModal, setShowMemberModal] = useState(false);

    const taskForm = useForm({
        title: '', description: '', milestone_id: '', status: 'todo',
        priority: 'medium', weight: 1, due_date: '', assignees: [],
    });

    const editTaskForm = useForm({
        title: '', description: '', milestone_id: '', status: 'todo',
        priority: 'medium', weight: 1, due_date: '', assignees: [],
    });

    const milestoneForm = useForm({ title: '', description: '', due_date: '' });
    const editMilestoneForm = useForm({ title: '', description: '', due_date: '', status: 'pending' });
    const memberForm = useForm({ user_id: '', role: 'member' });

    const submitTask = (e) => {
        e.preventDefault();
        taskForm.post(`/projects/${project.id}/tasks`, {
            onSuccess: () => { setShowTaskModal(false); taskForm.reset(); },
        });
    };

    const openEditTask = (task) => {
        editTaskForm.setData({
            title: task.title || '',
            description: task.description || '',
            milestone_id: task.milestone_id || '',
            status: task.status || 'todo',
            priority: task.priority || 'medium',
            weight: task.weight || 1,
            due_date: task.due_date || '',
            assignees: task.assignees?.map(a => a.id) || [],
        });
        setEditingTask(task);
    };

    const submitEditTask = (e) => {
        e.preventDefault();
        editTaskForm.put(`/projects/${project.id}/tasks/${editingTask.id}`, {
            onSuccess: () => { setEditingTask(null); editTaskForm.reset(); },
        });
    };

    const handleDeleteTask = (task) => {
        if (!window.confirm(`Hapus task "${task.title}"?`)) return;
        router.delete(`/projects/${project.id}/tasks/${task.id}`);
    };

    const submitMilestone = (e) => {
        e.preventDefault();
        milestoneForm.post(`/projects/${project.id}/milestones`, {
            onSuccess: () => { setShowMilestoneModal(false); milestoneForm.reset(); },
        });
    };

    const openEditMilestone = (ms) => {
        editMilestoneForm.setData({
            title: ms.title || '',
            description: ms.description || '',
            due_date: ms.due_date || '',
            status: ms.status || 'pending',
        });
        setEditingMilestone(ms);
    };

    const submitEditMilestone = (e) => {
        e.preventDefault();
        editMilestoneForm.put(`/projects/${project.id}/milestones/${editingMilestone.id}`, {
            onSuccess: () => { setEditingMilestone(null); editMilestoneForm.reset(); },
        });
    };

    const handleDeleteMilestone = (ms) => {
        if (!window.confirm(`Hapus milestone "${ms.title}"?`)) return;
        router.delete(`/projects/${project.id}/milestones/${ms.id}`);
    };

    const submitMember = (e) => {
        e.preventDefault();
        memberForm.post(`/projects/${project.id}/members`, {
            onSuccess: () => { setShowMemberModal(false); memberForm.reset(); },
        });
    };

    // Tasks that are not assigned to any milestone
    const ungroupedTasks = project.tasks?.filter(t => !t.milestone_id) || [];

    return (
        <AuthenticatedLayout title={project.title}>
            <Head title={project.title} />

            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Back & Actions */}
                <div className="flex items-center justify-between">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-700 font-medium text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Projects
                    </Link>
                    {canManage && (
                        <div className="flex gap-2">
                            <Link href={`/projects/${project.id}/edit`} className="btn-secondary flex items-center gap-2 text-sm">
                                <Edit2 className="w-4 h-4" /> Edit Project
                            </Link>
                        </div>
                    )}
                </div>

                {/* Project Header Card */}
                <div className="glass-card p-6 sm:p-8 animate-fade-in-up">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap mb-2">
                                <h1 className="text-2xl font-extrabold text-slate-900">{project.title}</h1>
                                <span className={`badge badge-${project.status}`}>{project.status_label}</span>
                                <span className={`badge badge-${project.priority}`}>{project.priority_label}</span>
                            </div>
                            {project.description && (
                                <p className="text-slate-600 text-sm leading-relaxed mt-2">{project.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs sm:text-sm text-slate-500">
                                {project.creator && (
                                    <span>Dibuat oleh: <strong className="text-slate-800">{project.creator.name}</strong></span>
                                )}
                                {project.company_group && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                                        <Building2 className="w-3.5 h-3.5" />
                                        {project.company_group.name}
                                    </span>
                                )}
                                {project.start_date && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {project.start_date} s/d {project.end_date || '...'}
                                    </span>
                                )}
                                {project.budget && (
                                    <span>Budget: <strong className="text-slate-800">Rp {Number(project.budget).toLocaleString('id-ID')}</strong></span>
                                )}
                            </div>
                        </div>

                        {/* Overall Progress Circle */}
                        <div className="w-44 flex-shrink-0 self-center lg:self-start">
                            <div className="text-center">
                                <div className="relative w-28 h-28 mx-auto">
                                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                        <circle
                                            cx="50" cy="50" r="42" fill="none"
                                            stroke="url(#progressCircle)" strokeWidth="8"
                                            strokeDasharray={`${project.progress * 2.64} 264`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                        <defs>
                                            <linearGradient id="progressCircle" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#a855f7" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-extrabold text-slate-900">{project.progress.toFixed(0)}%</span>
                                    </div>
                                </div>
                                <p className="text-xs font-semibold text-slate-500 mt-2">Overall Progress</p>
                            </div>
                        </div>
                    </div>

                    {/* Task Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
                        {[
                            { label: 'To Do', count: project.task_stats?.todo || 0, color: 'text-slate-700', bg: 'bg-slate-50' },
                            { label: 'In Progress', count: project.task_stats?.in_progress || 0, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                            { label: 'Review', count: project.task_stats?.review || 0, color: 'text-amber-600', bg: 'bg-amber-50/50' },
                            { label: 'Completed', count: project.task_stats?.completed || 0, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                        ].map((stat) => (
                            <div key={stat.label} className={`text-center p-3 rounded-xl ${stat.bg} border border-slate-100`}>
                                <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.count}</p>
                                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Members */}
                <div className="glass-card p-6 animate-fade-in-up delay-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            Anggota Tim ({project.members?.length || 0})
                        </h3>
                        {canManage && (
                            <button
                                type="button"
                                onClick={() => setShowMemberModal(true)}
                                className="btn-secondary !px-3.5 !py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                                <UserPlus className="w-3.5 h-3.5" /> Tambah Anggota
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {project.members?.map((member) => (
                            <div key={member.id} className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                                    <p className="text-[11px] font-medium text-slate-500">
                                        {member.role === 'manager' ? 'Project Manager' : 'Member'}
                                    </p>
                                </div>
                                {canManage && (
                                    <Link
                                        href={`/projects/${project.id}/members/${member.id}`}
                                        method="delete"
                                        as="button"
                                        className="text-slate-400 hover:text-rose-600 ml-1 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                                        title="Hapus dari project"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Milestones */}
                <div className="glass-card p-6 animate-fade-in-up delay-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            Milestones ({project.milestones?.length || 0})
                        </h3>
                        {canManage && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowMilestoneModal(true)}
                                    className="btn-secondary !px-3.5 !py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Tambah Milestone
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(true)}
                                    className="btn-primary !px-3.5 !py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Tambah Task
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        {project.milestones?.length > 0 ? project.milestones.map((milestone) => (
                            <div key={milestone.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-bold text-slate-900">{milestone.title}</h4>
                                            <span className={`badge badge-${milestone.status} !text-[10px]`}>
                                                {milestone.status_label}
                                            </span>
                                            {milestone.due_date && (
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {milestone.due_date}
                                                </span>
                                            )}
                                        </div>
                                        {milestone.description && (
                                            <p className="text-xs text-slate-500 mt-1">{milestone.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-sm font-extrabold text-purple-700">
                                            {milestone.progress.toFixed(0)}%
                                        </span>
                                        {canManage && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditMilestone(milestone)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-white transition-colors cursor-pointer"
                                                    title="Edit Milestone"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteMilestone(milestone)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                                                    title="Hapus Milestone"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="progress-bar-container !h-2 mb-3">
                                    <div
                                        className="progress-bar-fill bg-gradient-to-r from-emerald-500 to-teal-500"
                                        style={{ width: `${milestone.progress}%` }}
                                    />
                                </div>
                                {milestone.tasks?.length > 0 ? (
                                    <div className="space-y-2.5 mt-3">
                                        {milestone.tasks.map((task) => (
                                            <TaskRow
                                                key={task.id}
                                                task={task}
                                                projectId={project.id}
                                                canManage={canManage}
                                                onEditTask={openEditTask}
                                                onDeleteTask={handleDeleteTask}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic mt-2">Belum ada task pada milestone ini.</p>
                                )}
                            </div>
                        )) : (
                            <p className="text-slate-500 text-sm">Belum ada milestone untuk project ini.</p>
                        )}
                    </div>
                </div>

                {/* Tasks Without Milestone (or All Tasks if no milestones exist) */}
                {(ungroupedTasks.length > 0 || (project.milestones?.length === 0)) && (
                    <div className="glass-card p-6 animate-fade-in-up delay-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                {project.milestones?.length > 0
                                    ? `Task Tanpa Milestone (${ungroupedTasks.length})`
                                    : `Daftar Tasks (${project.tasks?.length || 0})`}
                            </h3>
                            {canManage && (
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(true)}
                                    className="btn-primary !px-3.5 !py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Tambah Task
                                </button>
                            )}
                        </div>
                        <div className="space-y-2.5">
                            {ungroupedTasks.length > 0 ? ungroupedTasks.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    projectId={project.id}
                                    canManage={canManage}
                                    onEditTask={openEditTask}
                                    onDeleteTask={handleDeleteTask}
                                />
                            )) : (
                                <p className="text-slate-500 text-sm">Belum ada task.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Task Modal */}
            <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Tambah Task Baru">
                <form onSubmit={submitTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Judul Task *</label>
                        <input type="text" value={taskForm.data.title} onChange={(e) => taskForm.setData('title', e.target.value)} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
                        <textarea value={taskForm.data.description} onChange={(e) => taskForm.setData('description', e.target.value)} className="input-field min-h-[60px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Milestone</label>
                            <select value={taskForm.data.milestone_id} onChange={(e) => taskForm.setData('milestone_id', e.target.value)} className="input-field">
                                <option value="">Tanpa Milestone</option>
                                {project.milestones?.map(ms => <option key={ms.id} value={ms.id}>{ms.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Prioritas</label>
                            <select value={taskForm.data.priority} onChange={(e) => taskForm.setData('priority', e.target.value)} className="input-field">
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi</option>
                                <option value="critical">Kritis</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Bobot</label>
                            <input type="number" min="1" value={taskForm.data.weight} onChange={(e) => taskForm.setData('weight', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Deadline</label>
                            <input type="date" value={taskForm.data.due_date} onChange={(e) => taskForm.setData('due_date', e.target.value)} className="input-field" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Assign ke Anggota Tim</label>
                        <div className="max-h-36 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            {project.members?.map(m => (
                                <label key={m.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white cursor-pointer text-sm">
                                    <input
                                        type="checkbox"
                                        checked={taskForm.data.assignees.includes(m.id)}
                                        onChange={() => {
                                            const assignees = taskForm.data.assignees.includes(m.id)
                                                ? taskForm.data.assignees.filter(id => id !== m.id)
                                                : [...taskForm.data.assignees, m.id];
                                            taskForm.setData('assignees', assignees);
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-purple-600"
                                    />
                                    <span className="text-slate-800 font-medium">{m.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={taskForm.processing} className="btn-primary cursor-pointer">Tambah Task</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Task Modal */}
            <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
                <form onSubmit={submitEditTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Judul Task *</label>
                        <input type="text" value={editTaskForm.data.title} onChange={(e) => editTaskForm.setData('title', e.target.value)} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
                        <textarea value={editTaskForm.data.description} onChange={(e) => editTaskForm.setData('description', e.target.value)} className="input-field min-h-[60px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Milestone</label>
                            <select value={editTaskForm.data.milestone_id} onChange={(e) => editTaskForm.setData('milestone_id', e.target.value)} className="input-field">
                                <option value="">Tanpa Milestone</option>
                                {project.milestones?.map(ms => <option key={ms.id} value={ms.id}>{ms.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                            <select value={editTaskForm.data.status} onChange={(e) => editTaskForm.setData('status', e.target.value)} className="input-field">
                                <option value="todo">To Do</option>
                                <option value="in_progress">Dalam Proses</option>
                                <option value="review">Menunggu Review</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Prioritas</label>
                            <select value={editTaskForm.data.priority} onChange={(e) => editTaskForm.setData('priority', e.target.value)} className="input-field">
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi</option>
                                <option value="critical">Kritis</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Bobot</label>
                            <input type="number" min="1" value={editTaskForm.data.weight} onChange={(e) => editTaskForm.setData('weight', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Deadline</label>
                            <input type="date" value={editTaskForm.data.due_date} onChange={(e) => editTaskForm.setData('due_date', e.target.value)} className="input-field" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Assign ke Anggota Tim</label>
                        <div className="max-h-36 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            {project.members?.map(m => (
                                <label key={m.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white cursor-pointer text-sm">
                                    <input
                                        type="checkbox"
                                        checked={editTaskForm.data.assignees.includes(m.id)}
                                        onChange={() => {
                                            const assignees = editTaskForm.data.assignees.includes(m.id)
                                                ? editTaskForm.data.assignees.filter(id => id !== m.id)
                                                : [...editTaskForm.data.assignees, m.id];
                                            editTaskForm.setData('assignees', assignees);
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-purple-600"
                                    />
                                    <span className="text-slate-800 font-medium">{m.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setEditingTask(null)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={editTaskForm.processing} className="btn-primary cursor-pointer">Simpan Perubahan</button>
                    </div>
                </form>
            </Modal>

            {/* Add Milestone Modal */}
            <Modal isOpen={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Tambah Milestone">
                <form onSubmit={submitMilestone} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Judul *</label>
                        <input type="text" value={milestoneForm.data.title} onChange={(e) => milestoneForm.setData('title', e.target.value)} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
                        <textarea value={milestoneForm.data.description} onChange={(e) => milestoneForm.setData('description', e.target.value)} className="input-field min-h-[60px]" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Deadline</label>
                        <input type="date" value={milestoneForm.data.due_date} onChange={(e) => milestoneForm.setData('due_date', e.target.value)} className="input-field" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowMilestoneModal(false)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={milestoneForm.processing} className="btn-primary cursor-pointer">Tambah Milestone</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Milestone Modal */}
            <Modal isOpen={!!editingMilestone} onClose={() => setEditingMilestone(null)} title="Edit Milestone">
                <form onSubmit={submitEditMilestone} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Judul *</label>
                        <input type="text" value={editMilestoneForm.data.title} onChange={(e) => editMilestoneForm.setData('title', e.target.value)} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
                        <textarea value={editMilestoneForm.data.description} onChange={(e) => editMilestoneForm.setData('description', e.target.value)} className="input-field min-h-[60px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                            <select value={editMilestoneForm.data.status} onChange={(e) => editMilestoneForm.setData('status', e.target.value)} className="input-field">
                                <option value="pending">Menunggu</option>
                                <option value="in_progress">Berjalan</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Deadline</label>
                            <input type="date" value={editMilestoneForm.data.due_date} onChange={(e) => editMilestoneForm.setData('due_date', e.target.value)} className="input-field" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setEditingMilestone(null)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={editMilestoneForm.processing} className="btn-primary cursor-pointer">Simpan Perubahan</button>
                    </div>
                </form>
            </Modal>

            {/* Add Member Modal */}
            <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Tambah Anggota Tim (Satu Grup Perusahaan)">
                <form onSubmit={submitMember} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            User {project.company_group ? `— ${project.company_group.name} (${project.company_group.group_code})` : ''}
                        </label>
                        <select value={memberForm.data.user_id} onChange={(e) => memberForm.setData('user_id', e.target.value)} className="input-field" required>
                            <option value="">Pilih user dari grup Anda...</option>
                            {users?.filter(u => !project.members?.find(m => m.id === u.id)).map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                        {memberForm.errors.user_id && (
                            <p className="mt-1 text-xs text-rose-600">{memberForm.errors.user_id}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Role di Project</label>
                        <select value={memberForm.data.role} onChange={(e) => memberForm.setData('role', e.target.value)} className="input-field">
                            <option value="member">Member</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowMemberModal(false)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={memberForm.processing} className="btn-primary cursor-pointer">Tambah</button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
