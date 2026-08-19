import React, { useState, useEffect, useRef } from 'react';

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

function Icon({ path, className = 'h-5 w-5', sw = 2, style }) {
    return (
        <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={sw}>
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );
}

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

let Html5QrcodeLib = null;

export default function Index({ barangList, viewDetail, active }) {
    const [cameraPermission, setCameraPermission] = useState('idle');
    const [scannerReady, setScannerReady]         = useState(false);
    const [scanResult, setScanResult]             = useState('');
    const scannerInstanceRef                      = useRef(null);

    const startCamera = async () => {
        setCameraPermission('requesting'); setScanResult('');
        try {
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
        if (!active) {
            stopCamera();
            setCameraPermission('idle');
            setScanResult('');
        }
    }, [active]);

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-5">
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
                <DarkCard className="md:col-span-3 overflow-hidden">
                    <div className="relative w-full" style={{ aspectRatio: '4/3', background: '#0a0a14' }}>
                        <div id="qr-camera-box" className={`absolute inset-0 ${!scannerReady ? 'hidden' : ''}`} />

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
    );
}
