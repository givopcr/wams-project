import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/Layouts/Layout';
import { Head } from '@inertiajs/react';
// html5-qrcode is loaded lazily to avoid SSR/module-init crashes
let Html5QrcodeLib = null;

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function DarkCard({ children, className = '', style = {} }) {
    return (
        <div
            className={`rounded-2xl ${className}`}
            style={{
                background: 'var(--card-bg, rgba(255,255,255,0.04))',
                border: '1px solid var(--card-border, rgba(255,255,255,0.07))',
                ...style,
            }}
        >
            {children}
        </div>
    );
}

// ─── Kondisi badge ────────────────────────────────────────────────────────────
function KondisiBadge({ kondisi }) {
    const good = kondisi === 'Baik';
    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
            style={good
                ? { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
                : { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
            }
        >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: good ? '#34d399' : '#f87171' }} />
            {kondisi}
        </span>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        tersedia: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', dot: '#34d399', label: 'Tersedia' },
        dipinjam: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', dot: '#fbbf24', label: 'Dipinjam' },
        maintenance: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', dot: '#f87171', label: 'Maintenance' },
    };
    const s = map[status] || map.tersedia;
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
            style={{ background: s.bg, color: s.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
            {s.label}
        </span>
    );
}

// ─── QR visual (non-scannable, visual only) ───────────────────────────────────
function QrDisplay({ value, size = 112 }) {
    const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const cells = 7;
    const grid = Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) => {
            if ((r < 2 && c < 2) || (r < 2 && c >= cells - 2) || (r >= cells - 2 && c < 2)) return 'finder';
            return ((seed * (r + 1) * (c + 3)) % 5) < 2 ? 'dark' : 'light';
        })
    );
    const cell = Math.floor(size / cells);
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
            <rect width={size} height={size} fill="#1a1830" rx="6" />
            {grid.map((row, r) => row.map((type, c) => (
                <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell}
                    fill={type === 'light' ? 'transparent' : '#a78bfa'} rx={type === 'finder' ? 2 : 1} />
            )))}
            <rect x={size / 2 - 10} y={size / 2 - 10} width={20} height={20} fill="#1a1830" rx={4} />
            <rect x={size / 2 - 7} y={size / 2 - 7} width={14} height={14} fill="#7c3aed" rx={3} />
            <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill="white" fontSize="9" fontWeight="900">W</text>
        </svg>
    );
}

