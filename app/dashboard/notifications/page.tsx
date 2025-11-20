'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

interface Notification {
    id: string;
    type: 'registration' | 'event_update' | 'reminder' | 'general' | 'payment';
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    event_id?: string;
    event_title?: string;
}

type FilterType = 'all' | 'registration' | 'event_update' | 'reminder' | 'general' | 'payment';

export default function NotificationsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('notifications')
                .select(`
                    *,
                    events (
                        title
                    )
                `)
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            const formattedNotifications: Notification[] = (data || []).map((n: any): Notification => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                read: n.read,
                created_at: n.created_at,
                event_id: n.event_id,
                event_title: n.events?.title
            }));

            setNotifications(formattedNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Please login to view notifications');
            router.push('/auth/login');
            return;
        }

        if (user) {
            loadNotifications();
        }
    }, [user, authLoading, router, loadNotifications]);

    const markAsRead = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);

            if (error) throw error;

            setNotifications(prev =>
                prev.map((n: Notification) =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications
                .filter((n: Notification) => !n.read)
                .map((n: Notification) => n.id);

            if (unreadIds.length === 0) return;

            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .in('id', unreadIds);

            if (error) throw error;

            setNotifications(prev => prev.map((n: Notification) => ({ ...n, read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark notifications as read');
        }
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'registration':
                return (
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                );
            case 'reminder':
                return (
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'event_update':
                return (
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                );
            case 'payment':
                return (
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        if (filter !== 'all' && notification.type !== filter) return false;
        if (showUnreadOnly && notification.read) return false;
        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

    const unreadCount = notifications.filter(n => !n.read).length;

    if (authLoading || loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 dark:bg-dark-primary animate-fade-in">
                    <div className="container mx-auto px-4 py-8">
                        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md dark:shadow-xl p-6">
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!user) return null;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 dark:bg-dark-primary animate-fade-in pb-12">
                <div className="container mx-auto px-4 py-8 content-align-navbar">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Notifications
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Manage and view your recent activity
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                            >
                                Back to Dashboard
                            </Link>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters & Controls */}
                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value as FilterType)}
                                        className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                                    >
                                        <option value="all">All Notifications</option>
                                        <option value="registration">Registration</option>
                                        <option value="event_update">Event Updates</option>
                                        <option value="reminder">Reminders</option>
                                        <option value="payment">Payments</option>
                                        <option value="general">General</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={showUnreadOnly}
                                            onChange={(e) => setShowUnreadOnly(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Unread only</span>
                                </label>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {filteredNotifications.length} results
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-4">
                        {paginatedNotifications.length === 0 ? (
                            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                                <div className="w-20 h-20 mx-auto bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No notifications found</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                    {filter !== 'all' || showUnreadOnly
                                        ? 'Try adjusting your filters to see more notifications.'
                                        : 'You\'re all caught up! Check back later for updates.'}
                                </p>
                                {(filter !== 'all' || showUnreadOnly) && (
                                    <button
                                        onClick={() => { setFilter('all'); setShowUnreadOnly(false); }}
                                        className="mt-6 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                        {paginatedNotifications.map((notification) => {
                                            const handleClick = () => {
                                                if (!notification.read) {
                                                    markAsRead(notification.id);
                                                }
                                            };

                                            const content = (
                                                <div className={`flex gap-4 p-6 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!notification.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                                                    <div className="flex-shrink-0">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                            <div>
                                                                <h4 className={`text-base ${!notification.read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-800 dark:text-gray-200'}`}>
                                                                    {notification.title}
                                                                </h4>
                                                                {notification.event_title && (
                                                                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                        {notification.event_title}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                                                                {format(new Date(notification.created_at), 'MMM d, yyyy • HH:mm', { locale: id })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="flex-shrink-0 self-center">
                                                            <div className="w-3 h-3 bg-primary-500 rounded-full ring-4 ring-primary-50 dark:ring-primary-900/20"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            );

                                            if (notification.event_id) {
                                                return (
                                                    <Link
                                                        key={notification.id}
                                                        href={`/events/${notification.event_id}`}
                                                        onClick={handleClick}
                                                        className="block group"
                                                    >
                                                        {content}
                                                    </Link>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={notification.id}
                                                    onClick={handleClick}
                                                    className="cursor-pointer group"
                                                >
                                                    {content}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                        >
                                            Next
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}