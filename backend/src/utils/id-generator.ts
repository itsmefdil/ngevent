/**
 * Generate a random 6-character alphanumeric ID
 * Uses uppercase letters and numbers for better readability
 * Excludes similar looking characters: 0, O, 1, I, L
 */
export function generateEventId(): string {
    const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

/**
 * Generate a unique event ID by checking if it exists in the database
 */
import db from '../db/connection';
import { events } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function generateUniqueEventId(): Promise<string> {
    let id = generateEventId();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        const existing = await db.select().from(events).where(eq(events.id, id)).limit(1);
        if (existing.length === 0) {
            return id;
        }
        id = generateEventId();
        attempts++;
    }

    throw new Error('Failed to generate unique event ID after ' + maxAttempts + ' attempts');
}
