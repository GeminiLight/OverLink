import React, { useState } from 'react';
import { translations, Lang } from '@/lib/translations';

interface Props {
    profile: any;
    session: any;
    lang: Lang;
    onUpdateNickname: (name: string) => void;
    onLogout: () => void;
}

export function UserProfile({ profile, session, lang, onUpdateNickname, onLogout }: Props) {
    const t = translations[lang];
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState("");

    const startEdit = () => {
        setNickname(profile?.nickname || session?.user?.user_metadata?.full_name || "User");
        setIsEditing(true);
    };

    const handleBlur = () => {
        if (nickname.trim()) {
            onUpdateNickname(nickname);
        }
        setIsEditing(false);
    };

    return (
        <header className="flex justify-between items-center mb-16 px-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/10 overflow-hidden bg-gradient-to-tr from-blue-600 to-purple-600">
                    {(profile?.avatar_url || session?.user?.user_metadata?.avatar_url) ? (
                        <img
                            src={profile?.avatar_url || session?.user?.user_metadata?.avatar_url}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-white font-bold text-2xl">O</span>
                    )}
                </div>
                <div>
                    <div>
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    autoFocus
                                    value={nickname}
                                    onChange={e => setNickname(e.target.value)}
                                    onBlur={handleBlur}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleBlur();
                                        if (e.key === 'Escape') setIsEditing(false);
                                    }}
                                    className="text-3xl font-black tracking-tighter text-foreground bg-transparent border-b-2 border-blue-500 outline-none w-48"
                                />
                            </div>
                        ) : (
                            <h1
                                onClick={startEdit}
                                className="text-3xl font-black tracking-tighter text-foreground cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2 group"
                            >
                                {profile?.nickname || session?.user?.user_metadata?.full_name || "Dashboard"}
                                <svg className="w-4 h-4 opacity-0 group-hover:opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </h1>
                        )}
                        <p className="text-xs uppercase tracking-widest opacity-30 font-bold">{session.user.email}</p>
                    </div>
                </div>
            </div>
            <div className="flex gap-4 items-center">
                {session.user.tier !== 'pro' ? (
                    <button
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:scale-105 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20"
                    >
                        {(t.misc as any).goPro}
                    </button>
                ) : (
                    <span className="px-6 py-2.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-foreground border border-white/10">{(t.misc as any).proTier}</span>
                )}
                <button
                    onClick={onLogout}
                    className="px-6 py-2.5 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all text-foreground"
                >
                    {t.logout}
                </button>
            </div>
        </header>
    );
}
