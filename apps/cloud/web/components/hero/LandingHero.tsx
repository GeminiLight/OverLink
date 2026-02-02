import React from 'react';
import { Logo } from "@/components/Logo";
import { translations, Lang } from "@/lib/translations";

interface Props {
    lang: Lang;
    onLogin: (provider: 'github' | 'google') => void;
}

export function LandingHero({ lang, onLogin }: Props) {
    const t = translations[lang];

    return (
        <div className="w-full flex flex-col items-center">
            {/* Hero Section */}
            <div className="flex min-h-[90vh] flex-col items-center justify-center p-8 z-10 animate-fade-in text-center max-w-5xl">
                <div className="flex items-center justify-center mb-12 animate-float drop-shadow-2xl">
                    <Logo className="w-24 h-24" />
                </div>
                <h1 className="text-7xl md:text-9xl font-black font-[Plus Jakarta Sans] tracking-tighter mb-10 bg-clip-text text-transparent bg-gradient-to-b from-slate-950 via-slate-800 to-slate-600 dark:from-white dark:via-white/90 dark:to-white/40 leading-[0.95] drop-shadow-sm">
                    {t.hero.title}
                </h1>
                <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium mb-14 leading-relaxed">
                    {t.hero.desc}
                </p>
                <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
                    <button
                        onClick={() => onLogin('github')}
                        className="flex-1 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-bold shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
                    >
                        <svg height="24" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="24" className="fill-current">
                            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                        </svg>
                        {t.loginGithub}
                    </button>
                    <button
                        onClick={() => onLogin('google')}
                        className="flex-1 py-5 bg-white dark:bg-white text-slate-900 dark:text-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl font-bold shadow-xl hover:bg-slate-50 dark:hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="1 1 22 22" width="24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        {t.loginGoogle}
                    </button>
                </div>
            </div>

            {/* How it Works */}
            <section className="w-full max-w-6xl px-6 mb-48 z-10 animate-fade-in delay-200">
                <h3 className="text-center text-xs font-black uppercase tracking-[0.5em] text-blue-600 dark:text-blue-400 mb-20 opacity-80">{t.howItWorks.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="glass p-12 rounded-[3.5rem] flex flex-col items-start gap-8 hover-lift group relative overflow-hidden backdrop-blur-3xl border-white/40 dark:border-white/5 shadow-2xl animate-fade-in" style={{ animationDelay: `${num * 0.15}s` }}>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-[6rem] group-hover:scale-125 transition-transform duration-700"></div>
                            <div className="w-16 h-16 rounded-2xl bg-slate-900/5 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-blue-400 font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all text-3xl shadow-lg border border-slate-900/5 dark:border-white/5">
                                {num}
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-2xl font-black text-foreground tracking-tight">{(t.howItWorks as any)[`step${num}`].title}</h4>
                                <p className="text-lg opacity-50 font-medium leading-relaxed">{(t.howItWorks as any)[`step${num}`].desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-24 text-center">
                <p className="text-[10px] font-black uppercase tracking-[1.5em] opacity-20">{t.title} {(t.misc as any).cloudPlatform}</p>
            </footer>
        </div>
    );
}
