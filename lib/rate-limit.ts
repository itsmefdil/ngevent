import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Centralized rate limit + simple lockout helper.
 * Requires: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
let limiterByMinute: Ratelimit | null = null;

if (redisUrl && redisToken) {
    redis = new Redis({ url: redisUrl, token: redisToken });
    limiterByMinute = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'), // default 5 req / minute
        timeout: 1000, // 1s best-effort
        analytics: false,
    });
}

export function hasRateLimit(): boolean {
    return !!limiterByMinute && !!redis;
}

export async function limit(key: string, maxPerMinute = 5) {
    if (!redis) {
        // Graceful fallback: pretend allowed when not configured
        return { success: true, limit: maxPerMinute, remaining: maxPerMinute, reset: Date.now() + 60_000 } as any;
    }
    const rl = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxPerMinute, '1 m'),
        timeout: 1000,
        analytics: false,
    });
    return rl.limit(key);
}

/** Simple lockout using Redis TTL. Returns remaining seconds if locked. */
export async function getLockSeconds(key: string): Promise<number> {
    if (!redis) return 0;
    const ttl = await redis.ttl(key);
    return Math.max(ttl ?? 0, 0);
}

export async function lockForSeconds(key: string, seconds: number): Promise<void> {
    if (!redis) return;
    await redis.set(key, '1', { ex: seconds });
}

export async function incrFailAndMaybeLock(baseKey: string, maxFails: number, lockSeconds: number) {
    if (!redis) return { fails: 1, locked: false };
    const countKey = `${baseKey}:fails`;
    const fails = await redis.incr(countKey);
    // expire counter to auto-reset after some time
    if (fails === 1) await redis.expire(countKey, lockSeconds);
    if (fails >= maxFails) {
        await lockForSeconds(`${baseKey}:lock`, lockSeconds);
        return { fails, locked: true };
    }
    return { fails, locked: false };
}
