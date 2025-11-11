import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstile, extractClientIp } from '@/lib/turnstile-verify';
import { limit } from '@/lib/rate-limit';

// POST /api/auth/verify-human
// Body: { cfTurnstileToken: string, email?: string }
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const token: string | undefined = body?.cfTurnstileToken;
        const email: string | undefined = body?.email;
        const ip = extractClientIp(req);

        // Basic rate limit (more permissive than sensitive routes)
        await limit(`vh:${ip || 'noip'}:${email || 'none'}`, 10);

        const ver = await verifyTurnstile(token, ip);
        if (!ver.success) {
            return NextResponse.json({ success: false, message: 'human-verification-failed', detail: ver.error }, { status: 403 });
        }

        // Optionally set a short cookie to signal verified human
        const res = NextResponse.json({ success: true });
        res.cookies.set('human_verified', '1', { httpOnly: true, secure: true, maxAge: 5 * 60, path: '/' });
        return res;
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e?.message || 'Unexpected error' }, { status: 500 });
    }
}
