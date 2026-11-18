import { Head, router, useForm, usePage } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { useState } from 'react';
import {
    UserPlus, Pencil, Trash2, Search, Filter,
    X, Shield, Building2, Mail, Calendar,
    ChevronDown, Users as UsersIcon, Plus, Check,
} from 'lucide-react';

/* ── Reusable Modal ─────────────────────────────────── */
const Modal = ({ isOpen, onClose, title, children, maxWidth = '540px' }) => {
    if (!isOpen || typeof document === 'undefined') return null;

    const handleBackdropMouseDown = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div className="modal-overlay animate-fade-in" onMouseDown={handleBackdropMouseDown}>
            <div className="modal-content animate-fade-in-up" style={{ maxWidth }}>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
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

/* ── Role Color Mapping (Icon Gradient Palette) ───────── */
const roleColors = {
    admin:           'from-fuchsia-600 via-purple-600 to-cyan-600',
    direktur:        'from-purple-700 to-indigo-800',
    wakil_direktur:  'from-purple-600 to-cyan-700',
    kepala_bidang:   'from-fuchsia-500 to-purple-600',
    kepala_unit:     'from-cyan-600 to-teal-600',
    project_manager: 'from-purple-500 to-cyan-500',
    member:          'from-slate-500 to-slate-700',
};

const roleBadgeColors = {
    admin:           'bg-purple-50 text-purple-800 border-purple-200',
    direktur:        'bg-slate-100 text-slate-800 border-slate-300',
    wakil_direktur:  'bg-purple-50 text-purple-700 border-purple-200',
    kepala_bidang:   'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    kepala_unit:     'bg-cyan-50 text-cyan-700 border-cyan-200',
    project_manager: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    member:          'bg-slate-50 text-slate-600 border-slate-200',
};

const levelBadgeColors = {
    direktorat: 'bg-purple-50 text-purple-700 border-purple-200',
    bidang:     'bg-indigo-50 text-indigo-700 border-indigo-200',
    unit:       'bg-cyan-50 text-cyan-700 border-cyan-200',
};

const levelLabels = {
    direktorat: 'Direktorat',
    bidang:     'Bidang / Divisi',
    unit:       'Unit / Tim',
};

/* ── User Form Fields ──── */
const UserFormFields = ({ form, roles, units, isEdit = false, onOpenUnitModal }) => (
    <div className="space-y-4">
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap *</label>
            <input
                type="text"
                className="input-field"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
            />
            {form.errors.name && <p className="text-rose-600 text-xs mt-1">{form.errors.name}</p>}
        </div>

        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
            <input
                type="email"
                className="input-field"
                value={form.data.email}
                onChange={(e) => form.setData('email', e.target.value)}
                placeholder="email@example.com"
                required
            />
            {form.errors.email && <p className="text-rose-600 text-xs mt-1">{form.errors.email}</p>}
        </div>

        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password {isEdit ? '(kosongkan jika tidak diubah)' : '*'}
            </label>
            <input
                type="password"
                className="input-field"
                value={form.data.password}
                onChange={(e) => form.setData('password', e.target.value)}
                placeholder={isEdit ? '••••••••' : 'Minimal 6 karakter'}
                required={!isEdit}
            />
            {form.errors.password && <p className="text-rose-600 text-xs mt-1">{form.errors.password}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role *</label>
                <div className="relative">
                    <select
                        className="input-field appearance-none pr-10 cursor-pointer"
                        value={form.data.role}
                        onChange={(e) => form.setData('role', e.target.value)}
                        required
                    >
                        {roles.map((r) => (
                            <option key={r.value} value={r.value} className="bg-white text-slate-800">{r.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {form.errors.role && <p className="text-rose-600 text-xs mt-1">{form.errors.role}</p>}
            </div>

            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Unit Kerja</label>
                    <button
                        type="button"
                        onClick={onOpenUnitModal}
                        className="text-xs font-semibold text-purple-600 hover:text-purple-800 inline-flex items-center gap-0.5 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" /> Buat Unit
                    </button>
                </div>
                <div className="relative">
                    <select
                        className="input-field appearance-none pr-10 cursor-pointer"
                        value={form.data.unit_id}
                        onChange={(e) => form.setData('unit_id', e.target.value)}
                    >
                        <option value="" className="bg-white text-slate-800">
                            {units.length > 0 ? '— Tidak ada —' : '— Belum ada unit (Klik + Buat Unit) —'}
                        </option>
                        {units.map((u) => (
                            <option key={u.id} value={u.id} className="bg-white text-slate-800">
                                {u.name} ({levelLabels[u.level] || u.level})
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {form.errors.unit_id && <p className="text-rose-600 text-xs mt-1">{form.errors.unit_id}</p>}
            </div>
        </div>
    </div>
);

export default function UsersIndex({ users, units, roles, filters }) {
    const { auth } = usePage().props;
    const companyGroup = auth.user?.company_group;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);

    const [searchValue, setSearchValue] = useState(filters?.search || '');
    const [filterRole, setFilterRole] = useState(filters?.role || '');
    const [filterUnit, setFilterUnit] = useState(filters?.unit_id || '');

    /* ── Create User Form ─────────────────────────────── */
    const createForm = useForm({
        name: '', email: '', password: '', role: 'member', unit_id: '',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post('/users', {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    /* ── Edit User Form ───────────────────────────────── */
    const editForm = useForm({
        name: '', email: '', password: '', role: '', unit_id: '',
    });

    const openEdit = (user) => {
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            unit_id: user.unit?.id || '',
        });
        setEditingUser(user);
    };

    const handleEdit = (e) => {
        e.preventDefault();
        editForm.put(`/users/${editingUser.id}`, {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    /* ── Delete User ──────────────────────────────────── */
    const handleDelete = () => {
        router.delete(`/users/${deletingUser.id}`, {
            onSuccess: () => setDeletingUser(null),
        });
    };

    /* ── Unit Create / Edit Form ──────────────────────── */
    const unitForm = useForm({
        name: '',
        level: 'unit',
        parent_id: '',
        description: '',
    });

    const startEditUnit = (unit) => {
        setEditingUnit(unit);
        unitForm.setData({
            name: unit.name || '',
            level: unit.level || 'unit',
            parent_id: unit.parent_id || '',
            description: unit.description || '',
        });
    };

    const cancelEditUnit = () => {
        setEditingUnit(null);
        unitForm.reset();
    };

    const handleUnitSubmit = (e) => {
        e.preventDefault();
        if (editingUnit) {
            unitForm.put(`/units/${editingUnit.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingUnit(null);
                    unitForm.reset();
                },
            });
        } else {
            unitForm.post('/units', {
                preserveScroll: true,
                onSuccess: () => {
                    unitForm.reset();
                },
            });
        }
    };

    const handleDeleteUnit = (unit) => {
        if (!window.confirm(`Hapus unit "${unit.name}"? User yang berada di unit ini tidak akan terhapus.`)) return;
        router.delete(`/units/${unit.id}`, { preserveScroll: true });
    };

    /* ── Search / Filter ──────────────────────────────── */
    const applyFilters = () => {
        router.get('/users', {
            search: searchValue || undefined,
            role: filterRole || undefined,
            unit_id: filterUnit || undefined,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearchValue('');
        setFilterRole('');
        setFilterUnit('');
        router.get('/users', {}, { preserveState: true, replace: true });
    };

    const hasFilters = searchValue || filterRole || filterUnit;

    return (
        <AuthenticatedLayout title="User & Unit Management">
            <Head title="User & Unit Management" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">
                            User & Unit Management
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Kelola anggota tim, jabatan, dan struktur unit kerja untuk {companyGroup ? <strong>{companyGroup.name}</strong> : 'grup perusahaan Anda'}.
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 self-start">
                        <button
                            type="button"
                            onClick={() => {
                                cancelEditUnit();
                                setShowUnitModal(true);
                            }}
                            className="btn-secondary flex items-center gap-2 text-sm cursor-pointer"
                        >
                            <Building2 className="w-4 h-4 text-purple-600" />
                            <span>Kelola Unit ({units.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary flex items-center gap-2 text-sm cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Tambah User</span>
                        </button>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="glass-card p-4">
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                className="input-field !pl-11"
                                placeholder="Cari nama atau email..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="relative">
                                <select
                                    className="input-field appearance-none pr-10 min-w-[160px] cursor-pointer"
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                >
                                    <option value="">Semua Role</option>
                                    {roles.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select
                                    className="input-field appearance-none pr-10 min-w-[160px] cursor-pointer"
                                    value={filterUnit}
                                    onChange={(e) => setFilterUnit(e.target.value)}
                                >
                                    <option value="">Semua Unit</option>
                                    {units.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            <button onClick={applyFilters} className="btn-primary !px-4 flex items-center gap-2 cursor-pointer">
                                <Filter className="w-4 h-4" /> Filter
                            </button>

                            {hasFilters && (
                                <button onClick={clearFilters} className="btn-secondary !px-4 flex items-center gap-2 cursor-pointer">
                                    <X className="w-4 h-4" /> Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                {users.data?.length > 0 ? (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Kerja</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Terdaftar</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.data.map((user, index) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors animate-fade-in-up" style={{ animationDelay: `${index * 0.03}s` }}>
                                            {/* Avatar + Name + Email */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[user.role] || 'from-slate-500 to-slate-600'} flex items-center justify-center text-white text-sm font-bold shadow-xs flex-shrink-0`}>
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <Mail className="w-3 h-3" />
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role Badge */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadgeColors[user.role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                    <Shield className="w-3 h-3" />
                                                    {user.role_label}
                                                </span>
                                            </td>

                                            {/* Unit */}
                                            <td className="px-6 py-4">
                                                {user.unit ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                                                        <Building2 className="w-3.5 h-3.5 text-purple-600" />
                                                        {user.unit.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Belum diatur</span>
                                                )}
                                            </td>

                                            {/* Created Date */}
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {user.created_at}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(user)}
                                                        className="p-2 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-all cursor-pointer"
                                                        title="Edit user"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingUser(user)}
                                                        className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                                        title="Hapus user"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                                <p className="text-sm text-slate-500">
                                    Menampilkan {users.from}–{users.to} dari {users.total} user
                                </p>
                                <div className="flex items-center gap-1">
                                    {users.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            disabled={!link.url}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                                link.active
                                                    ? 'bg-purple-600 text-white'
                                                    : link.url
                                                        ? 'text-slate-700 hover:bg-slate-100'
                                                        : 'text-slate-300 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="glass-card p-16 text-center">
                        <UsersIcon className="w-14 h-14 text-purple-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-900">Tidak ada user ditemukan</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {hasFilters ? 'Coba ubah filter pencarian Anda' : 'Klik "Tambah User" untuk menambahkan anggota baru'}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Create User Modal ─────────────────────────────── */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tambah User Baru">
                <form onSubmit={handleCreate} className="space-y-5">
                    <UserFormFields
                        form={createForm}
                        roles={roles}
                        units={units}
                        onOpenUnitModal={() => {
                            setShowCreateModal(false);
                            setShowUnitModal(true);
                        }}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={createForm.processing} className="btn-primary flex items-center gap-2 cursor-pointer">
                            <UserPlus className="w-4 h-4" />
                            {createForm.processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Edit User Modal ───────────────────────────────── */}
            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User">
                <form onSubmit={handleEdit} className="space-y-5">
                    <UserFormFields
                        form={editForm}
                        roles={roles}
                        units={units}
                        isEdit
                        onOpenUnitModal={() => {
                            setEditingUser(null);
                            setShowUnitModal(true);
                        }}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={editForm.processing} className="btn-primary flex items-center gap-2 cursor-pointer">
                            <Pencil className="w-4 h-4" />
                            {editForm.processing ? 'Menyimpan...' : 'Perbarui'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Delete User Confirmation Modal ─────────────────── */}
            <Modal isOpen={!!deletingUser} onClose={() => setDeletingUser(null)} title="Konfirmasi Hapus User">
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                        <p className="text-sm text-slate-700">
                            Apakah Anda yakin ingin menghapus user <strong className="text-slate-900">{deletingUser?.name}</strong>?
                            Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeletingUser(null)} className="btn-secondary">Batal</button>
                        <button onClick={handleDelete} className="btn-danger flex items-center gap-2 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                            Hapus User
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Kelola Unit Perusahaan Modal ───────────────────── */}
            <Modal
                isOpen={showUnitModal}
                onClose={() => {
                    setShowUnitModal(false);
                    cancelEditUnit();
                }}
                title={`Kelola Unit Kerja ${companyGroup ? `— ${companyGroup.name}` : ''}`}
                maxWidth="620px"
            >
                <div className="space-y-6">
                    {/* Form Buat / Edit Unit */}
                    <form onSubmit={handleUnitSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900">
                                {editingUnit ? `Edit Unit: ${editingUnit.name}` : 'Tambah Unit Baru'}
                            </h4>
                            {editingUnit && (
                                <button
                                    type="button"
                                    onClick={cancelEditUnit}
                                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                                >
                                    Batal Edit
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Nama Unit / Divisi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={unitForm.data.name}
                                    onChange={(e) => unitForm.setData('name', e.target.value)}
                                    className="input-field !py-2 text-sm"
                                    placeholder="Contoh: Divisi IT & Digital"
                                    required
                                />
                                {unitForm.errors.name && (
                                    <p className="text-xs text-rose-600 mt-1">{unitForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Tingkatan (Level) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={unitForm.data.level}
                                    onChange={(e) => unitForm.setData('level', e.target.value)}
                                    className="input-field !py-2 text-sm"
                                >
                                    <option value="direktorat">Direktorat</option>
                                    <option value="bidang">Bidang / Divisi</option>
                                    <option value="unit">Unit / Tim</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Unit Induk / Atasan (Opsional)
                            </label>
                            <select
                                value={unitForm.data.parent_id}
                                onChange={(e) => unitForm.setData('parent_id', e.target.value)}
                                className="input-field !py-2 text-sm"
                            >
                                <option value="">— Tidak ada (Unit Tingkat Atas) —</option>
                                {units
                                    .filter((u) => !editingUnit || u.id !== editingUnit.id)
                                    .map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({levelLabels[u.level] || u.level})
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={unitForm.processing}
                                className="btn-primary !px-4 !py-2 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                            >
                                {editingUnit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                <span>{unitForm.processing ? 'Menyimpan...' : editingUnit ? 'Simpan Perubahan Unit' : 'Tambah Unit'}</span>
                            </button>
                        </div>
                    </form>

                    {/* Daftar Unit di Workspace Ini */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                            Daftar Unit di Workspace Anda ({units.length})
                        </h4>
                        {units.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
                                {units.map((unit) => {
                                    const parentUnit = units.find((p) => p.id === unit.parent_id);
                                    return (
                                        <div key={unit.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-bold text-slate-900">{unit.name}</p>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${levelBadgeColors[unit.level] || 'bg-slate-100 text-slate-600'}`}>
                                                        {levelLabels[unit.level] || unit.level}
                                                    </span>
                                                    <code className="text-[10px] font-mono text-slate-400">{unit.code}</code>
                                                </div>
                                                {parentUnit && (
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Induk: <span className="font-medium text-slate-700">{parentUnit.name}</span>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditUnit(unit)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                                                    title="Edit Unit"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteUnit(unit)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                    title="Hapus Unit"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                                Belum ada unit kerja yang dibuat di grup perusahaan ini. Silakan tambahkan unit kerja melalui form di atas.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
