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
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            <div className="min-h-screen bg-gray-50 dark:bg-dark-primary animate-fade-in">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Notifications
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Back to Dashboard
                            </Link>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Mark All as Read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md dark:shadow-xl p-4 mb-6 border border-transparent dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by type:</label>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as FilterType)}
                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value="all">All Types</option>
                                    <option value="registration">Registration</option>
                                    <option value="event_update">Event Updates</option>
                                    <option value="reminder">Reminders</option>
                                    <option value="payment">Payments</option>
                                    <option value="general">General</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="unread-only"
                                    checked={showUnreadOnly}
                                    onChange={(e) => setShowUnreadOnly(e.target.checked)}
                                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="unread-only" className="text-sm text-gray-700 dark:text-gray-300">
                                    Show unread only
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md dark:shadow-xl border border-transparent dark:border-gray-700">
                        {paginatedNotifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {filter !== 'all' || showUnreadOnly ? 'Try adjusting your filters' : 'You\'ll see notifications here when you have activity'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedNotifications.map((notification) => {
                                        const handleClick = () => {
                                            if (!notification.read) {
                                                markAsRead(notification.id);
                                            }
                                        };

                                        const content = (
                                            <div className="flex gap-4 p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                {getNotificationIcon(notification.type)}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                                                                {notification.title}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                {notification.message}
                                                            </p>
                                                            {notification.event_title && (
                                                                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">
                                                                    Event: {notification.event_title}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                                {format(new Date(notification.created_at), 'EEEE, dd MMMM yyyy, HH:mm', { locale: id })}
                                                            </p>
                                                        </div>
                                                        {!notification.read && (
                                                            <span className="h-3 w-3 bg-primary-600 rounded-full flex-shrink-0 mt-1"></span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );

                                        if (notification.event_id) {
                                            return (
                                                <Link
                                                    key={notification.id}
                                                    href={`/events/${notification.event_id}`}
                                                    onClick={handleClick}
                                                    className="block"
                                                >
                                                    {content}
                                                </Link>
                                            );
                                        }

                                        return (
                                            <div
                                                key={notification.id}
                                                onClick={handleClick}
                                                className="cursor-pointer"
                                            >
                                                {content}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredNotifications.length)} of {filteredNotifications.length} notifications
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Next
                                            </button>
                                        </div>
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