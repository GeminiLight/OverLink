"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { translations, Lang } from "@/lib/translations";
import { PricingTable } from "@/components/pricing/PricingTable";
import Link from 'next/link';

export default function PricingPage() {
    const { theme, toggleTheme } = useTheme();
    const [lang, setLang] = useState<Lang>('en');

    // Auto-detect Language
    useEffect(() => {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('zh')) setLang('zh');
    }, []);

    const t = translations[lang];

    return (
        <div className="min-h-screen w-full relative overflow-x-hidden text-foreground bg-background transition-colors duration-500">
            {/* Background FX */}
            <div className="absolute top-[-10%] left-[20%] w-[1000px] h-[1000px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[160px] pointer-events-none transition-colors duration-700 animate-pulse"></div>

            {/* Navbar Controls */}
            <div className="absolute top-6 left-6 z-50">
                <Link href="/" className="px-5 py-3 rounded-2xl border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/40 dark:hover:bg-white/10 transition-all text-foreground active:scale-95 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back
                </Link>
            </div>
            <div className="absolute top-6 right-6 z-50 flex gap-3">
                <button onClick={toggleTheme} className="p-3 rounded-2xl bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 transition-all text-slate-800 dark:text-gray-200 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-2xl group active:scale-95">
                    {theme === 'light' ? <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                </button>
                <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')} className="px-5 py-3 rounded-2xl border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/40 dark:hover:bg-white/10 transition-all text-foreground active:scale-95">
                    {lang === 'en' ? '🇬🇧 EN' : '🇨🇳 中文'}
                </button>
            </div>

            <PricingTable lang={lang} />
        </div>
    );
}
