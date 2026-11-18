import { useForm, Head, Link } from '@inertiajs/react';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { useState, useId } from 'react';

export default function Register() {
    const nameId = useId();
    const emailId = useId();
    const passwordId = useId();
    const confirmPasswordId = useId();
    const groupCodeId = useId();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        group_code: '',
    });

    const calculatePasswordStrength = (pwd) => {
        if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
        let score = 0;
        if (pwd.length >= 8) score += 1;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
        if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

        if (score === 1) return { score: 1, label: 'Lemah', color: 'bg-rose-500', textColor: 'text-rose-600' };
        if (score === 2) return { score: 2, label: 'Sedang', color: 'bg-amber-500', textColor: 'text-amber-600' };
        return { score: 3, label: 'Kuat', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
    };

    const strength = calculatePasswordStrength(data.password);
    const isPasswordMatch = data.password_confirmation.length > 0 && data.password === data.password_confirmation;
    const isPasswordMismatch = data.password_confirmation.length > 0 && data.password !== data.password_confirmation;

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Daftar Akun Baru - Project Management" />
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 selection:bg-purple-100 selection:text-purple-900">
                {/* Modern Mesh Grid Background */}
                <div
                    className="absolute inset-0 opacity-[0.45] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }}
                />

                {/* Subtle Ambient Glows */}
                <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-purple-200/50 to-fuchsia-200/30 blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-[440px] h-[440px] rounded-full bg-gradient-to-tl from-cyan-200/50 to-indigo-200/30 blur-[130px] pointer-events-none" />

                <div className="relative w-full max-w-lg my-8 animate-fade-in-up">
                    {/* Header with App Logo & Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 rounded-2xl bg-white shadow-md shadow-slate-200/60 border border-slate-100 mb-4 transition-transform hover:scale-105 duration-200">
                            <img
                                src="/img/process_icon.png"
                                alt="Project Management Logo"
                                className="w-12 h-12 object-contain"
                            />
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold tracking-wide mb-2.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Monitoring & Business Plan</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Buat Akun Baru
                        </h1>
                        <p className="text-slate-500 mt-1.5 text-sm max-w-sm mx-auto">
                            Daftarkan diri Anda untuk mulai mengelola project, task, dan approval tim secara transparan.
                        </p>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white rounded-2xl p-6 sm:p-9 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] relative backdrop-blur-sm">
                        <form onSubmit={submit} className="space-y-5" noValidate>
                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor={nameId}
                                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                                >
                                    Nama Lengkap <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        id={nameId}
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full h-11 pl-11 pr-4 rounded-xl text-sm text-slate-900 bg-white border transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                            errors.name
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 hover:border-slate-300 focus:border-purple-600 focus:ring-purple-100'
                                        }`}
                                        placeholder="Contoh: dr. Budi Santoso, Sp.A"
                                        required
                                        autoComplete="name"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                                        <span>•</span> {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor={emailId}
                                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                                >
                                    Alamat Email <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        id={emailId}
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full h-11 pl-11 pr-4 rounded-xl text-sm text-slate-900 bg-white border transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                            errors.email
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 hover:border-slate-300 focus:border-purple-600 focus:ring-purple-100'
                                        }`}
                                        placeholder="nama@email.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                                        <span>•</span> {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label
                                        htmlFor={passwordId}
                                        className="block text-sm font-semibold text-slate-700"
                                    >
                                        Password <span className="text-rose-500">*</span>
                                    </label>
                                    {data.password && strength.label && (
                                        <span className={`text-xs font-semibold ${strength.textColor}`}>
                                            Kekuatan: {strength.label}
                                        </span>
                                    )}
                                </div>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        id={passwordId}
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full h-11 pl-11 pr-11 rounded-xl text-sm text-slate-900 bg-white border transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                            errors.password
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 hover:border-slate-300 focus:border-purple-600 focus:ring-purple-100'
                                        }`}
                                        placeholder="Minimal 8 karakter"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                        className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Password Strength Meter */}
                                {data.password.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        <div className="grid grid-cols-3 gap-1.5 h-1.5">
                                            <div className={`rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-slate-100'}`} />
                                            <div className={`rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-slate-100'}`} />
                                            <div className={`rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-slate-100'}`} />
                                        </div>
                                    </div>
                                )}

                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                                        <span>•</span> {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor={confirmPasswordId}
                                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                                >
                                    Konfirmasi Password <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        id={confirmPasswordId}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={`w-full h-11 pl-11 pr-11 rounded-xl text-sm text-slate-900 bg-white border transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                            isPasswordMismatch
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : isPasswordMatch
                                                ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100'
                                                : 'border-slate-200 hover:border-slate-300 focus:border-purple-600 focus:ring-purple-100'
                                        }`}
                                        placeholder="Ketik ulang password"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                                        className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {isPasswordMatch && (
                                    <p className="mt-1.5 text-xs text-emerald-600 font-medium flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Password sesuai
                                    </p>
                                )}
                                {isPasswordMismatch && (
                                    <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                                        <span>•</span> Password belum sesuai
                                    </p>
                                )}
                            </div>

                            {/* Gabung Grup (Opsional) */}
                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label
                                        htmlFor={groupCodeId}
                                        className="block text-sm font-semibold text-slate-700"
                                    >
                                        Gabung Grup Perusahaan
                                    </label>
                                    <span className="text-[11px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                        Opsional
                                    </span>
                                </div>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                                        <KeyRound className="w-5 h-5" />
                                    </div>
                                    <input
                                        id={groupCodeId}
                                        type="text"
                                        value={data.group_code}
                                        onChange={(e) => setData('group_code', e.target.value.toUpperCase())}
                                        className={`w-full h-11 pl-11 pr-4 rounded-xl text-sm font-mono uppercase tracking-wider text-slate-900 bg-white border transition-all duration-200 placeholder:text-slate-400 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                            errors.group_code
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-slate-200 hover:border-slate-300 focus:border-purple-600 focus:ring-purple-100'
                                        }`}
                                        placeholder="Contoh: PERUSAHAAN-A-X7K9M2"
                                        autoComplete="off"
                                    />
                                </div>
                                <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                                    Masukkan Kode ID Grup jika Anda ingin langsung bergabung ke grup perusahaan rekan Anda. Kosongkan jika ingin membuat grup baru nanti.
                                </p>
                                {errors.group_code && (
                                    <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                                        <span>•</span> {errors.group_code}
                                    </p>
                                )}
                            </div>

                            {/* Terms notice */}
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Akun Anda akan diverifikasi dan terhubung ke sistem monitoring unit kerja secara aman.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:via-indigo-700 hover:to-cyan-700 shadow-md shadow-indigo-500/20 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Mendaftarkan akun...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Daftar Akun</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-600">
                                Sudah memiliki akun terdaftar?{' '}
                                <Link
                                    href="/login"
                                    className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                                >
                                    Masuk di sini
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Bottom Micro Copy */}
                    <p className="text-center text-xs text-slate-400 mt-6">
                        © {new Date().getFullYear()} All rights reserved.
                    </p>
                </div>
            </div>
        </>
    );
}
