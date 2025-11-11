import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

// Returns total registrations for an event (all users), bypassing RLS using service role.
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
    const { id: eventId } = await context.params;

    if (!eventId) {
        return NextResponse.json({ error: 'Missing event id' }, { status: 400 });
    }

    try {
        const { client, reason } = getSupabaseAdminClient();
        if (!client) {
            return NextResponse.json(
                { error: 'Service role key not configured', code: 'SERVICE_ROLE_MISSING', reason },
                { status: 503 }
            );
        }

        const { count, error } = await client
            .from('registrations')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .neq('status', 'cancelled');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ count: count ?? 0 });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
    }
}
