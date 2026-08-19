import React, { useState } from 'react';

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

export default function Index({ logList, barangList }) {
    const [filterLogUser, setFilterLogUser]       = useState('Semua User');
    const [filterLogBarang, setFilterLogBarang]   = useState('Semua Barang');
    const [filterLogStatus, setFilterLogStatus]   = useState('Semua Status');

    return (
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
    );
}
