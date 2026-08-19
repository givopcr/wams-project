import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

function Icon({ path, className = 'h-5 w-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );
}

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        identifier: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden"
            style={{ background: 'var(--bg-base, #0f0e1a)' }}>
            <Head title="Login | Workshop AMS" />
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
                style={{ background: 'rgba(124,58,237,0.15)' }} />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
                style={{ background: 'rgba(99,102,241,0.12)' }} />

            <main className="relative rounded-3xl p-8 max-w-md w-full animate-scale-up space-y-6"
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                }}>
                <div className="text-center space-y-3">
                    <div className="inline-flex p-3.5 rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                        <Icon path="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Workshop AMS</h1>
                    <p className="text-sm font-medium" style={{ color: '#a78bfa' }}>Masuk ke Asset Management System</p>
                </div>

                {errors.identifier && (
                    <div className="p-3.5 rounded-2xl text-xs font-semibold leading-relaxed"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                        {errors.identifier}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="identifier" className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
                            Email atau NIP
                        </label>
                        <input
                            id="identifier"
                            required
                            type="text"
                            value={data.identifier}
                            onChange={(event) => setData('identifier', event.target.value)}
                            placeholder="Masukkan email atau NIP"
                            autoComplete="username"
                            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none transition-all"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
                            Password
                        </label>
                        <input
                            id="password"
                            required
                            type="password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            placeholder="Masukkan password"
                            autoComplete="current-password"
                            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none transition-all"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                        />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        <input type="checkbox" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} />
                        Ingat saya
                    </label>
                    <button disabled={processing} type="submit" className="w-full text-white font-bold text-sm py-3.5 rounded-2xl transition-all cursor-pointer hover:brightness-110 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                        {processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
                <p className="text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-bold hover:text-white" style={{ color: '#a78bfa' }}>
                        Daftar sekarang
                    </Link>
                </p>
            </main>
        </div>
    );
}
