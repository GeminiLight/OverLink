import React from 'react';
import { translations, Lang } from '@/lib/translations';

interface Props {
    lang: Lang;
}

export function PricingTable({ lang }: Props) {
    const t = translations[lang];
    const p = t.pricing;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-20">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    {p.title}
                </h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
                    {p.subtitle}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Free Tier */}
                <div className="glass p-8 rounded-[2.5rem] border-white/50 dark:border-white/5 hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/20 dark:bg-white/5 rounded-bl-[10rem] -mr-16 -mt-16 transition-all group-hover:scale-110"></div>

                    <h3 className="text-2xl font-black uppercase tracking-widest text-slate-400 mb-2">{p.free.title}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-5xl font-black text-foreground">{p.free.price}</span>
                        <span className="text-slate-400 font-bold">{p.monthly}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 mb-8 h-10">{p.free.desc}</p>

                    <ul className="space-y-4 mb-8">
                        {p.free.features.map((feat: string, i: number) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                {feat}
                            </li>
                        ))}
                    </ul>

                    <button className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-500 font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/20 transition-all">
                        Current Plan
                    </button>
                </div>

                {/* Pro Tier (Featured) */}
                <div className="glass p-8 rounded-[2.5rem] border-blue-500/30 dark:border-blue-500/30 relative overflow-hidden group scale-105 shadow-2xl shadow-blue-500/20">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-x"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-bl-[10rem] -mr-16 -mt-16 transition-all group-hover:scale-110 pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-2xl font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">{p.pro.title}</h3>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Most Popular</span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-6xl font-black text-foreground">{p.pro.price}</span>
                        <span className="text-slate-400 font-bold">{p.monthly}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 mb-8 h-10">{p.pro.desc}</p>

                    <ul className="space-y-4 mb-8">
                        {p.pro.features.map((feat: string, i: number) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground">
                                <div className="p-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                {feat}
                            </li>
                        ))}
                    </ul>

                    <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20">
                        {p.pro.cta}
                    </button>
                </div>

                {/* Institutional Tier */}
                <div className="glass p-8 rounded-[2.5rem] border-white/50 dark:border-white/5 hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/20 dark:bg-white/5 rounded-bl-[10rem] -mr-16 -mt-16 transition-all group-hover:scale-110"></div>

                    <h3 className="text-2xl font-black uppercase tracking-widest text-slate-400 mb-2">{p.institutional.title}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-5xl font-black text-foreground">{p.institutional.price}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 mb-8 h-10">{p.institutional.desc}</p>

                    <ul className="space-y-4 mb-32">
                        <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            SSO / SAML
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            Dedicated Support
                        </li>
                    </ul>

                    <button className="w-full py-4 rounded-2xl border-2 border-slate-200 dark:border-white/10 text-foreground font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                        {p.institutional.cta}
                    </button>
                </div>
            </div>
        </div>
    );
}
