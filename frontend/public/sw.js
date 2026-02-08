// Service Worker for aggressive image caching
const CACHE_NAME = 'ngevent-images-v1';
const GOOGLE_PHOTO_PATTERN = /^https:\/\/lh3\.googleusercontent\.com\//;

self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker activated');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only cache Google profile photos
    if (!GOOGLE_PHOTO_PATTERN.test(request.url)) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                // Try cache first
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    console.log('[SW] Cache hit:', url.pathname);
                    return cachedResponse;
                }

                // Fetch from network
                console.log('[SW] Cache miss, fetching:', url.pathname);
                const networkResponse = await fetch(request, {
                    mode: 'cors',
                    credentials: 'omit',
                });

                // Cache successful responses
                if (networkResponse.ok) {
                    cache.put(request, networkResponse.clone());
                }

                return networkResponse;
            } catch (error) {
                console.error('[SW] Fetch failed:', error);
                // Return cached version if available, even if stale
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                throw error;
            }
        })
    );
});

// Clean old cache versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('ngevent-images-') && name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});
