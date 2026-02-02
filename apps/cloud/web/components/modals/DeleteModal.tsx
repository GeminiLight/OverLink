import React from 'react';
import { translations, Lang } from '@/lib/translations';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    lang: Lang;
    loading: boolean;
}

export function DeleteModal({ isOpen, onClose, onConfirm, lang, loading }: Props) {
    if (!isOpen) return null;
    const t = translations[lang];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-fade-in bg-slate-900/40 backdrop-blur-sm">
            <div className="glass-modal w-full max-w-sm p-12 rounded-[3.5rem] animate-scale-in text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-bl-[4rem] pointer-events-none"></div>
                <div className="w-16 h-16 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h2 className="text-2xl font-black tracking-tighter text-foreground mb-4">{t.modal.deleteTitle}</h2>
                <p className="text-sm opacity-50 font-medium mb-10 leading-relaxed">{t.modal.deleteConfirm}</p>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                        {t.modal.cancel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {loading ? "..." : t.modal.confirmDelete}
                    </button>
                </div>
            </div>
        </div>
    );
}
