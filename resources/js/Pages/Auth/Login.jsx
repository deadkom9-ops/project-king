import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useState, useId } from 'react';

export default function Login() {
    const { flash } = usePage().props;
    const emailId = useId();
    const passwordId = useId();
    const rememberId = useId();

    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Masuk - Project Management" />
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 selection:bg-purple-100 selection:text-purple-900">
                {/* Modern Mesh Grid Background */}
                <div
                    className="absolute inset-0 opacity-[0.45] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }}
                />

                {/* Ambient Glows */}
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
                            Selamat Datang Kembali
                        </h1>
                        {/* <p className="text-slate-500 mt-1.5 text-sm max-w-sm mx-auto">
                            Masuk dengan akun terdaftar untuk memantau progres dan persetujuan project Anda.
                        </p> */}
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white rounded-2xl p-6 sm:p-9 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] relative backdrop-blur-sm">
                        {flash?.success && (
                            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
                                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="font-medium leading-relaxed">{flash.success}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5" noValidate>
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
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
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
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                                        <span>•</span> {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between pt-1">
                                <label htmlFor={rememberId} className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                        id={rememberId}
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="text-sm text-slate-600 font-medium">Ingat saya di perangkat ini</span>
                                </label>
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
                                        <span>Memverifikasi...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Masuk ke Akun</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-600">
                                Belum memiliki akun?{' '}
                                <Link
                                    href="/register"
                                    className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                                >
                                    Daftar di sini
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Bottom Micro Copy */}
                    <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>© {new Date().getFullYear()} All rights reserved.</span>
                    </div>
                </div>
            </div>
        </>
    );
}
