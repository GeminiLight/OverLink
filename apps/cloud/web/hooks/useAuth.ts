import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useAuth() {
    const [session, setSession] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false); // Set loading false as soon as we have session/user
                if (session?.user) {
                    fetchProfile(session.user.id); // Non-blocking profile fetch
                }
            } catch (e) {
                console.error("Error initializing session:", e);
                setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            } catch (e) {
                console.error("Error on auth state change:", e);
            } finally {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
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
