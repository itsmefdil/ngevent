'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '@/lib/language-context';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check initial theme
        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };

        checkTheme();

        // Watch for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || t('auth.loginError'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
            <div className="max-w-md w-full space-y-8">
                {/* Logo & Title */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-6">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={isDarkMode ? "/images/logo-dark.png" : "/images/logo.png"}
                            alt="Ngevent Logo"
                            className="h-16 w-auto object-contain transition-opacity duration-300"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('auth.loginTitle')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('auth.loginSubtitle')}
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-6">
                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span>{t('auth.loginWithGoogle')}</span>
                    </button>

                    {/* Info Text */}
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Login untuk mengakses event dan fitur lainnya
                    </p>
                </div>

                {/* Terms */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Dengan masuk, Anda menyetujui{' '}
                    <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                        Syarat & Ketentuan
                    </a>
                </p>
            </div>
        </div>
    );
}
