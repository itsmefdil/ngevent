import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );

        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

        // Kirim email welcome hanya sekali untuk user OAuth Google
        // Guard utama: cek apakah sudah ada log welcome_email
        if (user && !error) {
            try {
                // Pastikan ini login via Google (signInWithOAuth menghasilkan provider di metadata session)
                // Supabase tidak selalu expose provider di user object di sisi server setelah exchange, jadi cukup cek apakah profile ada (user valid)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    // Cek apakah welcome email sudah pernah dikirim (menggunakan email_logs)
                    const { data: existingWelcomeLog, error: logError } = await supabase
                        .from('email_logs')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('email_type', 'welcome_email')
                        .limit(1);

                    if (logError) {
                        console.warn('⚠️ Gagal mengecek email_logs:', logError.message);
                    }

                    if (existingWelcomeLog && existingWelcomeLog.length > 0) {
                        console.log('ℹ️ Welcome email sudah pernah dikirim – skip.');
                    } else {
                        console.log('📧 Attempting to send one-time welcome email...');
                        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
                        const response = await fetch(`${siteUrl}/api/webhooks/email`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'welcome_email',
                                user_id: user.id,
                                email: user.email,
                                name: profile.full_name || user.email?.split('@')[0],
                            }),
                        });

                        if (response.ok) {
                            console.log('✅ Welcome email dikirim (first time)');
                        } else {
                            console.warn('⚠️ Welcome email tidak terkirim (system belum dikonfigurasi)');
                        }
                    }
                }
            } catch (emailError: any) {
                console.warn('⚠️ Welcome email flow gagal (non-critical):', emailError.message || emailError);
            }
        }
    }

    // Use NEXT_PUBLIC_SITE_URL for redirect, fallback to requestUrl.origin
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
    return NextResponse.redirect(new URL('/dashboard', redirectUrl));
}
