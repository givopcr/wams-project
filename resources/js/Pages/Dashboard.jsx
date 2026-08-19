import React, { useState } from 'react';
import Layout from '@/Layouts/Layout';
import { Head, router } from '@inertiajs/react';
import CountUp from '@/Components/CountUp';

// Impor komponen halaman baru
import ScannerPage from '@/Pages/Scanner/Index';
import LogbookPage from '@/Pages/Logbook/Index';
import UsersPage from '@/Pages/Users/Index';
import LaporanPage from '@/Pages/Laporan/Index';

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
export default function Dashboard({ auth }) {
    const [userRole, setUserRole]         = useState(auth?.user?.role ?? 'user');
    const [currentTab, setCurrentTab]     = useState('dashboard');
    const [selectedBarangId, setSelectedBarangId] = useState(null);
    const [searchQuery, setSearchQuery]   = useState('');

    const [barangList, setBarangList] = useState([
        { id: 1, kode_barang: 'BRG-001', qr_content: 'BRG-001', nama_barang: 'Laptop ThinkPad X1 Carbon', kategori: 'Elektronik', lokasi: 'Ruang IT', status: 'tersedia', kondisi: 'Baik', stok: 15, detail: 'Intel i7, 16GB RAM, 512GB SSD', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60' },
        { id: 2, kode_barang: 'BRG-002', qr_content: 'BRG-002', nama_barang: 'Meja Kerja Ergonomis', kategori: 'Komponen', lokasi: 'Lantai 2', status: 'tersedia', kondisi: 'Baik', stok: 30, detail: 'Meja adjustable height 120x60cm', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=60' },
        { id: 3, kode_barang: 'BRG-003', qr_content: 'BRG-003', nama_barang: 'Projector Epson EB-X400', kategori: 'Elektronik', lokasi: 'Ruang Meeting', status: 'dipinjam', kondisi: 'Baik', stok: 5, detail: '3300 Lumens, HDMI, VGA', image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&auto=format&fit=crop&q=60' },
        { id: 4, kode_barang: 'BRG-004', qr_content: 'BRG-004', nama_barang: 'Bor Listrik Bosch GSB 550', kategori: 'Perkakas', lokasi: 'Gudang A', status: 'tersedia', kondisi: 'Baik', stok: 8, detail: 'Smart Drill 550W, 13mm', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60' },
        { id: 5, kode_barang: 'BRG-005', qr_content: 'BRG-005', nama_barang: 'Solder Listrik Adjustable', kategori: 'Perkakas', lokasi: 'Ruang Lab', status: 'tersedia', kondisi: 'Baik', stok: 12, detail: 'Solder 60W Adjustable Temperature', image: 'https://images.unsplash.com/photo-1608962714022-ae9a04a6015b?w=500&auto=format&fit=crop&q=60' },
        { id: 6, kode_barang: 'BRG-006', qr_content: 'BRG-006', nama_barang: 'IC Mikrokontroler Atmega328', kategori: 'Komponen', lokasi: 'Gudang B', status: 'maintenance', kondisi: 'Rusak Ringan', stok: 46, detail: 'IC 8-bit AVR microcontroller', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60' },
    ]);

    const [kategoriList] = useState(['Perkakas', 'Elektronik', 'Komponen']);

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
    const [showQrEditModal, setShowQrEditModal]       = useState(false);
    const [qrEditTarget, setQrEditTarget]             = useState(null);
    const [qrEditValue, setQrEditValue]               = useState('');
    const [pendingImage, setPendingImage]             = useState(null);

    // Filters
    const [searchBarang, setSearchBarang]         = useState('');

    const handleLogout = () => router.post('/logout');

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
                                    label: 'Total Barang', count: totalBarang, suffix: ' Unit', sub: 'Total Barang',
                                    trend: '+12% bulan ini', trendUp: true,
                                    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
                                    iconColor: '#818cf8', iconBg: 'rgba(129,140,248,0.15)',
                                },
                                {
                                    label: 'Kategori Aset', count: kategoriList.length, suffix: ' Kategori', sub: 'Kategori Aset',
                                    trend: 'Terorganisir', trendUp: true,
                                    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
                                    iconColor: '#c084fc', iconBg: 'rgba(192,132,252,0.15)',
                                },
                                {
                                    label: 'Aktivitas Logbook', count: logList.length * 4, suffix: ' Transaksi', sub: 'Aktivitas Logbook',
                                    trend: `${logList.filter(l => l.status === 'Selesai').length * 3} baru hari ini`, trendUp: true,
                                    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                                    iconColor: '#34d399', iconBg: 'rgba(52,211,153,0.15)',
                                },
                                {
                                    label: 'Kondisi Baik', count: parseFloat(`${kondisiBaikPct}.8`), suffix: '%', sub: 'Kondisi Baik',
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
                                                <p className="text-2xl font-black text-white">
                                                    <CountUp from={0} to={card.count} duration={1.4} separator="," className="tabular-nums" />
                                                    {card.suffix}
                                                </p>
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
                                <div className="w-full md:w-5/12 rounded-2xl flex flex-col items-center justify-center p-4 min-h-[260px] gap-3"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <img src={item.image} alt={item.nama_barang} className="max-h-52 max-w-full rounded-xl object-cover" />
                                    {userRole === 'admin' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const inp = document.createElement('input');
                                                inp.type = 'file';
                                                inp.accept = 'image/*';
                                                inp.onchange = (ev) => {
                                                    const file = ev.target.files[0];
                                                    if (file) {
                                                        const url = URL.createObjectURL(file);
                                                        setBarangList(prev => prev.map(b => b.id === item.id ? { ...b, image: url } : b));
                                                    }
                                                };
                                                inp.click();
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer hover:brightness-110 transition-all"
                                            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Ganti Gambar
                                        </button>
                                    )}
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
                    <ScannerPage barangList={barangList} viewDetail={viewDetail} active={currentTab === 'scan'} />
                )}

                {/* ══════════════════════════════════════════════════════════
                    TAB 5 — LOGBOOK AKTIVITAS
                ═══════════════════════════════════════════════════════════ */}
                {currentTab === 'logbook' && (
                    <LogbookPage logList={logList} barangList={barangList} />
                )}

                {/* ══════════════════════════════════════════════════════════
                    TAB 6 — MANAJEMEN USER
                ═══════════════════════════════════════════════════════════ */}
                {currentTab === 'users' && (
                    <UsersPage userList={userList} setUserList={setUserList} userRole={userRole} />
                )}


                {/* ══════════════════════════════════════════════════════════
                    TAB 7 — LAPORAN & ANALYTICS
                ═══════════════════════════════════════════════════════════ */}
                {currentTab === 'laporan' && (
                    <LaporanPage />
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
                                const imgSrc = pendingImage || (editBarangData?.image) || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60';
                                if (editBarangData) {
                                    setBarangList(prev => prev.map(b => b.id === editBarangData.id ? { ...b, ...d, stok: parseInt(d.stok) || b.stok, image: imgSrc } : b));
                                } else {
                                    const newId = Math.max(...barangList.map(b => b.id)) + 1;
                                    const kode = `BRG-${String(newId).padStart(3, '0')}`;
                                    setBarangList(prev => [...prev, { id: newId, kode_barang: kode, qr_content: kode, ...d, stok: parseInt(d.stok) || 1, status: 'tersedia', detail: d.detail || '', image: imgSrc }]);
                                }
                                setPendingImage(null);
                                setShowAddBarangModal(false);
                            }} className="space-y-4">
                                {/* Nama Barang */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Nama Barang</label>
                                    <input required type="text" name="nama_barang" placeholder="Nama barang" defaultValue={editBarangData?.nama_barang}
                                        className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium focus:outline-none"
                                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>

                                {/* Kategori � dropdown */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Kategori</label>
                                    <select required name="kategori" defaultValue={editBarangData?.kategori || ''}
                                        className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium focus:outline-none cursor-pointer"
                                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                                        <option value="" disabled style={{ background: '#1a1830', color: 'rgba(255,255,255,0.35)' }}>-- Pilih Kategori --</option>
                                        {kategoriList.map(k => (
                                            <option key={k} value={k} style={{ background: '#1a1830', color: 'white' }}>{k}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Lokasi */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Lokasi</label>
                                    <input required type="text" name="lokasi" placeholder="Lokasi" defaultValue={editBarangData?.lokasi}
                                        className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium focus:outline-none"
                                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>

                                {/* Stok */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Stok</label>
                                    <input required type="number" name="stok" placeholder="Jumlah stok" defaultValue={editBarangData?.stok}
                                        className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium focus:outline-none"
                                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>

                                {/* Kondisi */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Kondisi</label>
                                    <input required type="text" name="kondisi" placeholder="Baik / Rusak Ringan / dst." defaultValue={editBarangData?.kondisi}
                                        className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium focus:outline-none"
                                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>

                                {/* Gambar Barang */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Gambar Barang</label>
                                    <div className="flex items-center gap-3">
                                        {(pendingImage || editBarangData?.image) && (
                                            <img
                                                src={pendingImage || editBarangData?.image}
                                                alt="preview"
                                                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const inp = document.createElement('input');
                                                inp.type = 'file';
                                                inp.accept = 'image/*';
                                                inp.onchange = (ev) => {
                                                    const file = ev.target.files[0];
                                                    if (file) setPendingImage(URL.createObjectURL(file));
                                                };
                                                inp.click();
                                            }}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer hover:brightness-110 transition-all"
                                            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {pendingImage || editBarangData?.image ? 'Ganti Gambar' : 'Pilih Gambar'}
                                        </button>
                                        {pendingImage && (
                                            <button type="button" onClick={() => setPendingImage(null)}
                                                className="text-[11px] font-bold cursor-pointer" style={{ color: '#f87171' }}>Reset</button>
                                        )}
                                    </div>
                                </div>

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
