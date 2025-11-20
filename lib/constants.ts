export const CATEGORIES = [
    {
        value: 'Tech',
        label: 'Tech',
        icon: '💻',
        color: 'from-blue-500 to-cyan-500',
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        path: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
        value: 'Food & Drink',
        label: 'Food & Drink',
        icon: '🍔',
        color: 'from-orange-500 to-red-500',
        iconColor: 'text-orange-600 dark:text-orange-400',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        path: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
        value: 'AI',
        label: 'AI',
        icon: '🤖',
        color: 'from-purple-500 to-indigo-500',
        iconColor: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        path: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
        value: 'Arts & Culture',
        label: 'Arts & Culture',
        icon: '🎨',
        color: 'from-pink-500 to-rose-500',
        iconColor: 'text-pink-600 dark:text-pink-400',
        iconBg: 'bg-pink-100 dark:bg-pink-900/30',
        path: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
        value: 'Climate',
        label: 'Climate',
        icon: '🌱',
        color: 'from-green-500 to-emerald-500',
        iconColor: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        path: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
        value: 'Fitness',
        label: 'Fitness',
        icon: '💪',
        color: 'from-red-500 to-orange-500',
        iconColor: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
    },
    {
        value: 'Wellness',
        label: 'Wellness',
        icon: '🧘',
        color: 'from-teal-400 to-cyan-500',
        iconColor: 'text-teal-600 dark:text-teal-400',
        iconBg: 'bg-teal-100 dark:bg-teal-900/30',
        path: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
        value: 'Crypto',
        label: 'Crypto',
        icon: '₿',
        color: 'from-yellow-400 to-orange-500',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        path: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
        value: 'Business',
        label: 'Business',
        icon: '💼',
        color: 'from-slate-600 to-slate-800',
        iconColor: 'text-slate-600 dark:text-slate-400',
        iconBg: 'bg-slate-100 dark:bg-slate-800/50',
        path: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
        value: 'Education',
        label: 'Education',
        icon: '📚',
        color: 'from-indigo-500 to-violet-500',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
        path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
        value: 'Music',
        label: 'Music',
        icon: '🎵',
        color: 'from-fuchsia-500 to-pink-500',
        iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
        iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
        path: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
    },
    {
        value: 'Gaming',
        label: 'Gaming',
        icon: '🎮',
        color: 'from-violet-600 to-indigo-600',
        iconColor: 'text-violet-600 dark:text-violet-400',
        iconBg: 'bg-violet-100 dark:bg-violet-900/30',
        path: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'
    },
] as const;
