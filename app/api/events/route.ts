import { NextResponse } from 'next/server';
import { getEventsOptimized } from '@/lib/supabase-optimized';
import { unstable_cache } from 'next/cache';

// Cache events list for 60 seconds
// Note: We include page, limit, category, and search in the cache key
const getCachedEvents = unstable_cache(
    async (page: number, limit: number, category?: string, search?: string) => {
        return getEventsOptimized(page, limit, category, search);
    },
    ['events-list'],
    { revalidate: 60, tags: ['events'] }
);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '0');
        const limit = parseInt(searchParams.get('limit') || '10');
        const category = searchParams.get('category') || undefined;
        const search = searchParams.get('search') || undefined;

        // Use cached version
        const { data, count } = await getCachedEvents(page, limit, category, search);

        return NextResponse.json({
            success: true,
            data,
            meta: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil((count || 0) / limit)
            }
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
            }
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
