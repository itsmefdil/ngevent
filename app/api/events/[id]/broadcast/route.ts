import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseFetch } from '@/lib/supabase';
import { Resend } from 'resend';
import { Client } from '@upstash/qstash';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY;

const resend = new Resend(resendApiKey);

// Initialize QStash client
const qstashClient = new Client({
    token: process.env.QSTASH_TOKEN!,
});

// Create Supabase client with service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    global: {
        headers: { 'x-client-info': 'ngevent-broadcast-api' },
        fetch: supabaseFetch,
    }
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const { subject, message, organizerId } = await request.json();

        if (!resendApiKey) {
            return NextResponse.json(
                { error: 'Resend API key not configured' },
                { status: 500 }
            );
        }

        // 1. Verify that the request comes from the organizer
        const { data: event, error: eventError } = await supabaseAdmin
            .from('events')
            .select('title, organizer_id, start_date, location, image_url')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        if (event.organizer_id !== organizerId) {
            return NextResponse.json(
                { error: 'Unauthorized: You are not the organizer of this event' },
                { status: 403 }
            );
        }

        // 2. Fetch all participants (registrations) and their profiles
        const { data: regs, error: regsError } = await supabaseAdmin
            .from('registrations')
            .select('user_id')
            .eq('event_id', eventId)
            .eq('status', 'registered');

        if (regsError) {
            console.error('Error fetching registrations:', regsError);
            return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
        }
        if (!regs || regs.length === 0) {
            return NextResponse.json({ message: 'No participants found for this event' }, { status: 200 });
        }

        // Get unique user IDs
        const userIds = regs.map((r: any) => r.user_id);

        // Fetch profiles for those users
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return NextResponse.json({ error: 'Failed to fetch participant profiles' }, { status: 500 });
        }

        // Fetch emails using auth.admin.getUserById since direct schema access is restricted
        const authUserPromises = userIds.map(async (userId: string) => {
            const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);
            if (error) {
                console.error(`Failed to fetch user ${userId}:`, error);
                return null;
            }
            return user ? { id: user.id, email: user.email } : null;
        });

        const authUsersResults = await Promise.all(authUserPromises);
        const authUsers = authUsersResults.filter((u): u is { id: string; email: string | undefined } => u !== null);

        // We don't check for authError here as we handle individual errors above
        if (authUsers.length === 0 && userIds.length > 0) {
            console.error('Failed to fetch any participant emails');
            return NextResponse.json({ error: 'Failed to fetch participant emails' }, { status: 500 });
        }

        // Merge registrations with profile and auth data
        const registrations = regs.map((reg: any) => {
            const profile = profiles?.find((p: any) => p.id === reg.user_id);
            const authUser = authUsers?.find((u: any) => u.id === reg.user_id);

            return {
                ...reg,
                profiles: {
                    full_name: profile?.full_name,
                    email: authUser?.email
                }
            };
        });

        console.log('Fetched registrations count:', registrations?.length);

        if (!registrations || registrations.length === 0) {
            return NextResponse.json(
                { message: 'No participants found for this event' },
                { status: 200 }
            );
        }

        // Format date for the email
        const eventDate = new Date(event.start_date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const eventTime = new Date(event.start_date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });

        // 3. Prepare Email Batch
        const emailBatch = registrations.map((reg: any) => {
            const email = reg.profiles?.email;
            const fullName = reg.profiles?.full_name || 'Participant';
            const [firstName] = fullName.split(' ');

            if (!email) return null;

            return {
                from: 'Ngevent Organizer <ngevent@notifications.devopsjogja.com>',
                to: [email],
                subject: subject || `Reminder: ${event.title} is coming up!`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                        ${event.image_url ? `<img src="${event.image_url}" alt="${event.title}" style="width: 100%;  object-fit: cover;" />` : ''}
                        <div style="padding: 24px;">
                            <h2 style="color: #333; margin-top: 0;">Hi ${firstName}, don't forget!</h2>
                            <p style="color: #555; line-height: 1.6;">
                                This is a friendly reminder that you are registered for <strong>${event.title}</strong>.
                                We are excited to see you there!
                            </p>
                            
                            <div style="background-color: #f9f9f9; padding: 16px; border-radius: 6px; margin: 24px 0;">
                                <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${eventDate}</p>
                                <p style="margin: 8px 0;"><strong>⏰ Time:</strong> ${eventTime}</p>
                                <p style="margin: 8px 0;"><strong>📍 Location:</strong> ${event.location || 'Online'}</p>
                            </div>

                            <p style="color: #555; line-height: 1.6;">
                                Please make sure to arrive on time. If you have any questions, feel free to reply to this email.
                            </p>
                            
                            <div style="margin-top: 32px; text-align: center;">
                                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/events/${eventId}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Event Details</a>
                            </div>
                        </div>
                        <div style="background-color: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #888;">
                            <p>&copy; ${new Date().getFullYear()} Ngevent. All rights reserved.</p>
                            <p>You received this email because you registered for this event.</p>
                        </div>
                    </div>
                `,
                text: `Hi ${firstName},\n\nThis is a reminder for ${event.title}.\n\nDate: ${eventDate}\nTime: ${eventTime}\nLocation: ${event.location || 'Online'}\n\nSee you there!`
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        console.log(`Preparing to send ${emailBatch.length} emails. QStash Token present: ${!!process.env.QSTASH_TOKEN}`);

        // 4. Send Strategy: QStash (Background) vs Direct (Fallback)
        const BATCH_SIZE = 100;

        // Check if QStash is configured
        if (process.env.QSTASH_TOKEN) {
            try {
                console.log('Using QStash for background processing...');
                const qstashPromises = [];
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                const workerUrl = `${appUrl}/api/queues/broadcast`;

                for (let i = 0; i < emailBatch.length; i += BATCH_SIZE) {
                    const batch = emailBatch.slice(i, i + BATCH_SIZE);

                    const promise = qstashClient.publishJSON({
                        url: workerUrl,
                        body: {
                            batch,
                            eventTitle: event.title
                        },
                        retries: 3,
                    });
                    qstashPromises.push(promise);
                }

                await Promise.all(qstashPromises);

                return NextResponse.json({
                    success: true,
                    message: `Broadcast queued for ${emailBatch.length} participants (Background)`,
                    details: { method: 'qstash', queuedBatches: qstashPromises.length }
                });
            } catch (qstashError) {
                console.error('QStash failed, falling back to direct send:', qstashError);
                // Fallback to direct send below
            }
        }

        // Fallback: Direct Send (Slower but reliable if QStash fails)
        console.log('Using Direct Send (Fallback)...');
        const results = [];

        for (let i = 0; i < emailBatch.length; i += BATCH_SIZE) {
            const batch = emailBatch.slice(i, i + BATCH_SIZE);

            try {
                const { data, error } = await resend.batch.send(batch);

                if (error) {
                    console.error('Batch send error:', error);
                    results.push({ status: 'error', error });
                } else {
                    console.log('Batch sent successfully:', data);
                    results.push({ status: 'success', data });
                }
            } catch (err) {
                console.error('Unexpected batch error:', err);
                results.push({ status: 'error', error: err });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Broadcast sent to ${emailBatch.length} participants (Direct)`,
            details: { method: 'direct', results }
        });

    } catch (error: any) {
        console.error('Broadcast error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

