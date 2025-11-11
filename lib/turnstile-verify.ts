import type { NextRequest } from 'next/server';

export interface TurnstileResult {
    success: boolean;
    error?: string;
    timestamp?: number;
    action?: string;
    cdata?: string;
    hostname?: string;
}

/**
 * Verify Cloudflare Turnstile token on the server.
 * Returns success=false with error instead of throwing (easier to compose with API handlers).
 */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<TurnstileResult> {
    if (!token) return { success: false, error: 'missing-turnstile-token' };
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return { success: false, error: 'turnstile-secret-missing' };

    try {
        const rsp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                secret,
                response: token,
                remoteip: ip || undefined,
            }),
        });
        const data: any = await rsp.json();
        if (!data?.success) {
            return { success: false, error: data['error-codes']?.[0] || 'turnstile-verify-failed' };
        }
        return {
            success: true,
            timestamp: Date.now(),
            action: data?.action,
            cdata: data?.cdata,
            hostname: data?.hostname,
        };
    } catch (e: any) {
        return { success: false, error: e?.message || 'turnstile-network-error' };
    }
}

/** Extract client IP heuristically (works on most deployments) */
export function extractClientIp(req: NextRequest): string | undefined {
    const xf = req.headers.get('x-forwarded-for');
    if (xf) return xf.split(',')[0].trim();
    const ip = (req as any).ip; // Next.js may expose ip in some runtimes
    return ip;
}
