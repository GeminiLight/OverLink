import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useProjects(userId: string | undefined) {
    const [projects, setProjects] = useState<any[]>([]);
    const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    const fetchProjects = useCallback(async () => {
        if (!userId) return;
        const { data } = await supabase.from("projects").select("*").eq("user_id", userId);
        if (data) setProjects(data);
    }, [userId]);

    const addProject = async (filename: string, projectId: string) => {
        if (!userId) return { success: false };
        setLoading(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, filename, projectId })
            });
            const result = await res.json();
            if (res.ok) {
                await fetchProjects();
                return { success: true, data: result.data };
            }
            return { success: false, error: result.error };
        } catch (e: any) {
            return { success: false, error: e.message };
        } finally {
            setLoading(false);
        }
    };

    const updateProject = async (id: string, filename: string, projectId: string) => {
        if (!userId) return false;
        setLoading(true);
        try {
            const res = await fetch("/api/projects", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, userId, filename, projectId })
            });
            if (res.ok) {
                await fetchProjects();
                return true;
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (id: string) => {
        if (!userId) return false;
        setLoading(true);
        try {
            const res = await fetch(`/api/projects?id=${id}&userId=${userId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                await fetchProjects();
                return true;
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const syncProject = async (projId: string) => {
        if (!userId) return false;
        setSyncingIds(prev => new Set(prev).add(projId));

        // Optimistic Update
        setProjects(prev => prev.map(p =>
            p.id === projId ? { ...p, last_sync_status: 'running', last_sync_at: new Date().toISOString() } : p
        ));

        try {
            const res = await fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId: projId, userId })
            });

            if (!res.ok) {
                setSyncingIds(prev => {
                    const next = new Set(prev);
                    next.delete(projId);
                    return next;
                });
                fetchProjects();
                return false;
            }
            return true;
        } catch (e) {
            setSyncingIds(prev => {
                const next = new Set(prev);
                next.delete(projId);
                return next;
            });
            return false;
        }
    };

    return {
        projects,
        syncingIds,
        loading,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        syncProject
    };
}
