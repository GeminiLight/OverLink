import { useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { supabase } from '@/lib/supabaseClient';

const fetcher = async (key: string[]) => {
    const [, userId] = key;
    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order('created_at', { ascending: false }); // Ensure consistent ordering
    if (error) throw error;
    return data || [];
};

export function useProjects(userId: string | undefined) {
    const swrKey = userId ? ['projects', userId] : null;

    // Use SWR for fetching projects
    const { data: projects = [], error, isLoading, mutate } = useSWR(
        swrKey,
        fetcher,
        {
            revalidateOnFocus: true, // Auto update when coming back to tab
            dedupingInterval: 2000,
        }
    );

    const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
    // We can keep 'loading' state for mutations specifically if needed, 
    // but 'isLoading' from SWR covers correct initial load.
    const [mutationLoading, setMutationLoading] = useState(false);

    const addProject = async (filename: string, projectId: string) => {
        if (!userId) return { success: false };
        setMutationLoading(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, filename, projectId })
            });
            const result = await res.json();
            if (res.ok) {
                // Mutate cache: add new project to list optimistically or revalidate
                mutate();
                return { success: true, data: result.data, status: res.status };
            }
            return { success: false, error: result.error, status: res.status };
        } catch (e: any) {
            return { success: false, error: e.message, status: 500 };
        } finally {
            setMutationLoading(false);
        }
    };

    const updateProject = async (id: string, filename: string, projectId: string) => {
        if (!userId) return { success: false, error: "Not authenticated", status: 401 };
        setMutationLoading(true);
        try {
            const res = await fetch("/api/projects", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, userId, filename, projectId })
            });
            const result = await res.json();
            if (res.ok) {
                mutate();
                return { success: true, status: res.status };
            }
            return { success: false, error: result.error, status: res.status };
        } catch (e: any) {
            return { success: false, error: e.message, status: 500 };
        } finally {
            setMutationLoading(false);
        }
    };

    const deleteProject = async (id: string) => {
        if (!userId) return false;
        setMutationLoading(true);

        // Optimistic delete
        mutate(
            projects.filter((p: any) => p.id !== id),
            false // Don't revalidate immediately, wait for API
        );

        try {
            const res = await fetch(`/api/projects?id=${id}&userId=${userId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                mutate(); // Revalidate to be sure
                return true;
            }
            // Revert on failure
            mutate();
            return false;
        } catch (e) {
            mutate();
            return false;
        } finally {
            setMutationLoading(false);
        }
    };

    const syncProject = async (projId: string) => {
        if (!userId) return false;
        setSyncingIds(prev => new Set(prev).add(projId));

        // Optimistic Update for UI status
        mutate(
            projects.map((p: any) =>
                p.id === projId ? { ...p, last_sync_status: 'running', last_sync_at: new Date().toISOString() } : p
            ),
            false
        );

        try {
            const res = await fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId: projId, userId })
            });

            if (!res.ok) {
                setSyncingIds((prev: Set<string>) => {
                    const next = new Set(prev);
                    next.delete(projId);
                    return next;
                });
                mutate(); // Revert/Refresh
                return false;
            }
            // Success usually means job started, we can keep 'running' or poll.
            // For now, let's leave it and maybe revalidate.
            mutate();
            return true;
        } catch (e) {
            setSyncingIds((prev: Set<string>) => {
                const next = new Set(prev);
                next.delete(projId);
                return next;
            });
            mutate();
            return false;
        }
    };

    return {
        projects,
        syncingIds,
        loading: isLoading || mutationLoading, // Combine loading states
        fetchProjects: mutate, // Expose mutate as fetchProjects for manual refresh compatibility
        addProject,
        updateProject,
        deleteProject,
        syncProject
    };
}
