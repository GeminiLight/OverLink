"use client";
import React, { useEffect, useState } from 'react';

export function DebugOverlay({ session }: { session: any }) {
    const [envCheck, setEnvCheck] = useState<any>({});

    useEffect(() => {
        setEnvCheck({
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            key: !!(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        });
    }, []);

    // Only show if something is wrong or session is missing (helpful for debugging)
    // Or always show for now since user asked for indepth debug
    return (
        <div className="fixed bottom-4 right-4 p-4 bg-black/90 text-white text-[10px] rounded-lg z-[9999] font-mono whitespace-pre shadow-2xl border border-white/10">
            <h3 className="font-bold mb-2 text-yellow-400 border-b border-white/20 pb-1">🛑 AUTH DEBUGGER</h3>
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
