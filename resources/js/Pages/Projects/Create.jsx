import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Save, ArrowLeft, Building2 } from 'lucide-react';

export default function ProjectCreate({ users }) {
    const { auth } = usePage().props;
    const companyGroup = auth.user?.company_group;

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'draft',
        priority: 'medium',
        budget: '',
        members: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post('/projects');
    };

    const toggleMember = (userId) => {
        setData('members', data.members.includes(userId)
            ? data.members.filter(id => id !== userId)
            : [...data.members, userId]
        );
    };

    return (
        <AuthenticatedLayout title="Buat Project">
            <Head title="Buat Project Baru" />

            <div className="max-w-4xl mx-auto">
                <Link href="/projects" className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-700 font-medium text-sm transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Daftar Projects
                </Link>

                <div className="glass-card p-6 sm:p-8 animate-fade-in-up">
                    <div className="mb-8 pb-4 border-b border-slate-100">
                        <h2 className="text-2xl font-extrabold text-slate-900">Buat Project Baru</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Isi rincian project dan pilih anggota tim dari grup perusahaan Anda.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Project <span className="text-rose-500">*</span></label>
                            <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className="input-field" placeholder="Nama project" required />
                            {errors.title && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="input-field min-h-[120px] resize-y" placeholder="Deskripsi tujuan dan ruang lingkup project..." />
                        </div>

                        {/* Dates Row */}
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

                        {/* Status, Priority & Budget */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="input-field">
                                    <option value="draft">Draft</option>
                                    <option value="active">Aktif</option>
                                    <option value="on_hold">Ditunda</option>
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
                                <input type="number" value={data.budget} onChange={(e) => setData('budget', e.target.value)} className="input-field" placeholder="0" min="0" />
                            </div>
                        </div>

                        {/* Members */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Anggota Tim {companyGroup ? `(${companyGroup.name})` : ''}
                                </label>
                                {companyGroup && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                        <Building2 className="w-3 h-3" />
                                        {companyGroup.group_code}
                                    </span>
                                )}
                            </div>
                            {users.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    {users.map((user) => (
                                        <label key={user.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-purple-300 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={data.members.includes(user.id)}
                                                onChange={() => toggleMember(user.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-sm text-slate-600">
                                    Belum ada anggota lain di grup ini. Bagikan Kode ID Grup <code className="font-mono font-bold text-purple-700">{companyGroup?.group_code}</code> kepada rekan perusahaan Anda.
                                </div>
                            )}
                            {errors.members && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.members}</p>}
                        </div>

                        {/* Submit */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link href="/projects" className="btn-secondary">Batal</Link>
                            <button type="submit" disabled={processing} className="btn-primary flex items-center gap-2 cursor-pointer">
                                <Save className="w-4 h-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
