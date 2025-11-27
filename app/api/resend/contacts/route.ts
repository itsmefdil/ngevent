import { NextRequest, NextResponse } from 'next/server';
import { addResendContact } from '@/lib/resend';

/**
 * POST /api/resend/contacts
 * Body: { email, firstName, lastName, unsubscribed? }
 * Adds a contact to Resend audience.
 */
export async function POST(request: NextRequest) {
    try {
        const { email, firstName, lastName, unsubscribed } = await request.json();
        if (!email || !firstName || !lastName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const data = await addResendContact({ email, firstName, lastName, unsubscribed });
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
        console.error('Resend contact error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
