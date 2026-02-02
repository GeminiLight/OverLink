import React from 'react';
import { translations, Lang } from '../../../lib/translations';

interface Props {
    lang: Lang;
}

export function FAQ({ lang }: Props) {
    const t = translations[lang];

    return (
        <section className="w-full max-w-5xl px-6 mb-48 z-10">
            <h3 className="text-center text-xs font-black uppercase tracking-[0.5em] text-blue-600 dark:text-blue-400 mb-20 opacity-80">{t.faq.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-20">
                {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-5 border-l-2 border-blue-600/20 dark:border-white/5 pl-8 py-2">
                        <h4 className="font-bold text-2xl tracking-tight text-foreground opacity-90">{(t as any).faq[`q${i}`]}</h4>
                        <p className="text-lg opacity-40 font-medium leading-relaxed">{(t as any).faq[`a${i}`]}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
