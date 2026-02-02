
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { encryptToString } from '@/lib/crypto';

// Service Role client needed to bypass RLS if we want, or just standard client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, filename, projectId, email, password } = body;

        // 1. Fetch User Tier and Project Count
        const { data: profile } = await supabase
            .from('profiles')
            .select('tier')
            .eq('id', userId)
            .single();

        const { count } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        const tier = profile?.tier || 'free';
        const projectCount = count || 0;

        // 2. Enforce Limits
        if (tier === 'free' && projectCount >= 1) {
            return NextResponse.json(
                { error: "Free tier is limited to 1 project. Upgrade to Pro for unlimited!" },
                { status: 403 }
            );
        }

        // 3. Encrypt sensitive fields only if provided
        const overleaf_email_enc = email ? encryptToString(email) : null;
        const overleaf_password_enc = password ? encryptToString(password) : null;

        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: userId,
                filename,
                project_id: projectId,
                overleaf_email_enc,
                overleaf_password_enc
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, userId, filename, projectId } = body;

        if (!id || !userId) {
            return NextResponse.json({ error: "Missing id or userId" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('projects')
            .update({ filename, project_id: projectId })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('id');
        const userId = searchParams.get('userId');

        if (!projectId || !userId) {
            return NextResponse.json({ error: "Missing projectId or userId" }, { status: 400 });
        }

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId)
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
