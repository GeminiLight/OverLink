import React from 'react';
import { translations, Lang } from '@/lib/translations';

interface Props {
    lang: Lang;
}

export function Features({ lang }: Props) {
    const t = translations[lang];

    return (
        <section className="w-full max-w-6xl px-6 mb-48 z-10 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 p-12 bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center hover:bg-white dark:hover:bg-white/[0.05] transition-all group backdrop-blur-xl animate-fade-in delay-300">
                    <div className="space-y-4">
                        <h4 className="text-3xl font-black tracking-tighter group-hover:text-blue-600 transition-colors uppercase">{t.features.sync}</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{(t.features as any).syncDesc}</p>
                    </div>
                </div>
                <div className="md:col-span-1 p-12 bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center hover:bg-white dark:hover:bg-white/[0.05] transition-all group backdrop-blur-xl animate-fade-in delay-400">
                    <div className="space-y-4">
                        <h4 className="text-3xl font-black tracking-tighter group-hover:text-purple-600 transition-colors uppercase">{t.features.url}</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{(t.features as any).urlDesc}</p>
                    </div>
                </div>
                <div className="md:col-span-1 p-12 bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center hover:bg-white dark:hover:bg-white/[0.05] transition-all group backdrop-blur-xl animate-fade-in delay-500">
                    <div className="space-y-4">
                        <h4 className="text-3xl font-black tracking-tighter group-hover:text-emerald-600 transition-colors uppercase">{t.features.open}</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{(t.features as any).openDesc}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
