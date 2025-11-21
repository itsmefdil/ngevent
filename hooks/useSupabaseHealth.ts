"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export type HealthStatus = 'checking' | 'ok' | 'retrying' | 'error';

export function useSupabaseHealth({ auto = false, intervalMs = 30000 }: { auto?: boolean; intervalMs?: number } = {}) {
    const [status, setStatus] = useState<HealthStatus>('checking');
    // Use refs for internal state to avoid effect dependency loops
    const lastCheckedRef = useRef<number | null>(null);
    const isCheckingRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        let timer: NodeJS.Timeout | null = null;

        async function runCheck(attempt = 0) {
            if (cancelled || isCheckingRef.current) return; // avoid overlapping checks

            isCheckingRef.current = true;
            try {
                // Use head-only request to minimize data transfer
                // This only checks if the table is accessible without fetching any data
                const { error } = await supabase
                    .from('events')
                    .select('id', { head: true, count: 'exact' })
                    .limit(1);

                if (cancelled) return;
                if (error) throw error;
                setStatus('ok');
            } catch (e) {
                if (attempt < 1) { // reduce retries to 1 (instead of 2) to cut load
                    setStatus('retrying');
                    setTimeout(() => runCheck(attempt + 1), 800);
                    return;
                }
                setStatus('error');
            } finally {
                isCheckingRef.current = false;
                lastCheckedRef.current = Date.now();
            }
        }

        // Initial check (lazy: delay 3s to allow other critical queries first)
        // This prevents health check from running on every page navigation
        const initial = setTimeout(() => runCheck(), 3000);

        if (auto) {
            timer = setInterval(() => {
                // Skip if recently checked (< interval/2) or already in progress
                if (isCheckingRef.current) return;
                if (lastCheckedRef.current && Date.now() - lastCheckedRef.current < intervalMs / 2) return;
                runCheck();
            }, intervalMs);
        }

        return () => {
            cancelled = true;
            clearTimeout(initial);
            if (timer) clearInterval(timer);
        };
    }, [auto, intervalMs]);

    return status;
}
