import React from 'react';

interface Props {
    notification: { message: string, type: 'success' | 'error' } | null;
}

export function Toast({ notification }: Props) {
    if (!notification) return null;

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
            <div className={`px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-3xl border ${notification.type === 'success'
                ? 'bg-emerald-500/90 text-white border-emerald-400/20'
                : 'bg-red-500/90 text-white border-red-400/20'
                } flex items-center gap-4 font-bold text-sm tracking-wide`}>
                {notification.type === 'success' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                {notification.message}
            </div>
        </div>
    );
}