// ─── Icon helper ─────────────────────────────────────────────────────────────
function Icon({ path, className = 'h-5 w-5', sw = 2, style }) {
    return (
        <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={sw}>
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const [isLoggedIn, setIsLoggedIn]     = useState(true);
    const [userRole, setUserRole]         = useState('admin');
    const [loginError, setLoginError]     = useState('');
    const [currentTab, setCurrentTab]     = useState('dashboard');
    const [selectedBarangId, setSelectedBarangId] = useState(null);
    const [searchQuery, setSearchQuery]   = useState('');

    const [barangList, setBarangList] = useState([
        { id: 1, kode_barang: 'BRG-001', qr_content: 'BRG-001', nama_barang: 'Laptop ThinkPad X1 Carbon', kategori: 'Elektronik', lokasi: 'Ruang IT', status: 'tersedia', kondisi: 'Baik', stok: 15, detail: 'Intel i7, 16GB RAM, 512GB SSD', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60' },
        { id: 2, kode_barang: 'BRG-002', qr_content: 'BRG-002', nama_barang: 'Meja Kerja Ergonomis', kategori: 'Mebel', lokasi: 'Lantai 2', status: 'tersedia', kondisi: 'Baik', stok: 30, detail: 'Meja adjustable height 120x60cm', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=60' },
        { id: 3, kode_barang: 'BRG-003', qr_content: 'BRG-003', nama_barang: 'Projector Epson EB-X400', kategori: 'Elektronik', lokasi: 'Ruang Meeting', status: 'dipinjam', kondisi: 'Baik', stok: 5, detail: '3300 Lumens, HDMI, VGA', image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&auto=format&fit=crop&q=60' },
        { id: 4, kode_barang: 'BRG-004', qr_content: 'BRG-004', nama_barang: 'Bor Listrik Bosch GSB 550', kategori: 'Perkakas', lokasi: 'Gudang A', status: 'tersedia', kondisi: 'Baik', stok: 8, detail: 'Smart Drill 550W, 13mm', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60' },
        { id: 5, kode_barang: 'BRG-005', qr_content: 'BRG-005', nama_barang: 'Solder Listrik Adjustable', kategori: 'Perkakas', lokasi: 'Ruang Lab', status: 'tersedia', kondisi: 'Baik', stok: 12, detail: 'Solder 60W Adjustable Temperature', image: 'https://images.unsplash.com/photo-1608962714022-ae9a04a6015b?w=500&auto=format&fit=crop&q=60' },
        { id: 6, kode_barang: 'BRG-006', qr_content: 'BRG-006', nama_barang: 'IC Mikrokontroler Atmega328', kategori: 'Komponen', lokasi: 'Gudang B', status: 'maintenance', kondisi: 'Rusak Ringan', stok: 46, detail: 'IC 8-bit AVR microcontroller', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60' },
    ]);

    const [kategoriList] = useState(['Elektronik', 'Mebel', 'Perkakas', 'Komponen', 'Alat Ukur', 'Jaringan']);

    const [logList, setLogList] = useState([
        { id: 1, pengguna: 'Baihaki', barang: 'Laptop ThinkPad X1 Carbon', waktu_pinjam: '2026-08-01 09:00', waktu_kembali: '2026-08-01 17:00', status: 'Selesai', keterangan: 'Peminjaman Laptop' },
        { id: 2, pengguna: 'Siti Aminah', barang: 'Projector Epson EB-X400', waktu_pinjam: '2026-08-02 10:30', waktu_kembali: '-', status: 'Sedang Dipinjam', keterangan: 'Peminjaman unit untuk event' },
        { id: 3, pengguna: 'Ahmad Fauzi', barang: 'Bor Listrik Bosch GSB 550', waktu_pinjam: '2026-08-03 08:00', waktu_kembali: '2026-08-03 12:00', status: 'Selesai', keterangan: 'Perbaikan ruangan' },
    ]);

    const [userList, setUserList] = useState([
        { id: 1, nama: 'Ahmad Rizki', username: 'ahmad.rizki', role: 'admin', nip: '199208152020121001' },
        { id: 2, nama: 'Siti Nurhaliza', username: 'siti.nurhaliza', role: 'user', nip: '199503122021082002' },
        { id: 3, nama: 'Budi Firmansyah', username: 'budi.firmansyah', role: 'user', nip: '198811052018041003' },
        { id: 4, nama: 'Dewi Lestari', username: 'dewi.lestari', role: 'admin', nip: '199104302019102004' },
    ]);

    // Modal states
    const [showAddBarangModal, setShowAddBarangModal] = useState(false);
    const [editBarangData, setEditBarangData]         = useState(null);
    const [showAddUserModal, setShowAddUserModal]     = useState(false);
    const [editUserData, setEditUserData]             = useState(null);
    const [showQrEditModal, setShowQrEditModal]       = useState(false);
    const [qrEditTarget, setQrEditTarget]             = useState(null);
    const [qrEditValue, setQrEditValue]               = useState('');

    // Filters
    const [searchBarang, setSearchBarang]         = useState('');
    const [searchUser, setSearchUser]             = useState('');
    const [filterLogUser, setFilterLogUser]       = useState('Semua User');
    const [filterLogBarang, setFilterLogBarang]   = useState('Semua Barang');
    const [filterLogStatus, setFilterLogStatus]   = useState('Semua Status');

    // QR scanner
    const [cameraPermission, setCameraPermission] = useState('idle');
    const [scannerReady, setScannerReady]         = useState(false);
    const [scanResult, setScanResult]             = useState('');
    const scannerInstanceRef                      = useRef(null);

    // ─── Auth ─────────────────────────────────────────────────────────────────
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        const u = e.target.username.value;
        const p = e.target.password.value;
        if (u === 'admin' && p === 'admin') {
            setUserRole('admin'); setIsLoggedIn(true); setLoginError(''); setCurrentTab('dashboard');
        } else if (u === 'user' && p === 'user') {
            setUserRole('user'); setIsLoggedIn(true); setLoginError(''); setCurrentTab('dashboard');
        } else {
            setLoginError('Username atau password salah. Gunakan admin/admin atau user/user');
        }
    };
    const handleLogout = () => { setIsLoggedIn(false); setLoginError(''); };

    // ─── Actions ─────────────────────────────────────────────────────────────
    const handlePinjam = (id) => {
        const t = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const item = barangList.find(b => b.id === id);
        setBarangList(prev => prev.map(b => b.id === id ? { ...b, status: 'dipinjam' } : b));
        setLogList(prev => [{ id: prev.length + 1, pengguna: userRole === 'admin' ? 'Ahmad Rizki' : 'Siti Nurhaliza', barang: item.nama_barang, waktu_pinjam: t, waktu_kembali: '-', status: 'Sedang Dipinjam', keterangan: 'Peminjaman barang' }, ...prev]);
    };
    const handleKembali = (id) => {
        const t = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const item = barangList.find(b => b.id === id);
        setBarangList(prev => prev.map(b => b.id === id ? { ...b, status: 'tersedia' } : b));
        setLogList(prev => prev.map(l => l.barang === item.nama_barang && l.status === 'Sedang Dipinjam' ? { ...l, status: 'Selesai', waktu_kembali: t } : l));
    };
    const openQrEdit = (item) => { setQrEditTarget(item); setQrEditValue(item.qr_content); setShowQrEditModal(true); };
    const saveQrEdit = () => {
        if (!qrEditValue.trim()) return;
        setBarangList(prev => prev.map(b => b.id === qrEditTarget.id ? { ...b, qr_content: qrEditValue.trim() } : b));
        setShowQrEditModal(false);
    };
    const viewDetail = (id) => { setSelectedBarangId(id); setCurrentTab('detail-barang'); };

    // Stats
    const totalBarang    = barangList.length;
    const dipinjamCount  = barangList.filter(b => b.status === 'dipinjam').length;
    const tersediaCount  = barangList.filter(b => b.status === 'tersedia').length;
    const kondisiBaikPct = Math.round((barangList.filter(b => b.kondisi === 'Baik').length / totalBarang) * 100);

    // ─── Camera scanner ───────────────────────────────────────────────────────
    const startCamera = async () => {
        setCameraPermission('requesting'); setScanResult('');
        try {
            // Lazy-load html5-qrcode only when camera is actually activated
            if (!Html5QrcodeLib) {
                const mod = await import('html5-qrcode');
                Html5QrcodeLib = mod.Html5Qrcode;
            }
            const instance = new Html5QrcodeLib('qr-camera-box');
            scannerInstanceRef.current = instance;
            await instance.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 220, height: 220 } },
                (decoded) => {
                    setScanResult(decoded);
                    const found = barangList.find(b =>
                        b.qr_content.toLowerCase() === decoded.trim().toLowerCase() ||
                        b.kode_barang.toLowerCase() === decoded.trim().toLowerCase()
                    );
                    stopCamera();
                    if (found) setTimeout(() => viewDetail(found.id), 600);
                },
                () => {}
            );
            setCameraPermission('granted'); setScannerReady(true);
        } catch (err) {
            setCameraPermission('denied'); setScannerReady(false);
        }
    };
    const stopCamera = () => {
        if (scannerInstanceRef.current) {
            scannerInstanceRef.current.stop().then(() => {
                scannerInstanceRef.current.clear();
                scannerInstanceRef.current = null;
            }).catch(() => {});
        }
        setScannerReady(false);
    };
    useEffect(() => {
        if (currentTab !== 'scan') { stopCamera(); setCameraPermission('idle'); setScanResult(''); }
    }, [currentTab]);

    // ─────────────────────────────────────────────────────────────────────────
    // LOGIN PAGE
    // ─────────────────────────────────────────────────────────────────────────
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden"
                style={{ background: 'var(--bg-base, #0f0e1a)' }}>
                <Head title="WAMS Login" />
                <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
                    style={{ background: 'rgba(124,58,237,0.15)' }} />
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
                    style={{ background: 'rgba(99,102,241,0.12)' }} />

                <div className="relative rounded-3xl p-8 max-w-md w-full animate-scale-up space-y-6"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)',
                    }}>
                    <div className="text-center space-y-3">
                        <div className="inline-flex p-3.5 rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                            <Icon path="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" className="h-7 w-7 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Workshop AMS</h2>
                        <p className="text-sm font-medium" style={{ color: '#a78bfa' }}>Asset Management System · Login</p>
                    </div>
                    {loginError && (
                        <div className="p-3.5 rounded-2xl text-xs font-semibold leading-relaxed"
                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                            {loginError}
                        </div>
                    )}
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        {[{ name: 'username', label: 'Username', type: 'text', ph: 'Masukkan username' }, { name: 'password', label: 'Password', type: 'password', ph: 'Masukkan password' }].map(f => (
                            <div key={f.name} className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>{f.label}</label>
                                <input required type={f.type} name={f.name} placeholder={f.ph}
                                    className="w-full rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none transition-all"
                                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} />
                            </div>
                        ))}
                        <button type="submit" className="w-full text-white font-bold text-sm py-3.5 rounded-2xl transition-all cursor-pointer hover:brightness-110"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                            Masuk
                        </button>
                    </form>
                    <div className="grid grid-cols-2 gap-3">
                        {[{ role: 'Admin', cred: 'admin / admin' }, { role: 'User', cred: 'user / user' }].map(c => (
                            <div key={c.role} className="rounded-2xl p-3 text-center text-xs"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <p className="font-bold mb-0.5" style={{ color: '#a78bfa' }}>{c.role}</p>
                                <p className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{c.cred}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN APP
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <Head title="Workshop AMS" />
            <Layout
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                userRole={userRole}
                handleLogout={handleLogout}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onTambahAset={() => { setEditBarangData(null); setShowAddBarangModal(true); }}
            >

                {/* ══════════════════════════════════════════════════════════
                    TAB 1 — DASHBOARD
                ═══════════════════════════════════════════════════════════ */}
                {currentTab === 'dashboard' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Page header */}
                        <div>
                            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#f1f0ff' }}>Dashboard</h1>
                        </div>

                        {/* Stat cards row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            {[
                                {
                                    label: 'Total Barang', value: '48 Unit', sub: 'Total Barang',
                                    trend: '+12% bulan ini', trendUp: true,
                                    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
                                    iconColor: '#818cf8', iconBg: 'rgba(129,140,248,0.15)',
                                },
                                {
                                    label: 'Kategori Aset', value: '6 Kategori', sub: 'Kategori Aset',
                                    trend: 'Terorganisir', trendUp: true,
                                    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
                                    iconColor: '#c084fc', iconBg: 'rgba(192,132,252,0.15)',
                                },
                                {
                                    label: 'Aktivitas Logbook', value: `${logList.length * 4} Transaksi`, sub: 'Aktivitas Logbook',
                                    trend: `${logList.filter(l => l.status === 'Selesai').length * 3} baru hari ini`, trendUp: true,
                                    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                                    iconColor: '#34d399', iconBg: 'rgba(52,211,153,0.15)',
                                },
                                {
                                    label: 'Kondisi Baik', value: `${kondisiBaikPct}.8%`, sub: 'Kondisi Baik',
                                    trend: `${tersediaCount * 8} dari ${totalBarang * 8} unit`, trendUp: true,
                                    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                                    iconColor: '#fbbf24', iconBg: 'rgba(251,191,36,0.15)',
                                },
                            ].map((card, i) => (
                                <DarkCard key={i} className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: card.trendUp ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', color: card.trendUp ? '#34d399' : '#f87171' }}>
                                                    ↗ {card.trend}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white">{card.value}</p>
                                                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{card.sub}</p>
                                            </div>
                                        </div>
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: card.iconBg }}>
                                            <Icon path={card.icon} className="h-5 w-5" style={{ color: card.iconColor }} />
                                        </div>
                                    </div>
                                </DarkCard>
                            ))}
                        </div>

                        {/* Data Barang Terbaru + Right column */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                            {/* ── Data Barang Terbaru table ── */}
                            <DarkCard className="xl:col-span-2 overflow-hidden">
                                <div className="flex items-center justify-between px-5 pt-5 pb-4"
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div>
                                        <p className="font-bold text-white text-[15px]">Data Barang Terbaru</p>
                                        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                            Inventaris aset yang baru saja terdaftar
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors hover:bg-white/8 cursor-pointer"
                                            style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <Icon path="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" className="h-3.5 w-3.5" />
                                            Filter
                                        </button>
                                        <button onClick={() => setCurrentTab('barang')}
                                            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors hover:bg-white/8"
                                            style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            Lihat Semua
                                        </button>
                                    </div>
                                </div>

                                <table className="w-full text-left">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            {['KODE BARANG', 'NAMA BARANG', 'KATEGORI', 'STOK', 'KONDISI', 'LOKASI', 'AKSI'].map(h => (
                                                <th key={h} className="px-5 py-3 text-[10px] font-bold tracking-wider"
                                                    style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {barangList.slice(0, 5).map((item, idx) => (
                                            <tr key={item.id}
                                                className="transition-colors hover:bg-white/3 cursor-pointer"
                                                style={{ borderBottom: idx < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                                                onClick={() => viewDetail(item.id)}>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded"
                                                        style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>
                                                        {item.kode_barang}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-[13px] font-semibold text-white">{item.nama_barang}</td>
                                                <td className="px-5 py-3.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.kategori}</td>
                                                <td className="px-5 py-3.5 text-[12px] font-semibold text-white">{item.stok} unit</td>
                                                <td className="px-5 py-3.5"><KondisiBadge kondisi={item.kondisi} /></td>
                                                <td className="px-5 py-3.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                                    <span className="flex items-center gap-1">
                                                        <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" className="h-3.5 w-3.5" />
                                                        {item.lokasi}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                                                    <button className="p-1.5 rounded-lg transition-colors hover:bg-white/10 cursor-pointer"
                                                        style={{ color: 'rgba(255,255,255,0.3)' }}>
                                                        <Icon path="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </DarkCard>

                            {/* ── Right column ── */}
                            <div className="flex flex-col gap-4">

                                {/* Aksi Cepat */}
                                <DarkCard className="p-5">
                                    <p className="font-bold text-white text-[14px] mb-4">Aksi Cepat</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            {
                                                label: 'Scan QR', tab: 'scan',
                                                icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
                                                bg: 'rgba(129,140,248,0.15)', color: '#818cf8',
                                            },
                                            {
                                                label: 'Tambah Barang', tab: null, action: () => { setEditBarangData(null); setShowAddBarangModal(true); },
                                                icon: 'M12 4v16m8-8H4',
                                                bg: 'rgba(192,132,252,0.15)', color: '#c084fc',
                                            },
                                            {
                                                label: 'Catat Log', tab: 'logbook',
                                                icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                                                bg: 'rgba(52,211,153,0.15)', color: '#34d399',
                                            },
                                        ].map(btn => (
                                            <button
                                                key={btn.label}
                                                onClick={() => btn.action ? btn.action() : setCurrentTab(btn.tab)}
                                                className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all cursor-pointer hover:brightness-125 active:scale-95"
                                                style={{ background: btn.bg, border: `1px solid ${btn.color}22` }}
                                            >
                                                <Icon path={btn.icon} className="h-6 w-6" style={{ color: btn.color }} />
                                                <span className="text-[11px] font-semibold text-white">{btn.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </DarkCard>

                                {/* Aktivitas Terbaru */}
                                <DarkCard className="p-5 flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="font-bold text-white text-[14px]">Aktivitas Terbaru</p>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                                            style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                                            LIVE
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {logList.slice(0, 4).map((log, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{ background: 'rgba(124,58,237,0.25)' }}>
                                                    <Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" className="h-3.5 w-3.5" style={{ color: '#a78bfa' }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12px] font-semibold text-white truncate">{log.keterangan}</p>
                                                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                                        {log.pengguna} · {log.waktu_pinjam}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </DarkCard>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    TAB 2 — DATA BARANG
                ═══════════════════════════════════════════════════════════ */}
                {currentTab === 'barang' && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-white">Data Barang</h1>
                                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Kelola data barang workshop dengan mudah.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                                    <input type="text" placeholder="Cari barang..." value={searchBarang} onChange={e => setSearchBarang(e.target.value)}
                                        className="pl-9 pr-4 py-2 text-[13px] rounded-xl focus:outline-none w-52 font-medium"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                                {userRole === 'admin' && (
                                    <button onClick={() => { setEditBarangData(null); setShowAddBarangModal(true); }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[13px] text-white cursor-pointer hover:brightness-110 transition-all"
                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                                        <Icon path="M12 4v16m8-8H4" className="h-4 w-4" />
                                        Tambah Barang
                                    </button>
                                )}
                            </div>
                        </div>

                        <DarkCard className="overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        {['Kode', 'Nama Barang', 'Kategori', 'Stok', 'Kondisi', 'Lokasi', 'Status', 'Aksi'].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-[10px] font-bold tracking-wider"
                                                style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {barangList.filter(b =>
                                        b.nama_barang.toLowerCase().includes(searchBarang.toLowerCase()) ||
                                        b.kode_barang.toLowerCase().includes(searchBarang.toLowerCase())
                                    ).map((item, idx, arr) => (
                                        <tr key={item.id} className="transition-colors hover:bg-white/3"
                                            style={{ borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                            <td className="px-5 py-3.5">
                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded"
                                                    style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>{item.kode_barang}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-[13px] font-semibold text-white">{item.nama_barang}</td>
                                            <td className="px-5 py-3.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.kategori}</td>
                                            <td className="px-5 py-3.5 text-[12px] font-semibold text-white">{item.stok} unit</td>
                                            <td className="px-5 py-3.5"><KondisiBadge kondisi={item.kondisi} /></td>
                                            <td className="px-5 py-3.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.lokasi}</td>
                                            <td className="px-5 py-3.5"><StatusBadge status={item.status} /></td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => viewDetail(item.id)} className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.35)' }} title="Detail">
                                                        <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="h-4 w-4" />
                                                    </button>
                                                    {userRole === 'admin' && (<>
                                                        <button onClick={() => { setEditBarangData(item); setShowAddBarangModal(true); }} className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.35)' }} title="Edit">
                                                            <Icon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => { if (confirm(`Hapus ${item.nama_barang}?`)) setBarangList(prev => prev.filter(b => b.id !== item.id)); }} className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-red-500/20" style={{ color: 'rgba(255,255,255,0.35)' }} title="Hapus">
                                                            <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="h-4 w-4" />
                                                        </button>
                                                    </>)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </DarkCard>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    TAB 3 — DETAIL BARANG
                ═══════════════════════════════════════════════════════════ */}
                {currentTab === 'detail-barang' && (() => {
                    const item = barangList.find(b => b.id === selectedBarangId);
                    if (!item) return <p className="text-white/50">Pilih barang terlebih dahulu.</p>;
                    return (
                        <div className="space-y-5 animate-fade-in">
                            <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                <button onClick={() => setCurrentTab('barang')} className="hover:text-white transition-colors cursor-pointer">Data Barang</button>
                                <span>/</span>
                                <span className="text-white">Detail Barang</span>
                            </div>
                            <DarkCard className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-5/12 rounded-2xl flex items-center justify-center p-4 min-h-[260px]"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <img src={item.image} alt={item.nama_barang} className="max-h-52 max-w-full rounded-xl object-cover" />
                                </div>
                                <div className="flex-1 space-y-5">
                                    <div>
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                                            style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>{item.kategori}</span>
                                        <h2 className="text-2xl font-black text-white mt-3 tracking-tight">{item.nama_barang}</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        {[['Kode Barang', item.kode_barang], ['Lokasi', item.lokasi], ['Kondisi', item.kondisi], ['Stok', `${item.stok} unit`]].map(([k, v]) => (
                                            <div key={k}>
                                                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'rgba(255,255,255,0.35)' }}>{k}</span>
                                                <span className="font-semibold text-white mt-1 text-sm block">{v}</span>
                                            </div>
                                        ))}
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'rgba(255,255,255,0.35)' }}>Status</span>
                                            <div className="mt-1"><StatusBadge status={item.status} /></div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Detail Spesifikasi</span>
                                        <p className="text-[13px] font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.detail}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>QR Code</span>
                                            {userRole === 'admin' && (
                                                <button onClick={() => openQrEdit(item)} className="text-[10px] font-bold px-2 py-0.5 rounded-lg cursor-pointer transition-colors hover:brightness-110"
                                                    style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>Edit QR</button>
                                            )}
                                        </div>
                                        <div className="inline-flex flex-col items-center gap-2 p-4 rounded-2xl"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <QrDisplay value={item.qr_content} size={112} />
                                            <span className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.kode_barang}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-1">
                                        <button onClick={() => handlePinjam(item.id)} disabled={item.status !== 'tersedia'}
                                            className={`flex-1 flex items-center justify-center gap-2 font-bold text-xs py-3 rounded-xl transition-all ${item.status === 'tersedia' ? 'text-white cursor-pointer hover:brightness-110' : 'cursor-not-allowed'}`}
                                            style={item.status === 'tersedia' ? { background: 'linear-gradient(135deg, #7c3aed, #6366f1)' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>
                                            <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" className="h-4 w-4" />
                                            Pinjam
                                        </button>
                                        <button onClick={() => handleKembali(item.id)} disabled={item.status !== 'dipinjam'}
                                            className={`flex-1 flex items-center justify-center gap-2 font-bold text-xs py-3 rounded-xl border transition-all ${item.status === 'dipinjam' ? 'text-white cursor-pointer hover:bg-white/10' : 'cursor-not-allowed'}`}
                                            style={item.status === 'dipinjam' ? { border: '1px solid rgba(255,255,255,0.15)' } : { border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }}>
                                            <Icon path="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" className="h-4 w-4" />
                                            Kembalikan
                                        </button>
                                    </div>
                                </div>
                            </DarkCard>
                        </div>
                    );
                })()}

                {/* ══════════════════════════════════════════════════════════
                    TAB 4 — SCANNER ASET QR
                ═══════════════════════════════════════════════════════════ */}
                {currentTab === 'scan' && (
                    <div className="animate-fade-in max-w-4xl mx-auto space-y-5">
                        {/* Page header */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.2)' }}>
                                <Icon path="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" className="h-5 w-5" style={{ color: '#818cf8' }} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white tracking-tight">Scan QR Code</h1>
                                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Arahkan kamera ke QR Code aset untuk memindai</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {/* Camera viewport */}
                            <DarkCard className="md:col-span-3 overflow-hidden">
                                <div className="relative w-full" style={{ aspectRatio: '4/3', background: '#0a0a14' }}>
                                    {/* Camera stream target */}
                                    <div id="qr-camera-box" className={`absolute inset-0 ${!scannerReady ? 'hidden' : ''}`} />

                                    {/* Idle / requesting / denied overlays */}
                                    {!scannerReady && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center">
                                            {cameraPermission === 'requesting' ? (
                                                <>
                                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse"
                                                        style={{ background: 'rgba(129,140,248,0.2)', border: '1px solid rgba(129,140,248,0.3)' }}>
                                                        <Icon path="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" className="h-7 w-7" style={{ color: '#818cf8' }} />
                                                    </div>
                                                    <p className="text-white font-bold">Meminta Izin Kamera...</p>
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Silakan izinkan akses kamera di browser</p>
                                                </>
                                            ) : cameraPermission === 'denied' ? (
                                                <>
                                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                                        <Icon path="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" className="h-7 w-7" style={{ color: '#f87171' }} />
                                                    </div>
                                                    <p className="font-bold" style={{ color: '#f87171' }}>Akses Kamera Ditolak</p>
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Izinkan kamera di pengaturan browser, lalu coba lagi</p>
                                                    <button onClick={startCamera} className="px-5 py-2 rounded-xl font-bold text-sm text-white cursor-pointer hover:brightness-110 transition-all"
                                                        style={{ background: 'rgba(239,68,68,0.5)' }}>Coba Lagi</button>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Idle */}
                                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                                        style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.2)' }}>
                                                        <Icon path="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" className="h-9 w-9" style={{ color: '#818cf8' }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold">Klik tombol di bawah untuk</p>
                                                        <p className="text-white font-bold">mengaktifkan kamera</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Active scanner overlay — corner brackets */}
                                    {scannerReady && (
                                        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                                            <div className="w-52 h-52 relative">
                                                <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 rounded-tl-lg" style={{ borderColor: '#818cf8' }} />
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 rounded-tr-lg" style={{ borderColor: '#818cf8' }} />
                                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 rounded-bl-lg" style={{ borderColor: '#818cf8' }} />
                                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 rounded-br-lg" style={{ borderColor: '#818cf8' }} />
                                                <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-0.5 rounded-full animate-bounce" style={{ background: '#a78bfa' }} />
                                            </div>
                                            <button onClick={stopCamera} className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white cursor-pointer transition-all hover:bg-white/20"
                                                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>Stop</button>
                                        </div>
                                    )}
                                </div>

                                {/* Aktifkan Kamera button */}
                                {!scannerReady && cameraPermission !== 'requesting' && (
                                    <div className="p-5 flex justify-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <button onClick={startCamera}
                                            className="flex items-center gap-2.5 px-8 py-3 rounded-xl font-bold text-white cursor-pointer hover:brightness-110 transition-all active:scale-95"
                                            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                                            <Icon path="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" className="h-5 w-5" />
                                            Aktifkan Kamera
                                        </button>
                                    </div>
                                )}

                                {/* Scan result */}
                                {scanResult && (
                                    <div className="mx-5 mb-5 p-4 rounded-xl flex items-center gap-3"
                                        style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(52,211,153,0.3)' }}>
                                            <Icon path="M5 13l4 4L19 7" className="h-4 w-4" style={{ color: '#34d399' }} sw={2.5} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs" style={{ color: '#34d399' }}>QR Terdeteksi!</p>
                                            <p className="font-mono text-xs mt-0.5" style={{ color: 'rgba(52,211,153,0.7)' }}>{scanResult}</p>
                                        </div>
                                    </div>
                                )}
                            </DarkCard>

                            {/* Result / placeholder panel */}
                            <DarkCard className="md:col-span-2 p-6 flex flex-col items-center justify-center gap-4 min-h-[260px]">
                                {scanResult ? (
                                    <>
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)' }}>
                                            <Icon path="M5 13l4 4L19 7" className="h-7 w-7" style={{ color: '#34d399' }} sw={2.5} />
                                        </div>
                                        <p className="font-bold text-white text-center">Aset Ditemukan</p>
                                        <p className="text-[12px] text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>{scanResult}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ border: '2px dashed rgba(255,255,255,0.12)' }}>
                                            <Icon path="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" className="h-7 w-7" style={{ color: 'rgba(255,255,255,0.2)' }} />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="font-semibold text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Hasil scan akan muncul di sini</p>
                                            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Dekatkan QR Code ke kamera untuk memindai aset</p>
                                        </div>
                                    </>
                                )}

                                {/* Demo simulator */}
                                <div className="w-full mt-2 space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>Simulator (Demo)</p>
                                    <select onChange={e => { if (e.target.value) viewDetail(parseInt(e.target.value)); }}
                                        className="w-full px-3 py-2 rounded-xl text-[12px] font-medium focus:outline-none cursor-pointer"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                                        <option value="">-- Pilih barang untuk di-scan --</option>
                                        {barangList.map(b => <option key={b.id} value={b.id}>{b.kode_barang} · {b.nama_barang}</option>)}
                                    </select>
                                </div>
                            </DarkCard>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    TAB 5 — LOGBOOK AKTIVITAS
                ═══════════════════════════════════════════════════════════ */}
                {currentTab === 'logbook' && (
                    <div className="space-y-5 animate-fade-in">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white">Logbook Aktivitas</h1>
                            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Riwayat aktivitas peminjaman dan pengembalian barang.</p>
                        </div>
                        <DarkCard className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                            {[
                                { label: 'User', value: filterLogUser, set: setFilterLogUser, opts: ['Semua User', 'Baihaki', 'Siti Aminah', 'Ahmad Fauzi'] },
                                { label: 'Barang', value: filterLogBarang, set: setFilterLogBarang, opts: ['Semua Barang', ...barangList.map(b => b.nama_barang)] },
                                { label: 'Status', value: filterLogStatus, set: setFilterLogStatus, opts: ['Semua Status', 'Sedang Dipinjam', 'Selesai'] },
                            ].map(f => (
                                <div key={f.label} className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.label}</label>
                                    <select value={f.value} onChange={e => f.set(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl text-[12px] font-medium focus:outline-none cursor-pointer"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                                        {f.opts.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                            <button onClick={() => { setFilterLogUser('Semua User'); setFilterLogBarang('Semua Barang'); setFilterLogStatus('Semua Status'); }}
                                className="py-2.5 rounded-xl text-[12px] font-bold cursor-pointer transition-colors hover:bg-white/10"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                Reset
                            </button>
                        </DarkCard>
                        <DarkCard className="overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        {['Pengguna', 'Barang', 'Waktu Pinjam', 'Waktu Kembali', 'Status'].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-[10px] font-bold tracking-wider"
                                                style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {logList.filter(l =>
                                        (filterLogUser === 'Semua User' || l.pengguna === filterLogUser) &&
                                        (filterLogBarang === 'Semua Barang' || l.barang === filterLogBarang) &&
                                        (filterLogStatus === 'Semua Status' || l.status === filterLogStatus)
                                    ).map((log, idx, arr) => (
                                        <tr key={log.id} className="transition-colors hover:bg-white/3"
                                            style={{ borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px]"
                                                        style={{ background: 'rgba(124,58,237,0.25)', color: '#a78bfa' }}>
                                                        {log.pengguna.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-[13px] text-white">{log.pengguna}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{log.barang}</td>
                                            <td className="px-5 py-3.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{log.waktu_pinjam}</td>
                                            <td className="px-5 py-3.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{log.waktu_kembali}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                                                    style={log.status === 'Selesai'
                                                        ? { background: 'rgba(52,211,153,0.15)', color: '#34d399' }
                                                        : { background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }
                                                    }>
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: log.status === 'Selesai' ? '#34d399' : '#fbbf24' }} />
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </DarkCard>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    TAB 6 — MANAJEMEN USER
                ═══════════════════════════════════════════════════════════ */}
                {currentTab === 'users' && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-white">Manajemen User</h1>
                                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Kelola data pengguna sistem.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                                    <input type="text" placeholder="Cari user..." value={searchUser} onChange={e => setSearchUser(e.target.value)}
                                        className="pl-9 pr-4 py-2 text-[13px] rounded-xl focus:outline-none w-48 font-medium"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                                {userRole === 'admin' && (
                                    <button onClick={() => { setEditUserData(null); setShowAddUserModal(true); }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[13px] text-white cursor-pointer hover:brightness-110 transition-all"
                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                                        <Icon path="M12 4v16m8-8H4" className="h-4 w-4" />
                                        Tambah User
                                    </button>
                                )}
                            </div>
                        </div>
                        <DarkCard className="overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        {['Nama', 'Username', 'NIP', 'Role', ...(userRole === 'admin' ? ['Aksi'] : [])].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-[10px] font-bold tracking-wider"
                                                style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {userList.filter(u =>
                                        u.nama.toLowerCase().includes(searchUser.toLowerCase()) ||
                                        u.username.toLowerCase().includes(searchUser.toLowerCase())
                                    ).map((u, idx, arr) => (
                                        <tr key={u.id} className="transition-colors hover:bg-white/3"
                                            style={{ borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px]"
                                                        style={{ background: 'rgba(192,132,252,0.2)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.2)' }}>
                                                        {u.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-[13px] text-white">{u.nama}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{u.username}</td>
                                            <td className="px-5 py-3.5 font-mono text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{u.nip || '-'}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize"
                                                    style={u.role === 'admin'
                                                        ? { background: 'rgba(192,132,252,0.2)', color: '#c084fc' }
                                                        : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                                                    }>{u.role}</span>
                                            </td>
                                            {userRole === 'admin' && (
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => { setEditUserData(u); setShowAddUserModal(true); }}
                                                            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.35)' }} title="Edit">
                                                            <Icon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => { if (confirm(`Hapus user ${u.nama}?`)) setUserList(prev => prev.filter(x => x.id !== u.id)); }}
                                                            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-red-500/20" style={{ color: 'rgba(255,255,255,0.35)' }} title="Hapus">
                                                            <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </DarkCard>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    TAB 7 — LAPORAN & ANALYTICS (placeholder)
                ═══════════════════════════════════════════════════════════ */}
                {currentTab === 'laporan' && (
                    <div className="animate-fade-in flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.15)' }}>
                            <Icon path="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="h-8 w-8" style={{ color: '#818cf8' }} />
                        </div>
                        <p className="text-white font-bold text-lg">Laporan & Analytics</p>
                        <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Fitur ini akan segera tersedia.</p>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    TAB 8 — KATEGORI
                ═══════════════════════════════════════════════════════════ */}
                {currentTab === 'kategori' && (
                    <div className="space-y-5 animate-fade-in">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white">Kategori</h1>
                            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Daftar kategori aset workshop.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {kategoriList.map((kat, i) => {
                                const count = barangList.filter(b => b.kategori === kat).length;
                                const colors = ['#818cf8', '#c084fc', '#34d399', '#fbbf24', '#f87171', '#38bdf8'];
                                const bgs = ['rgba(129,140,248,0.15)', 'rgba(192,132,252,0.15)', 'rgba(52,211,153,0.15)', 'rgba(251,191,36,0.15)', 'rgba(248,113,113,0.15)', 'rgba(56,189,248,0.15)'];
                                return (
                                    <DarkCard key={kat} className="p-5 cursor-pointer hover:bg-white/6 transition-colors">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bgs[i % bgs.length] }}>
                                            <Icon path="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" className="h-5 w-5" style={{ color: colors[i % colors.length] }} />
                                        </div>
                                        <p className="font-bold text-white text-[14px]">{kat}</p>
                                        <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{count} barang</p>
                                    </DarkCard>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    MODAL — ADD / EDIT BARANG
                ═══════════════════════════════════════════════════════════ */}
                {showAddBarangModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                        <div className="rounded-2xl p-6 w-full max-w-md space-y-5 animate-scale-up"
                            style={{ background: '#1a1830', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-white text-[16px]">{editBarangData ? 'Edit Barang' : 'Tambah Barang'}</h3>
                                <button onClick={() => setShowAddBarangModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    <Icon path="M6 18L18 6M6 6l12 12" className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={e => {
                                e.preventDefault();
                                const d = Object.fromEntries(new FormData(e.target));
                                if (editBarangData) {
                                    setBarangList(prev => prev.map(b => b.id === editBarangData.id ? { ...b, ...d, stok: parseInt(d.stok) || b.stok } : b));
                                } else {
                                    const newId = Math.max(...barangList.map(b => b.id)) + 1;
                                    const kode = `BRG-${String(newId).padStart(3, '0')}`;
                                    setBarangList(prev => [...prev, { id: newId, kode_barang: kode, qr_content: kode, ...d, stok: parseInt(d.stok) || 1, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60' }]);
                                }
                                setShowAddBarangModal(false);
                            }} className="space-y-4">
                                {[
                                    { name: 'nama_barang', label: 'Nama Barang', type: 'text', ph: 'Nama barang', def: editBarangData?.nama_barang },
                                    { name: 'kategori', label: 'Kategori', type: 'text', ph: 'Kategori', def: editBarangData?.kategori },
                                    { name: 'lokasi', label: 'Lokasi', type: 'text', ph: 'Lokasi', def: editBarangData?.lokasi },
                                    { name: 'stok', label: 'Stok', type: 'number', ph: 'Jumlah stok', def: editBarangData?.stok },
                                    { name: 'kondisi', label: 'Kondisi', type: 'text', ph: 'Baik / Rusak Ringan / dst.', def: editBarangData?.kondisi },
                                ].map(f => (
                                    <div key={f.name} className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.label}</label>
                                        <input required type={f.type} name={f.name} placeholder={f.ph} defaultValue={f.def}
                                            className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium focus:outline-none"
                                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                    </div>
                                ))}
                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => setShowAddBarangModal(false)}
                                        className="flex-1 py-2.5 rounded-xl font-bold text-[13px] cursor-pointer hover:bg-white/10 transition-colors"
                                        style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>Batal</button>
                                    <button type="submit"
                                        className="flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white cursor-pointer hover:brightness-110 transition-all"
                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    MODAL — ADD / EDIT USER
                ═══════════════════════════════════════════════════════════ */}
                {showAddUserModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                        <div className="rounded-2xl p-6 w-full max-w-md space-y-5 animate-scale-up"
                            style={{ background: '#1a1830', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-white text-[16px]">{editUserData ? 'Edit User' : 'Tambah User'}</h3>
                                <button onClick={() => setShowAddUserModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    <Icon path="M6 18L18 6M6 6l12 12" className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={e => {
                                e.preventDefault();
                                const d = Object.fromEntries(new FormData(e.target));
                                if (editUserData) {
                                    setUserList(prev => prev.map(u => u.id === editUserData.id ? { ...u, ...d } : u));
                                } else {
                                    setUserList(prev => [...prev, { id: Math.max(...prev.map(u => u.id)) + 1, ...d }]);
                                }
                                setShowAddUserModal(false);
                            }} className="space-y-4">
                                {[
                                    { name: 'nama', label: 'Nama Lengkap', type: 'text', ph: 'Nama lengkap', def: editUserData?.nama },
                                    { name: 'username', label: 'Username', type: 'text', ph: 'username', def: editUserData?.username },
                                    { name: 'nip', label: 'NIP', type: 'text', ph: 'NIP (opsional)', def: editUserData?.nip },
                                ].map(f => (
                                    <div key={f.name} className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.label}</label>
                                        <input type={f.type} name={f.name} placeholder={f.ph} defaultValue={f.def}
                                            required={f.name !== 'nip'}
                                            className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium focus:outline-none"
                                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                    </div>
                                ))}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Role</label>
                                    <select name="role" defaultValue={editUserData?.role || 'user'}
                                        className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium focus:outline-none cursor-pointer"
                                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => setShowAddUserModal(false)}
                                        className="flex-1 py-2.5 rounded-xl font-bold text-[13px] cursor-pointer hover:bg-white/10 transition-colors"
                                        style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>Batal</button>
                                    <button type="submit"
                                        className="flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white cursor-pointer hover:brightness-110 transition-all"
                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    MODAL — EDIT QR CODE
                ═══════════════════════════════════════════════════════════ */}
                {showQrEditModal && qrEditTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                        <div className="rounded-2xl p-6 w-full max-w-sm space-y-5 animate-scale-up"
                            style={{ background: '#1a1830', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-white text-[16px]">Edit QR Code</h3>
                                <button onClick={() => setShowQrEditModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    <Icon path="M6 18L18 6M6 6l12 12" className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex justify-center">
                                <QrDisplay value={qrEditValue || qrEditTarget.qr_content} size={120} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Konten QR</label>
                                <input type="text" value={qrEditValue} onChange={e => setQrEditValue(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium focus:outline-none"
                                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowQrEditModal(false)}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-[13px] cursor-pointer hover:bg-white/10 transition-colors"
                                    style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>Batal</button>
                                <button onClick={saveQrEdit}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white cursor-pointer hover:brightness-110 transition-all"
                                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>Simpan</button>
                            </div>
                        </div>
                    </div>
                )}

            </Layout>
        </>
    );
}
