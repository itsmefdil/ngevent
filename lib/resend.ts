import { Resend } from 'resend';

// Initialise Resend client with API key from environment
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not set in environment');
}
const resend = new Resend(resendApiKey);

/**
 * Add a contact to Resend audience.
 * @param email Contact email address
 * @param firstName First name of the contact
 * @param lastName Last name of the contact
 * @param unsubscribed Whether the contact is unsubscribed (default false)
 */
export async function addResendContact({
    email,
    firstName,
    lastName,
    unsubscribed = false,
    audienceId,
}: {
    email: string;
    firstName: string;
    lastName: string;
    unsubscribed?: boolean;
    audienceId?: string;
}) {
    const { data, error } = await resend.contacts.create({
        email,
        firstName,
        lastName,
        unsubscribed,
        audienceId,
    });
    if (error) {
        console.error('Resend contact creation error:', error);
        throw error;
    }
    return data;
}

/**
 * Create a new segment (audience).
 * @param name Name of the segment
 */
export async function createResendSegment(name: string) {
    const { data, error } = await resend.segments.create({
        name,
    });
    if (error) {
        console.error('Resend segment creation error:', error);
        throw error;
    }
    return data;
}

/**
 * Create a broadcast campaign.
 * @param segmentId ID of the segment/audience to target
 * @param from Sender address (e.g. "Acme <onboarding@resend.dev>")
 * @param subject Email subject line
 * @param html HTML body – you can use Resend templating tags like {{{FIRST_NAME}}}
 */
export async function createBroadcast({
    segmentId,
    from,
    subject,
    html,
}: {
    segmentId: string;
    from: string;
    subject: string;
    html: string;
}) {
    const { data, error } = await resend.broadcasts.create({
        segmentId,
        from,
        subject,
        html,
    });
    if (error) {
        console.error('Resend broadcast creation error:', error);
        throw error;
    }
    return data; // contains broadcastId etc.
}

/**
 * Send (or schedule) a previously created broadcast.
 * @param broadcastId ID of the broadcast returned from createBroadcast
 * @param scheduledAt Optional schedule string (e.g. "in 1 min")
 */
export async function sendBroadcast({
    broadcastId,
    scheduledAt,
}: {
    broadcastId: string;
    scheduledAt?: string;
}) {
    const { data, error } = await resend.broadcasts.send(broadcastId, {
        scheduledAt,
    });
    if (error) {
        console.error('Resend broadcast send error:', error);
        throw error;
    }
    return data;
}
