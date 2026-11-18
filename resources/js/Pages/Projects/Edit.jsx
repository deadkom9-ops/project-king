import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Save, ArrowLeft } from 'lucide-react';

export default function ProjectEdit({ project }) {
    const { data, setData, put, processing, errors } = useForm({
        title: project.title || '',
        description: project.description || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        status: project.status || 'draft',
        priority: project.priority || 'medium',
        budget: project.budget || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/projects/${project.id}`);
    };

    return (
        <AuthenticatedLayout title="Edit Project">
            <Head title="Edit Project" />

            <div className="max-w-4xl mx-auto">
                <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-700 font-medium text-sm transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Detail Project
                </Link>

                <div className="glass-card p-6 sm:p-8 animate-fade-in-up">
                    <div className="mb-8 pb-4 border-b border-slate-100">
                        <h2 className="text-2xl font-extrabold text-slate-900">Edit Project</h2>
                        <p className="text-sm text-slate-500 mt-1">Perbarui informasi, jadwal, atau status project.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Project <span className="text-rose-500">*</span></label>
                            <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className="input-field" required />
                            {errors.title && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="input-field min-h-[120px] resize-y" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Mulai</label>
                                <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Selesai</label>
                                <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} className="input-field" />
                                {errors.end_date && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.end_date}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="input-field">
                                    <option value="draft">Draft</option>
                                    <option value="active">Aktif</option>
                                    <option value="on_hold">Ditunda</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Prioritas</label>
                                <select value={data.priority} onChange={(e) => setData('priority', e.target.value)} className="input-field">
                                    <option value="low">Rendah</option>
                                    <option value="medium">Sedang</option>
                                    <option value="high">Tinggi</option>
                                    <option value="critical">Kritis</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Anggaran (Rp)</label>
                                <input type="number" value={data.budget} onChange={(e) => setData('budget', e.target.value)} className="input-field" min="0" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link href={`/projects/${project.id}`} className="btn-secondary">Batal</Link>
                            <button type="submit" disabled={processing} className="btn-primary flex items-center gap-2 cursor-pointer">
                                <Save className="w-4 h-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
