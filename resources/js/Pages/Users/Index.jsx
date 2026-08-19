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

function Icon({ path, className = 'h-5 w-5', sw = 2, style }) {
    return (
        <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={sw}>
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );
}

export default function Index({ userList, setUserList, userRole }) {
    const [searchUser, setSearchUser]         = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [editUserData, setEditUserData]         = useState(null);

    return (
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

            {/* MODAL — ADD / EDIT USER */}
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
        </div>
    );
}
