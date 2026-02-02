
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { encryptToString } from '@/lib/crypto';

// Admin client to read secure data if needed, though here we might just pass args
// Actually we should fetch credentials from DB to verify ownership before triggering
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Needed to read encrypted columns if we used RLS to hide them? 
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

        // 2. Prepare Payload for Worker
        // Note: We are sending encrypted data? No, the Worker needs RAW password to login.
        // So we must DECRYPT it here? 
        // Wait, `crypto.ts` is in `lib`. We need to be able to decrypt.
        // But `crypto.ts` only had `encrypt`. I need to update it to support `decrypt`.
        // OR, we verify the implementation plan. 
        // Plan said: "Worker... Accept inputs...".
        // SECURITY RISK: Sending raw password in GitHub Dispatch payload means it appears in GitHub Action logs if not careful.
        // BETTER: Send Encrypted, and have Worker Decrypt. But Worker needs the same Key.
        // Let's stick to: We decrypt here (Server Side) then send as Secret Payload?
        // GitHub Dispatch payload IS visible. 
        // CORRECTION: Repository Dispatch payload is NOT a secret.
        // SOLUTION: We should encryption in the payload using a shared key that the Worker also has.
        // Since `crypto.ts` uses `process.env.ENCRYPTION_KEY`, and we can set the same env var in GitHub Actions Secret.
        // We can just pass the `overlink_password_enc` string AS IS, and let the worker decrypt it.

        // So we just pass the database values.

        const workerPayload = {
            nickname: project.nickname,
            project_id: project.project_id,
            email: project.overleaf_email_enc, // Sending Encrypted
            password: project.overleaf_password_enc, // Sending Encrypted
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
