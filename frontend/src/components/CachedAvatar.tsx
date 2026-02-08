import { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';

interface CachedAvatarProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
    fallbackClassName?: string;
}

/**
 * Avatar component with optimized caching for Google profile images
 * - Uses IndexedDB to cache Google profile images locally
 * - Automatically handles Google OAuth avatar URLs
 * - Falls back to User icon when no avatar is provided
 * - Supports lazy loading and async decoding
 */
export default function CachedAvatar({ src, alt, className = '', fallbackClassName = '' }: CachedAvatarProps) {
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const cacheRef = useRef<IDBDatabase | null>(null);

    // Initialize IndexedDB for caching
    useEffect(() => {
        const initDB = async () => {
            try {
                const request = indexedDB.open('NGEventAvatarCache', 1);

                request.onerror = () => {
                    console.warn('IndexedDB not available, using direct image loading');
                };

                request.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    if (!db.objectStoreNames.contains('avatars')) {
                        db.createObjectStore('avatars');
                    }
                };

                request.onsuccess = (event) => {
                    cacheRef.current = (event.target as IDBOpenDBRequest).result;
                };
            } catch (error) {
                console.warn('IndexedDB initialization failed:', error);
            }
        };

        initDB();
    }, []);

    useEffect(() => {
        if (!src) {
            setImageSrc(null);
            setImageError(false);
            setIsLoading(false);
            return;
        }

        // Reset states when src changes
        setImageError(false);
        setIsLoading(true);

        const isGoogleImage = src.includes('googleusercontent.com') || src.includes('google.com');

        // For Google images, try to use cached version
        if (isGoogleImage && cacheRef.current) {
            loadCachedGoogleImage(src);
        } else {
            // For other images, use direct URL
            setImageSrc(src);
            setIsLoading(false);
        }
    }, [src]);

    const loadCachedGoogleImage = async (url: string) => {
        if (!cacheRef.current) {
            setImageSrc(url);
            setIsLoading(false);
            return;
        }

        try {
            // Try to get cached image first
            const transaction = cacheRef.current.transaction(['avatars'], 'readonly');
            const store = transaction.objectStore('avatars');
            const request = store.get(url);

            request.onsuccess = () => {
                if (request.result) {
                    // Use cached blob URL
                    setImageSrc(request.result);
                    setIsLoading(false);
                } else {
                    // Fetch and cache the image
                    fetchAndCacheImage(url);
                }
            };

            request.onerror = () => {
                // Fallback to direct URL
                setImageSrc(url);
                setIsLoading(false);
            };
        } catch (error) {
            console.warn('Cache read failed:', error);
            setImageSrc(url);
            setIsLoading(false);
        }
    };

    const fetchAndCacheImage = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            // Cache the blob URL
            if (cacheRef.current) {
                const transaction = cacheRef.current.transaction(['avatars'], 'readwrite');
                const store = transaction.objectStore('avatars');
                store.put(blobUrl, url);
            }

            setImageSrc(blobUrl);
            setIsLoading(false);
        } catch (error) {
            console.warn('Failed to fetch and cache image:', error);
            // Fallback to direct URL
            setImageSrc(url);
            setIsLoading(false);
        }
    };

    const handleImageError = () => {
        setImageError(true);
        setIsLoading(false);
    };

    if (!imageSrc || imageError) {
        return (
            <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${fallbackClassName || className}`}>
                <User className="w-1/2 h-1/2 text-gray-400 dark:text-gray-500" />
            </div>
        );
    }

    return (
        <>
            {isLoading && (
                <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${fallbackClassName || className} animate-pulse`}>
                    <User className="w-1/2 h-1/2 text-gray-400 dark:text-gray-500" />
                </div>
            )}
            <img
                src={imageSrc}
                alt={alt}
                className={`${className} ${isLoading ? 'hidden' : ''}`}
                onError={handleImageError}
                onLoad={() => setIsLoading(false)}
                loading="lazy"
                decoding="async"
            />
        </>
    );
}
