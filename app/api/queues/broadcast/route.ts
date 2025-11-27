import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

// Initialize QStash client
// Note: It will automatically use QSTASH_URL and QSTASH_TOKEN from env
const qstashClient = new Client({
    token: process.env.QSTASH_TOKEN!,
});

export async function POST(request: NextRequest) {
    try {
        // Verify the request signature to ensure it comes from QStash
        const signature = request.headers.get('upstash-signature');
        if (!signature) {
            // In development, we might want to skip signature verification or handle it differently
            // But for security, we should enforce it in production.
            // For now, we'll proceed but log a warning if missing in dev.
            if (process.env.NODE_ENV === 'production') {
                return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
            }
        }

        // QStash receiver verification logic could be added here using Receiver from @upstash/qstash

        const body = await request.json();
        const { batch, eventTitle } = body;

        if (!batch || !Array.isArray(batch) || batch.length === 0) {
            return NextResponse.json({ message: 'No emails to send' }, { status: 200 });
        }

        console.log(`[Worker] Processing batch of ${batch.length} emails for event: ${eventTitle}`);

        // Send the batch using Resend
        const { data, error } = await resend.batch.send(batch);

        if (error) {
            console.error('[Worker] Batch send error:', error);
            // Returning 500 will cause QStash to retry this job
            return NextResponse.json({ error: 'Failed to send batch', details: error }, { status: 500 });
        }

        console.log('[Worker] Batch sent successfully:', data);

        return NextResponse.json({
            success: true,
            message: `Sent ${batch.length} emails`,
            data
        });

    } catch (error: any) {
        console.error('[Worker] Unexpected error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
