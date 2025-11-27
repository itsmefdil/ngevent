import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import RegistrationsStat from './RegistrationsStat';
import { useLanguage } from '@/lib/language-context';
import BroadcastModal from './BroadcastModal';

interface OrganizerEventCardProps {
    event: any;
    onDelete: (id: string, title: string) => void;
}

const idr = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function OrganizerEventCard({ event, onDelete }: OrganizerEventCardProps) {
    const { t } = useLanguage();
    const [broadcastModalOpen, setBroadcastModalOpen] = React.useState(false);

    const copyLink = () => {
        const url = `${window.location.origin}/events/${event.id}`;
        navigator.clipboard.writeText(url);
        toast.success(t('dashboard.eventCard.linkCopied'));
    };

    return (
        <div className="group bg-white dark:bg-dark-card rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                    {event.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
                            <svg className="w-12 h-12 text-primary-300 dark:text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                    <div className="absolute top-2 right-2">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg backdrop-blur-md ${event.status === 'published'
                            ? 'bg-green-500/90 text-white'
                            : event.status === 'draft'
                                ? 'bg-yellow-500/90 text-white'
                                : 'bg-gray-500/90 text-white'
                            }`}>
                            {event.status}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                            {event.category && (
                                <span className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1 block">
                                    {event.category}
                                </span>
                            )}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                {event.title}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={copyLink}
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                title="Copy Link"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{format(new Date(event.start_date), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{event.location || t('common.online')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{event.registration_fee ? idr(event.registration_fee) : t('common.free')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RegistrationsStat eventId={event.id} capacity={event.capacity} />
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/events/${event.id}`}
                                title={t('common.viewDetails')}
                                className="p-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all shadow-sm hover:shadow-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </Link>
                            <Link
                                href={`/dashboard/events/${event.id}/edit`}
                                title={t('common.edit')}
                                className="p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all shadow-sm hover:shadow-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </Link>
                            <Link
                                href={`/dashboard/events/${event.id}/registrations`}
                                title={t('dashboard.registrations')}
                                className="p-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-all shadow-sm hover:shadow-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </Link>

                            <button
                                onClick={() => setBroadcastModalOpen(true)}
                                title="Broadcast Email"
                                className="p-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-all shadow-sm hover:shadow-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            </button>
                        </div>
                        <button
                            onClick={() => onDelete(event.id, event.title)}
                            title={t('common.delete')}
                            className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all shadow-sm hover:shadow-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <BroadcastModal
                isOpen={broadcastModalOpen}
                onClose={() => setBroadcastModalOpen(false)}
                eventId={event.id}
                eventTitle={event.title}
            />
        </div >
    );
}
