import React from 'react';

export default function Sidebar({ sidebarOpen, currentTab, setCurrentTab, handleLogout }) {
    const menus = [
        {
            id: 'dashboard', name: 'Dashboard',
            badge: null,
            icon: (
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
                </svg>
            ),
        },
        {
            id: 'barang', name: 'Data Barang',
            badge: 48,
            icon: (
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
        },
        {
            id: 'kategori', name: 'Kategori',
            badge: 6,
            icon: (
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            ),
        },
        {
            id: 'scan', name: 'Scanner Aset QR',
            badge: null,
            icon: (
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
            ),
        },
        {
            id: 'logbook', name: 'Logbook Aktivitas',
            badge: 12,
            icon: (
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
        },
        {
            id: 'users', name: 'Manajemen User',
            badge: null,
            icon: (
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            id: 'laporan', name: 'Laporan & Analytics',
            badge: null,
            icon: (
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
    ];

    return (
        <aside
            className={`
                flex flex-col flex-shrink-0 transition-all duration-300 z-20
                ${sidebarOpen ? 'w-64' : 'w-[72px]'}
            `}
            style={{ background: 'var(--sidebar-bg, #13122a)', borderRight: '1px solid var(--sidebar-border, rgba(255,255,255,0.06))' }}
        >
            {/* Brand */}
            <div className="h-16 flex items-center gap-3 px-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--sidebar-border, rgba(255,255,255,0.06))' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                {sidebarOpen && (
                    <div className="overflow-hidden">
                        <p className="text-white font-bold text-[15px] leading-tight tracking-tight">AssetMaster</p>
                        <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--accent-purple, #a78bfa)' }}>ADMIN</p>
                    </div>
                )}
            </div>

            {/* Nav group */}
            <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
                <p className={`text-[9px] font-bold tracking-[0.15em] uppercase mb-2 px-2 transition-all duration-200 ${sidebarOpen ? 'opacity-60' : 'opacity-0'}`}
                    style={{ color: 'var(--text-muted, #6b7280)' }}>
                    MENU UTAMA
                </p>

                {menus.map((menu) => {
                    const active = currentTab === menu.id || (menu.id === 'barang' && currentTab === 'detail-barang');
                    return (
                        <button
                            key={menu.id}
                            onClick={() => setCurrentTab(menu.id)}
                            title={!sidebarOpen ? menu.name : undefined}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-[13px]
                                transition-all duration-150 group relative
                                ${active
                                    ? 'text-white shadow-lg'
                                    : 'hover:bg-white/5'
                                }
                            `}
                            style={active ? {
                                background: 'linear-gradient(90deg, rgba(124,58,237,0.25) 0%, rgba(99,102,241,0.15) 100%)',
                                borderLeft: '3px solid #7c3aed',
                                paddingLeft: '9px',
                            } : { color: 'var(--text-muted, #9ca3af)' }}
                        >
                            <span style={active ? { color: '#a78bfa' } : {}}>
                                {menu.icon}
                            </span>

                            {sidebarOpen && (
                                <>
                                    <span className="flex-1 text-left">{menu.name}</span>
                                    {menu.badge !== null && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={active
                                                ? { background: 'rgba(124,58,237,0.4)', color: '#c4b5fd' }
                                                : { background: 'rgba(255,255,255,0.08)', color: '#6b7280' }
                                            }>
                                            {menu.badge}
                                        </span>
                                    )}
                                    {active && (
                                        <svg className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#a78bfa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User footer */}
            <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid var(--sidebar-border, rgba(255,255,255,0.06))' }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white' }}>
                        AD
                    </div>
                    {sidebarOpen && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-white text-[13px] font-semibold leading-tight truncate">Administrator</p>
                            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted, #6b7280)' }}>@ Admin System</p>
                        </div>
                    )}
                    {sidebarOpen && (
                        <button
                            onClick={handleLogout}
                            className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/10 cursor-pointer"
                            style={{ color: 'var(--text-muted, #6b7280)' }}
                            title="Logout"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
