import React from 'react';
import { translations, Lang } from '@/lib/translations';

interface Props {
    project: any;
    lang: Lang;
    session: any;
    isSyncing: boolean;
    onSync: (id: string) => void;
    onEdit: (p: any) => void;
    onDelete: (p: any) => void;
    onCopyUrl: (filename: string) => void;
}

export function ProjectCard({ project, lang, session, isSyncing, onSync, onEdit, onDelete, onCopyUrl }: Props) {
    const t = translations[lang];

    return (
        <div className="glass p-6 rounded-[2.5rem] hover-lift group relative overflow-hidden backdrop-blur-3xl border-white/50 dark:border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-[4rem] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h3 className="font-black text-2xl text-foreground tracking-tight">{project.filename}.pdf</h3>
                        {session.user.tier === 'pro' && (
                            <span className="px-3 py-1 bg-amber-400 dark:bg-amber-400/10 text-amber-500 text-[9px] font-black rounded-full uppercase tracking-widest border border-amber-400/20">{(t.misc as any).pro}</span>
                        )}
                    </div>
                    <p className="text-[10px] opacity-30 font-bold uppercase tracking-widest truncate max-w-[200px]">{project.project_id}</p>
                    <div className="flex items-center gap-2 mt-4 opacity-40 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full w-fit">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">{project.view_count || 0} {(t.misc as any).views}</span>
                    </div>

                    {/* Public Link Display */}
                    <div
                        onClick={() => onCopyUrl(project.filename)}
                        className="flex items-center gap-2 mt-2 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors group/link w-full"
                    >
                        <svg className="w-3 h-3 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 truncate flex-1 min-w-0 text-left">
                            {(process.env.NEXT_PUBLIC_CDN_BASE_URL || process.env.NEXT_PUBLIC_CDN_RAW_BASE_URL || '').replace(/^https?:\/\//, '')}/{project.filename}.pdf
                        </span>
                        <svg className="w-3 h-3 text-blue-400 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                </div>
                <div className={`w-4 h-4 rounded-full ${isSyncing
                    ? 'bg-blue-500 animate-pulse-blue'
                    : 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)] animate-pulse'
                    }`}></div>
            </div>

            <div className="flex gap-3 mt-6 flex-wrap">
                <a
                    href={`${process.env.NEXT_PUBLIC_CDN_BASE_URL || process.env.NEXT_PUBLIC_CDN_RAW_BASE_URL || ''}/${project.filename}.pdf`}
                    target="_blank"
                    className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/5"
                >
                    {t.actions.view}
                </a >
                <button
                    onClick={() => onSync(project.id)}
                    disabled={isSyncing}
                    className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${isSyncing
                        ? 'bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-blue-600/20'
                        }`}
                >
                    {isSyncing ? t.actions.syncing : t.actions.sync}
                </button>
                <button
                    onClick={() => onEdit(project)}
                    className="px-4 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    {t.actions.edit}
                </button>
                <button
                    onClick={() => onDelete(project)}
                    className="px-4 py-4 bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    {t.actions.delete}
                </button>
            </div >
        </div >
    );
}
