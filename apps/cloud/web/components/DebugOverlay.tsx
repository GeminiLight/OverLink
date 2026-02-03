"use client";
import React, { useEffect, useState } from 'react';

export function DebugOverlay({ session }: { session: any }) {
    const [envCheck, setEnvCheck] = useState<any>({});
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const check = {
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            key: !!(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        };
        setEnvCheck(check);
        // Force show if envs are missing
        if (!check.url || !check.key) setIsVisible(true);
    }, []);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 w-6 h-6 bg-red-500/20 hover:bg-red-500/50 rounded-full z-[9999] transition-all"
                title="Show Debugger"
            />
        );
    }

    return (
        <div className="fixed bottom-4 right-4 p-4 bg-black/90 text-white text-[10px] rounded-lg z-[9999] font-mono whitespace-pre shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-2 border-b border-white/20 pb-1">
                <h3 className="font-bold text-yellow-400">🛑 AUTH DEBUGGER</h3>
                <button onClick={() => setIsVisible(false)} className="text-white/50 hover:text-white">✕</button>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between gap-4">
                    <span>Supabase URL:</span>
                    <span>{envCheck.url ? '✅ OK' : '❌ MISSING'}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span>Supabase Key:</span>
                    <span>{envCheck.key ? '✅ OK' : '❌ MISSING'}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span>Session:</span>
                    <span className={session ? 'text-green-400' : 'text-red-400'}>{session ? 'ACTIVE' : 'NULL'}</span>
                </div>
                {session && (
                    <div className="flex justify-between gap-4">
                        <span>User:</span>
                        <span>{session.user.email}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
