
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { encryptToString } from '@/lib/crypto';

// Admin client to read secure data if needed, though here we might just pass args
// Actually we should fetch credentials from DB to verify ownership before triggering
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY! // Needed to read encrypted columns if we used RLS to hide them? 
    // For this MVP, let's assume standard client can read if user owns it. 
    // BUT we stored them in `overlink_password_enc` which might be readable by owner.
);

export async function POST(request: Request) {
    try {
        const { projectId, userId } = await request.json();

        if (!projectId || !userId) {
            return NextResponse.json({ error: 'Missing projectId or userId' }, { status: 400 });
        }

        // 1. Fetch Project Details from DB
        // We strictly verify that the requester owns this project would happen via RLS in a real app
        // Here we just fetch by ID.
        const { data: project, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('user_id', userId)
            .single();

        if (error || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // 3. Trigger GitHub Dispatch
        // We pass the encrypted credentials directly from DB.
        // worker.py will decrypt them using the same ENCRYPTION_KEY.
        const workerPayload = {
            filename: project.filename,
            project_id: project.project_id,
            email: project.overleaf_email_enc,
            password: project.overleaf_password_enc,
            is_encrypted: true // Tell worker to decrypt
        };

        // 3. Trigger GitHub Dispatch
        const response = await fetch(
            `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.everest-preview+json',
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                },
                body: JSON.stringify({
                    event_type: 'sync_job',
                    client_payload: workerPayload,
                }),
            }
        );

        if (!response.ok) {
            const txt = await response.text();
            return NextResponse.json({ error: `GitHub API Error: ${txt}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Sync job triggered' });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
