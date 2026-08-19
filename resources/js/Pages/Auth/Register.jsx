import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

function Icon({ path, className = 'h-5 w-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );
}

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        nip: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/register');
    };

    const fields = [
        { name: 'email', label: 'Email', type: 'email', placeholder: 'Masukkan email', autoComplete: 'email' },
        { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP', autoComplete: 'username' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Minimal 8 karakter', autoComplete: 'new-password' },
        { name: 'password_confirmation', label: 'Konfirmasi Password', type: 'password', placeholder: 'Ulangi password', autoComplete: 'new-password' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden"
            style={{ background: 'var(--bg-base, #0f0e1a)' }}>
            <Head title="Register | Workshop AMS" />
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
                        <Icon path="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4.5 19.125a6.375 6.375 0 0112.75 0" className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Buat Akun</h1>
                    <p className="text-sm font-medium" style={{ color: '#a78bfa' }}>Daftar akun Workshop AMS</p>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="p-3.5 rounded-2xl text-xs font-semibold leading-relaxed space-y-1"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                        {Object.values(errors).map((error, index) => <p key={index}>{error}</p>)}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    {fields.map((field) => (
                        <div key={field.name} className="space-y-1.5">
                            <label htmlFor={field.name} className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
                                {field.label}
                            </label>
                            <input
                                id={field.name}
                                required
                                type={field.type}
                                value={data[field.name]}
                                onChange={(event) => setData(field.name, event.target.value)}
                                placeholder={field.placeholder}
                                autoComplete={field.autoComplete}
                                className="w-full rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none transition-all"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                            />
                        </div>
                    ))}
                    <button disabled={processing} type="submit" className="w-full text-white font-bold text-sm py-3.5 rounded-2xl transition-all cursor-pointer hover:brightness-110 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                        {processing ? 'Mendaftarkan...' : 'Daftar'}
                    </button>
                </form>
                <p className="text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-bold hover:text-white" style={{ color: '#a78bfa' }}>
                        Masuk sekarang
                    </Link>
                </p>
            </main>
        </div>
    );
}
