import React from 'react';

function Icon({ path, className = 'h-5 w-5', sw = 2, style }) {
    return (
        <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={sw}>
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );
}

export default function Index() {
    return (
        <div className="animate-fade-in flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.15)' }}>
                <Icon path="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="h-8 w-8" style={{ color: '#818cf8' }} />
            </div>
            <p className="text-white font-bold text-lg">Laporan & Analytics</p>
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Fitur ini akan segera tersedia.</p>
        </div>
    );
}
