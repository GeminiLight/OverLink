import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client to read secure data from all users
export async function GET(request: Request) {
    // Basic Auth Check for Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SECRET_KEY!
        );

        // 1. Fetch ALL projects (even those without credentials, as they can use shared env vars)
        const { data: projects, error } = await supabaseAdmin
            .from('projects')
            .select('project_id, filename, overleaf_email_enc, overleaf_password_enc');

        if (error) throw error;
        if (!projects || projects.length === 0) {
            return NextResponse.json({ message: 'No projects to sync.' });
        }

        // 2. Group by Unique Credentials (User Session)
        // Key: "email|password" -> { email, password, projects: [] }
        // Key: "SHARED" -> { email: null, password: null, projects: [] }
        const userGroups: Record<string, any> = {};

        projects.forEach(p => {
            let key = "SHARED";
            if (p.overleaf_email_enc && p.overleaf_password_enc) {
                key = `${p.overleaf_email_enc}|${p.overleaf_password_enc}`;
            }

            if (!userGroups[key]) {
                userGroups[key] = {
                    email: p.overleaf_email_enc || null,
                    password: p.overleaf_password_enc || null,
                    projects: []
                };
            }
            userGroups[key].projects.push({
                project_id: p.project_id,
                filename: p.filename
            });
        });

        // 3. Dispatch Jobs for Each User
        const dispatches = Object.values(userGroups).map(async (group) => {
            const workerPayload = {
                email: group.email,
                password: group.password,
                projects: group.projects,
                is_encrypted: true,
                auth_json_base64: process.env.AUTH_JSON_BASE64
            };

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
            return response.ok;
        });

        const results = await Promise.all(dispatches);
        const successCount = results.filter(r => r).length;

        return NextResponse.json({
            success: true,
            total_users: Object.keys(userGroups).length,
            jobs_dispatched: successCount
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
