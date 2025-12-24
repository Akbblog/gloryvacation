"use client";

export function LoadingSkeleton() {
    return (
        <div className="w-full bg-gradient-to-b from-white to-gray-50 min-h-screen">
            {/* Hero Image Skeleton */}
            <div className="relative w-full">
                <div className="w-full h-[500px] md:h-[650px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-2xl md:rounded-3xl shadow-lg mx-auto md:max-w-5xl md:mt-6 animate-pulse" />
            </div>

            {/* Title and Metadata Skeleton */}
            <div className="px-4 md:px-6 py-8 md:py-12 max-w-7xl mx-auto">
                <div className="mb-6">
                    <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg mb-4 w-3/4 animate-pulse" />
                    <div className="flex gap-4 items-center">
                        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full w-48 animate-pulse" />
                    </div>
                </div>

                {/* Property Specs Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-gray-200/50 animate-pulse">
                            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2 mb-2" />
                            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="px-4 md:px-6 pb-16 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description Skeleton */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200/50 animate-pulse">
                            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3 mb-4" />
                            <div className="space-y-3">
                                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
                                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
                                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
                            </div>
                        </div>

                        {/* Amenities Skeleton */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200/50 animate-pulse">
                            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3 mb-6" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl" />
                                ))}
                            </div>
                        </div>

                        {/* Map Skeleton */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200/50 animate-pulse">
                            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/4 mb-6" />
                            <div className="h-96 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl" />
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Booking Form Skeleton */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-200/50 animate-pulse h-80" />

                            {/* Host Info Skeleton */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-200/50 animate-pulse h-40" />

                            {/* Contact Form Skeleton */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-200/50 animate-pulse h-48" />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
