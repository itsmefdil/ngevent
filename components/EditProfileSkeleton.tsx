export default function EditProfileSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg animate-fade-in">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-skeleton"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mb-2 animate-skeleton"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80 animate-skeleton"></div>
                </div>

                {/* Avatar Section Skeleton */}
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-md dark:shadow-xl p-6 mb-6 border border-transparent dark:border-gray-700">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6 animate-skeleton"></div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar circle */}
                        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-skeleton"></div>

                        {/* Upload button area */}
                        <div className="flex-1 space-y-3 w-full">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-skeleton"></div>
                            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg w-full max-w-sm animate-skeleton"></div>
                        </div>
                    </div>
                </div>

                {/* Form Section Skeleton */}
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-md dark:shadow-xl p-6 border border-transparent dark:border-gray-700">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6 animate-skeleton"></div>

                    <div className="space-y-6">
                        {/* Form fields */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i}>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-skeleton"></div>
                                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-skeleton"></div>
                            </div>
                        ))}
                    </div>

                    {/* Action buttons skeleton */}
                    <div className="flex gap-3 mt-8">
                        <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-skeleton"></div>
                        <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1 animate-skeleton"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
