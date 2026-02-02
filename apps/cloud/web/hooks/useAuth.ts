import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useAuth() {
    const [session, setSession] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading spinner
        const safetyTimeout = setTimeout(() => {
            if (mounted) {
                console.warn("[useAuth] Safety timeout reached, forcing loading to false");
                setLoading(false);
            }
        }, 10000);

        const initSession = async () => {
            try {
                // Supabase parses URL hash automatically on initialization
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        fetchProfile(session.user.id);
                    }
                }
            } catch (e) {
                console.error("[useAuth] Session init error:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("[useAuth] Auth Event:", event);

            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }

                // SIGNED_IN or INITIAL_SESSION events should definitely mark loading as false
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (data) setProfile(data);
    };

    const updateNickname = async (newNickname: string) => {
        if (!user) return false;
        const { error } = await supabase
            .from('profiles')
            .update({ nickname: newNickname })
            .eq('id', user.id);

        if (!error) {
            setProfile((prev: any) => ({ ...prev, nickname: newNickname }));
            return true;
        }
        return false;
    };

    const login = async (provider: 'github' | 'google') => {
        await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.origin }
        });
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return {
        session,
        user,
        profile,
        loading,
        login,
        logout,
        updateNickname,
        refreshProfile: () => user && fetchProfile(user.id)
    };
}
