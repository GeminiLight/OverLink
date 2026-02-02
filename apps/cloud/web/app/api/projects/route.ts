
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { encryptToString } from '@/lib/crypto';

// Service Role client needed to bypass RLS if we want, or just standard client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, nickname, projectId, email, password } = body;

        // Encrypt sensitive fields
        const overleaf_email_enc = encryptToString(email);
        const overleaf_password_enc = encryptToString(password);

        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: userId,
                nickname,
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
