import { Link, usePage, useForm } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    Bell,
    LogOut,
    Menu,
    X,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Building2,
    Copy,
    Check,
    KeyRound,
    Plus,
} from 'lucide-react';

export default function AuthenticatedLayout({ children, title }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showFlash, setShowFlash] = useState(true);
    const [copiedCode, setCopiedCode] = useState(false);
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [groupModalTab, setGroupModalTab] = useState('create'); // 'create' | 'join'

    const createGroupForm = useForm({ name: '' });
    const joinGroupForm = useForm({ group_code: '' });

    const companyGroup = auth.user?.company_group;

    const handleCopyGroupCode = () => {
        if (!companyGroup?.group_code) return;
        navigator.clipboard.writeText(companyGroup.group_code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const submitCreateGroup = (e) => {
        e.preventDefault();
        createGroupForm.post('/company-groups', {
            onSuccess: () => {
                setGroupModalOpen(false);
                createGroupForm.reset();
            },
        });
    };

    const submitJoinGroup = (e) => {
        e.preventDefault();
        joinGroupForm.post('/company-groups/join', {
            onSuccess: () => {
                setGroupModalOpen(false);
                joinGroupForm.reset();
            },
        });
    };

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlash(true);
        }
    }, [flash]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (e) {
            // silently fail
        }
    };

    const markAsRead = async (id) => {
        await fetch(`/api/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
        });
        fetchNotifications();
    };

    const markAllRead = async () => {
        await fetch('/api/notifications/read-all', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
        });
        fetchNotifications();
    };

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/projects', label: 'Projects', icon: FolderKanban },
        {
            href: '/approvals',
            label: 'Approvals',
            icon: CheckSquare,
            roles: ['admin', 'project_manager', 'kepala_unit', 'kepala_bidang', 'wakil_direktur', 'direktur'],
        },
        { href: '/users', label: 'Users', icon: Users, roles: ['admin'] },
    ];

    const filteredNav = navItems.filter((item) => {
        if (!item.roles) return true;
        if (item.href === '/users' && auth.user?.company_group?.is_owner) return true;
        return item.roles.includes(auth.user?.role);
    });

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col bg-white border-r border-slate-200/90 shadow-sm transform transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                    <div className="p-1.5 rounded-xl bg-purple-50 border border-purple-100 shadow-2xs">
                        <img
                            src="/img/process_icon.png"
                            alt="Project Management"
                            className="w-8 h-8 object-contain"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                            Project Management
                        </h1>
                        <p className="text-[11px] font-semibold text-purple-600 tracking-wider uppercase">
                            Monitoring System
                        </p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded-lg lg:hidden text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        aria-label="Tutup menu navigasi"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                    {/* Company Group / Workspace Card */}
                    <div className="mx-1 mb-4 p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/90 via-indigo-50/60 to-cyan-50/50 border border-purple-100/90 shadow-2xs">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-700">
                                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                                Grup Perusahaan
                            </span>
                            {!companyGroup && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setGroupModalTab('create');
                                        setGroupModalOpen(true);
                                    }}
                                    className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 underline cursor-pointer"
                                >
                                    Setup Grup
                                </button>
                            )}
                        </div>

                        {companyGroup ? (
                            <div>
                                <p className="text-sm font-extrabold text-slate-900 truncate">
                                    {companyGroup.name}
                                </p>
                                <div className="mt-2 flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-purple-200/80 shadow-2xs">
                                    <code className="text-xs font-mono font-bold text-purple-800 tracking-wider truncate">
                                        {companyGroup.group_code}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={handleCopyGroupCode}
                                        className="p-1 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors shrink-0 cursor-pointer"
                                        title="Salin Kode ID Grup"
                                        aria-label="Salin Kode ID Grup"
                                    >
                                        {copiedCode ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                                    Bagikan kode ini agar rekan 1 perusahaan dapat bergabung.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-1">
                                <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                                    Anda belum tergabung di grup perusahaan mana pun.
                                </p>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGroupModalTab('create');
                                            setGroupModalOpen(true);
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Buat Grup
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGroupModalTab('join');
                                            setGroupModalOpen(true);
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-white border border-purple-200 hover:bg-purple-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                        <KeyRound className="w-3.5 h-3.5" />
                                        Gabung
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Menu Utama
                    </div>
                    {filteredNav.map((item) => {
                        const isActive =
                            currentPath === item.href ||
                            (item.href !== '/' && currentPath.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                    isActive
                                        ? 'bg-purple-50 text-purple-700 shadow-2xs border border-purple-100/80'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                }`}
                            >
                                <item.icon
                                    className={`w-4.5 h-4.5 shrink-0 ${
                                        isActive ? 'text-purple-600' : 'text-slate-400'
                                    }`}
                                />
                                <span className="flex-1">{item.label}</span>
                                {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User info & Logout */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/60">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-2xs shrink-0">
                            {auth.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                                {auth.user?.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate capitalize">
                                {auth.user?.role_label || auth.user?.role?.replace('_', ' ')}
                            </p>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                            title="Keluar dari akun"
                            aria-label="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                {/* Header */}
                <header className="relative z-30 flex items-center justify-between px-6 py-3.5 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-1.5 rounded-lg lg:hidden text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            aria-label="Buka menu navigasi"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        {title && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                                    Project Management
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
                                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className={`relative p-2 rounded-xl transition-all ${
                                    notifOpen
                                        ? 'bg-purple-50 text-purple-700'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                                aria-label="Notifikasi"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setNotifOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl overflow-hidden z-50 animate-fade-in shadow-xl border border-slate-200/90">
                                        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/80">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">
                                                    Notifikasi
                                                </span>
                                                {unreadCount > 0 && (
                                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                                                        {unreadCount} baru
                                                    </span>
                                                )}
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllRead}
                                                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
                                                >
                                                    Tandai semua dibaca
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-84 overflow-y-auto divide-y divide-slate-100">
                                            {notifications.length === 0 ? (
                                                <div className="py-10 text-center px-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                                                        <Bell className="w-5 h-5" />
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-700">
                                                        Tidak ada notifikasi baru
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Semua update project Anda akan muncul di sini.
                                                    </p>
                                                </div>
                                            ) : (
                                                notifications.slice(0, 10).map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() => markAsRead(notif.id)}
                                                        className={`p-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                                                            !notif.read_at ? 'bg-purple-50/40' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-2.5">
                                                            {!notif.read_at && (
                                                                <span className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                                                                    {notif.data?.message}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400 mt-1">
                                                                    {notif.created_at}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {showFlash && flash?.success && (
                    <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-2xs animate-fade-in">
                        <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                            <span className="font-medium">{flash.success}</span>
                        </div>
                        <button
                            onClick={() => setShowFlash(false)}
                            className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {showFlash && flash?.error && (
                    <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-2xs animate-fade-in">
                        <div className="flex items-center gap-2.5">
                            <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                            <span className="font-medium">{flash.error}</span>
                        </div>
                        <button
                            onClick={() => setShowFlash(false)}
                            className="p-1 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Page Content Container */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Modal Buat / Gabung Grup Perusahaan */}
            {groupModalOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) setGroupModalOpen(false);
                        }}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200/90 animate-fade-in-up">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">
                                            Grup Perusahaan (Workspace)
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Isolasi project & tim khusus perusahaan Anda
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setGroupModalOpen(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mt-4">
                                <button
                                    type="button"
                                    onClick={() => setGroupModalTab('create')}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        groupModalTab === 'create'
                                            ? 'bg-white text-purple-700 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Buat Grup Baru
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGroupModalTab('join')}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        groupModalTab === 'join'
                                            ? 'bg-white text-purple-700 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Gabung Pakai Kode
                                </button>
                            </div>

                            {groupModalTab === 'create' ? (
                                <form onSubmit={submitCreateGroup} className="mt-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Nama Perusahaan / Grup <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={createGroupForm.data.name}
                                            onChange={(e) => createGroupForm.setData('name', e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-xl text-sm text-slate-900 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                                            placeholder="Contoh: PT Maju Bersama"
                                            required
                                        />
                                        {createGroupForm.errors.name && (
                                            <p className="mt-1.5 text-xs text-rose-600 font-medium">
                                                {createGroupForm.errors.name}
                                            </p>
                                        )}
                                        <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                                            <p className="font-semibold text-slate-800">
                                                Preview Format ID Grup Anda:
                                            </p>
                                            <p className="font-mono font-bold text-purple-700">
                                                {(createGroupForm.data.name
                                                    ? createGroupForm.data.name
                                                          .trim()
                                                          .toUpperCase()
                                                          .replace(/[^A-Z0-9]+/g, '-')
                                                          .replace(/^-|-$/g, '')
                                                    : 'NAMA-GRUP') + '-XXXXXX'}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                *6 digit terakhir (huruf & angka acak) akan digenerate otomatis oleh sistem.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2.5 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setGroupModalOpen(false)}
                                            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createGroupForm.processing}
                                            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 cursor-pointer"
                                        >
                                            {createGroupForm.processing ? 'Membuat...' : 'Buat Grup & Dapatkan ID'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={submitJoinGroup} className="mt-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Kode ID Grup <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={joinGroupForm.data.group_code}
                                            onChange={(e) =>
                                                joinGroupForm.setData('group_code', e.target.value.toUpperCase())
                                            }
                                            className="w-full h-11 px-3.5 rounded-xl text-sm font-mono uppercase tracking-wider text-slate-900 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                                            placeholder="Contoh: PT-MAJU-BERSAMA-A7X9K2"
                                            required
                                        />
                                        {joinGroupForm.errors.group_code && (
                                            <p className="mt-1.5 text-xs text-rose-600 font-medium">
                                                {joinGroupForm.errors.group_code}
                                            </p>
                                        )}
                                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                            Masukkan kode lengkap (<code className="font-mono text-slate-700">NAMA-GRUP-6DIGIT</code>) yang diberikan oleh rekan atau admin perusahaan Anda.
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-2.5 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setGroupModalOpen(false)}
                                            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={joinGroupForm.processing}
                                            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 cursor-pointer"
                                        >
                                            {joinGroupForm.processing ? 'Memproses...' : 'Gabung Grup'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}
