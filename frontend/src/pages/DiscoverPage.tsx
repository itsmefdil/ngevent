import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import apiClient from '../lib/axios';
import { normalizeEvent, parseEventDate, type NormalizedEvent } from '../lib/event-normalize';

type CategoryCount = {
  value: string;
  label: string;
  count: number;
  path: string;
  iconColor: string;
  iconBg: string;
};

const CATEGORIES = [
  {
    value: 'conference',
    label: 'Conference',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    path: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
  },
  {
    value: 'workshop',
    label: 'Workshop',
    iconColor: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-100 dark:bg-sky-900/30',
    path: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z'
  },
  {
    value: 'seminar',
    label: 'Seminar',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    path: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
  },
  {
    value: 'meetup',
    label: 'Meetup',
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    path: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  {
    value: 'webinar',
    label: 'Webinar',
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    path: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
  },
  {
    value: 'other',
    label: 'Other',
    iconColor: 'text-slate-600 dark:text-slate-400',
    iconBg: 'bg-slate-100 dark:bg-slate-800/50',
    path: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
  },
];

export default function DiscoverPage() {
  useEffect(() => {
    document.title = 'Jelajahi - NgEvent'
  }, [])

  const { data: events = [], isLoading: loadingEvents } = useQuery<NormalizedEvent[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await apiClient.get('/api/events');
      const raw = response.data.events || response.data || [];
      return (Array.isArray(raw) ? raw : []).map(normalizeEvent);
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Ensure events is always an array
  const eventsList = Array.isArray(events) ? events : [];

  // Get upcoming events
  const upcomingEvents = eventsList
    .filter(event => {
      const start = parseEventDate(event.start_date);
      return start ? start >= new Date(new Date().setHours(0, 0, 0, 0)) : false;
    })
    .slice(0, 6);

  // Calculate category counts
  const categoryCounts: Record<string, number> = {};
  eventsList.forEach(event => {
    if (event.category) {
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    }
  });

  // Map categories with counts
  const categoryList: CategoryCount[] = CATEGORIES.map(cat => ({
    value: cat.value,
    label: cat.label,
    count: categoryCounts[cat.value] || 0,
    path: cat.path,
    iconColor: cat.iconColor,
    iconBg: cat.iconBg,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 pt-10">
        {/* Header */}
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Jelajahi Event
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            Temukan event DevOps menarik berdasarkan kategori yang kamu minati
          </p>
        </div>

        {/* Browse by Category */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Jelajahi Berdasarkan Kategori
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryList.map((category) => (
              <Link
                key={category.value}
                to={`/events?category=${encodeURIComponent(category.value)}`}
                className="group relative overflow-hidden"
              >
                <div className="bg-white dark:bg-dark-card rounded-2xl p-4 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-2xl dark:hover:shadow-primary-900/20 border border-gray-100 dark:border-gray-800 hover:border-primary-100 dark:hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className={`w-12 h-12 rounded-2xl ${category.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <svg className={`w-6 h-6 ${category.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.path} />
                    </svg>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {category.label}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {category.count} Event
                  </p>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Event Mendatang
            </h2>
            <Link
              to="/events"
              className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
            >
              Lihat Semua
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loadingEvents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-card rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-5">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/event/${event.id}`}
                  className="group bg-white dark:bg-dark-card rounded-2xl shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-2xl dark:hover:shadow-primary-900/10 overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                        <svg className="w-12 h-12 text-primary-400 dark:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {event.category && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 text-xs font-bold text-white bg-black/50 backdrop-blur-md rounded-full border border-white/20">
                          {event.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-primary-600 dark:text-primary-400 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {(() => {
                        const start = parseEventDate(event.start_date);
                        return start
                          ? start.toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                          : '-';
                      })()}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate max-w-[150px]">{event.location || 'Online'}</span>
                      </div>
                      {(event.registration_fee ?? 0) > 0 && (
                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                          Rp {(event.registration_fee ?? 0).toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-800">
              <div className="w-20 h-20 mx-auto bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Belum Ada Event Mendatang
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Saat ini belum ada event yang tersedia. Silakan cek kembali nanti.
              </p>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
              >
                Lihat Semua Event
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
