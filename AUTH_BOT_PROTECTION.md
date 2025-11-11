# Bot Protection (Login & Register)

Implemented layers:

1. Cloudflare Turnstile (invisible captcha)
2. Honeypot hidden field (`website`)
3. Server-side Turnstile verification (`/api/auth/send-confirmation` & `/api/auth/verify-human`)
4. Rate limiting & lockout (Upstash Redis)

## Environment Variables

Add to `.env.local` (and production env settings):

```
TURNSTILE_SECRET_KEY=your_secret_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

(Optional) Without Upstash variables, rate limiting gracefully no-ops (development friendly).

## How It Works

- Register page: Turnstile widget must verify before enabling button. Token & honeypot sent to `/api/auth/send-confirmation`.
- Login page: Pre-verification via `/api/auth/verify-human` then Supabase client login.
- API routes verify Turnstile token and apply rate limit (5 attempts/min by email+IP for registration). Failures increment counters and can trigger 5-minute lockout after 5 failed registration attempts.

## Customization

Adjust rate limit numbers in `lib/rate-limit.ts` or per-route keys:

- Registration: `limit(key, 5)` (5 per minute)
- Change lockout policy in `incrFailAndMaybeLock(baseKey, 5, 300)` (tries, seconds)

## Extending

Add similar protection to password reset or other sensitive endpoints:

```ts
const rl = await limit(`reset:${ip}:${email}`, 3);
if (!rl.success) return NextResponse.json({ ... }, { status: 429 });
```

## Troubleshooting

- Missing Turnstile keys: Widget won't render (fails silently). Add envs.
- 403 human-verification-failed: Token expired or invalid; user must retry.
- 429 too-many-requests: Advise user to wait ~1 minute.
- 423 Locked: Temporary lockout triggered due to repeated failures.

## Security Notes

- Honeypot field blocks naive bots that auto-fill all inputs.
- Turnstile reduces automated abuse with minimal UX friction.
- Server-side verification prevents bypass by direct Supabase client calls for registration.
- Rate limiting prevents brute force / resource abuse.

## Future Improvements

- Track metrics for verification failures.
- Add login failure reporting route to count failed password attempts & lock.
- Central cookie-based flag for already verified humans (skip widget for short period).
