"use client";

import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        turnstile?: any;
    }
}

interface Props {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: (err?: any) => void;
    theme?: 'auto' | 'light' | 'dark';
    action?: string;
}

export default function TurnstileWidget({ onVerify, onExpire, onError, theme = 'auto', action = 'auth' }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);
    const verifyRef = useRef(onVerify);
    const expireRef = useRef(onExpire);
    const errorRef = useRef(onError);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    // Keep latest callbacks without re-running the heavy effect
    useEffect(() => { verifyRef.current = onVerify; }, [onVerify]);
    useEffect(() => { expireRef.current = onExpire; }, [onExpire]);
    useEffect(() => { errorRef.current = onError; }, [onError]);

    useEffect(() => {
        if (!siteKey) return;

        const el = containerRef.current; // stable ref for cleanup

        const render = () => {
            if (!window.turnstile || !el) return;
            try {
                // Remove previous widget if any
                if (widgetIdRef.current) {
                    try { window.turnstile.remove(widgetIdRef.current); } catch { }
                    widgetIdRef.current = null;
                }
                widgetIdRef.current = window.turnstile.render(el, {
                    sitekey: siteKey,
                    theme,
                    action,
                    callback: (token: string) => verifyRef.current?.(token),
                    'error-callback': () => errorRef.current?.(),
                    'expired-callback': () => expireRef.current?.(),
                });
            } catch (e) {
                errorRef.current?.(e);
            }
        };

        // Reuse single script globally to avoid duplicates in Strict Mode
        let script: HTMLScriptElement | null = document.querySelector('#cf-turnstile-script');
        const handleLoad = () => render();

        if (window.turnstile) {
            render();
        } else {
            if (!script) {
                script = document.createElement('script');
                script.id = 'cf-turnstile-script';
                script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
                script.async = true;
                script.defer = true;
                script.addEventListener('load', handleLoad);
                document.head.appendChild(script);
            } else {
                script.addEventListener('load', handleLoad);
            }
        }

        return () => {
            // Detach load listener
            if (script) script.removeEventListener('load', handleLoad);
            // Remove widget instance on unmount
            if (widgetIdRef.current && window.turnstile) {
                try { window.turnstile.remove(widgetIdRef.current); } catch { }
                widgetIdRef.current = null;
            }
        };
        // Only re-run when visual params change; callbacks are kept via refs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteKey, theme, action]);

    if (!siteKey) return null;

    return <div ref={containerRef} className="cf-turnstile" />;
}
