import { NextResponse } from 'next/server';
import { getEventWithRelations } from '@/lib/supabase-optimized';
import { unstable_cache } from 'next/cache';

// Cache event detail for 60 seconds
const getCachedEvent = unstable_cache(
    async (id: string) => getEventWithRelations(id),
    ['event-detail'],
    { revalidate: 60, tags: ['events'] }
);

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Use cached version
        const event = await getCachedEvent(id);

        if (!event) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: event
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
