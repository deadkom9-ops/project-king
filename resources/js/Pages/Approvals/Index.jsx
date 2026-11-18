import { Head, Link, router, useForm } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { useState } from 'react';
import {
    CheckCircle2, XCircle, RotateCcw, FileText, Image,
    ExternalLink, X, ChevronRight,
} from 'lucide-react';

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

export default function ApprovalsIndex({ pendingUpdates }) {
    const [actionModal, setActionModal] = useState(null);
    const actionForm = useForm({ rejection_reason: '' });

    const handleApprove = (id) => {
        router.post(`/progress/${id}/approve`);
    };

    const handleAction = (e) => {
        e.preventDefault();
        actionForm.post(`/progress/${actionModal.id}/${actionModal.action}`, {
            onSuccess: () => { setActionModal(null); actionForm.reset(); },
        });
    };

    return (
        <AuthenticatedLayout title="Approvals">
            <Head title="Approvals" />

            <div className="space-y-6 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Pending Approvals</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Review dan setujui laporan progress yang diajukan oleh anggota tim grup perusahaan Anda.
                    </p>
                </div>

                {pendingUpdates.data?.length > 0 ? (
                    <div className="space-y-3">
                        {pendingUpdates.data.map((update, index) => (
                            <div key={update.id} className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <Link
                                                href={`/projects/${update.project.id}`}
                                                className="text-base font-bold text-slate-900 hover:text-purple-700 truncate transition-colors"
                                            >
                                                {update.task.title}
                                            </Link>
                                            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            <span className="text-sm font-semibold text-purple-600 truncate">
                                                {update.project.title}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
                                            <span>Oleh: <strong className="text-slate-800">{update.submitter.name}</strong></span>
                                            <span>•</span>
                                            <span>{update.created_at_human}</span>
                                        </div>

                                        {/* Progress comparison */}
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-slate-500">Sebelum:</span>
                                                <span className="text-sm font-semibold text-slate-600">{update.task.current_progress}%</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-slate-500">Diajukan:</span>
                                                <span className="text-sm font-extrabold text-emerald-600">{update.percentage}%</span>
                                            </div>
                                            <div className="flex-1 max-w-[200px]">
                                                <div className="progress-bar-container !h-2">
                                                    <div
                                                        className="progress-bar-fill bg-gradient-to-r from-emerald-500 to-teal-500"
                                                        style={{ width: `${update.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {update.notes && (
                                            <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl p-3 mt-3 whitespace-pre-wrap">
                                                {update.notes}
                                            </p>
                                        )}

                                        {update.file_name && (
                                            <a
                                                href={update.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                                            >
                                                {update.file_name.endsWith('.pdf') ? <FileText className="w-3.5 h-3.5" /> : <Image className="w-3.5 h-3.5" />}
                                                <span>{update.file_name}</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleApprove(update.id)}
                                            className="btn-success !px-4 !py-2 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Approve
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActionModal({ id: update.id, action: 'revision' })}
                                            className="btn-warning !px-4 !py-2 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <RotateCcw className="w-4 h-4" /> Revisi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActionModal({ id: update.id, action: 'reject' })}
                                            className="btn-danger !px-4 !py-2 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-16 text-center">
                        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3 opacity-80" />
                        <h3 className="text-base font-bold text-slate-900">Semua progress telah di-review</h3>
                        <p className="text-sm text-slate-500 mt-1">Tidak ada pengajuan progress yang menunggu approval saat ini.</p>
                    </div>
                )}

                {/* Pagination */}
                {pendingUpdates.links && pendingUpdates.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1.5">
                        {pendingUpdates.links.map((link, index) => (
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
                        ))}
                    </div>
                )}
            </div>

            {/* Reject / Revision Modal */}
            <Modal
                isOpen={!!actionModal}
                onClose={() => setActionModal(null)}
                title={actionModal?.action === 'reject' ? 'Tolak Progress' : 'Minta Revisi'}
            >
                <form onSubmit={handleAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            {actionModal?.action === 'reject' ? 'Alasan Penolakan *' : 'Catatan Revisi *'}
                        </label>
                        <textarea
                            value={actionForm.data.rejection_reason}
                            onChange={(e) => actionForm.setData('rejection_reason', e.target.value)}
                            className="input-field min-h-[120px]"
                            required
                            placeholder={actionModal?.action === 'reject' ? 'Jelaskan alasan penolakan...' : 'Jelaskan apa yang perlu diperbaiki...'}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setActionModal(null)} className="btn-secondary">Batal</button>
                        <button
                            type="submit"
                            disabled={actionForm.processing}
                            className={actionModal?.action === 'reject' ? 'btn-danger cursor-pointer' : 'btn-warning cursor-pointer'}
                        >
                            {actionModal?.action === 'reject' ? 'Tolak' : 'Minta Revisi'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
