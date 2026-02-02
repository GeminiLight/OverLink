import React from 'react';
import { translations, Lang } from '@/lib/translations';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    filename: string;
    setFilename: (s: string) => void;
    projectId: string;
    setProjectId: (s: string) => void;
    lang: Lang;
    loading: boolean;
}

export function EditProjectModal({ isOpen, onClose, onSubmit, filename, setFilename, projectId, setProjectId, lang, loading }: Props) {
    if (!isOpen) return null;
    const t = translations[lang];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-fade-in bg-slate-900/40 backdrop-blur-sm">
            <div className="glass-modal w-full max-w-lg p-12 rounded-[3.5rem] animate-scale-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-[4rem] pointer-events-none"></div>
                <h2 className="text-3xl font-black tracking-tighter text-foreground mb-8">{t.modal.editTitle}</h2>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{t.form.filename}</label>
                        <input
                            value={filename}
                            onChange={e => setFilename(e.target.value)}
                            className="w-full bg-slate-50/50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 p-5 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-foreground transition-all font-medium text-lg leading-none"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{t.form.projectId}</label>
                        <input
                            value={projectId}
                            onChange={e => setProjectId(e.target.value)}
                            className="w-full bg-slate-50/50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 p-5 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-foreground transition-all font-medium text-lg leading-none"
                            required
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                        >
                            {t.modal.cancel}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {loading ? t.form.submitting : t.modal.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
