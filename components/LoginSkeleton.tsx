export default function LoginSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 animate-fade-in">
            <div className="max-w-md w-full space-y-8">
                {/* Logo Skeleton */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-6">
                        <div className="h-16 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-skeleton"></div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto mb-2 animate-skeleton"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto animate-skeleton"></div>
                </div>

                {/* Login Card Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-6">
                    {/* Button Skeleton */}
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-skeleton"></div>

                    {/* Info Text Skeleton */}
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4 mx-auto animate-skeleton"></div>
                </div>

                {/* Terms Skeleton */}
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto animate-skeleton"></div>
            </div>
        </div>
    );
}
