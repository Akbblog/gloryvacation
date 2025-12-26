"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { BookingForm } from '@/components/bookings/BookingForm';
import ContactBox from '@/components/listings/ContactBox';
import EnhancedImageGallery from '@/components/listings/EnhancedImageGallery';
import { useProperty } from '@/lib/hooks/useProperty';
import { Star, MapPin, Share2, Heart, Wifi, Car, Utensils, Tv, Coffee, Wind, Droplets, Dumbbell, ChevronLeft, ChevronRight, Home, Users, Sofa, Shield, Award, User, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface Props {
    id: string;
    initialProperty: any;
}

export default function PropertyDetailClient({ id, initialProperty }: Props) {
    const { property, isLoading } = useProperty(id);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const p = useMemo(() => property || initialProperty, [property, initialProperty]);
    
    if (!p && isLoading) return <LoadingSkeleton />;
    if (!p && !isLoading) return <div className="p-8 text-center text-gray-500">Property not found</div>;

    // Ensure p is an object and has expected properties
    if (typeof p !== 'object' || Array.isArray(p)) {
        return <div className="p-8 text-center text-gray-500">Invalid property data</div>;
    }

        const allImages: string[] = Array.isArray(p.images) ? p.images : [];
        // Filter out transient blob/data URLs that may have been stored by mistake
        const imagesFiltered = allImages.filter((u: string) => !!u && !u.startsWith('blob:') && !u.startsWith('data:'));
        // Fallback placeholder (small SVG data URI) so EnhancedImageGallery never receives an empty src
        const placeholder = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-family=%22sans-serif%22 font-size=%2218%22%3EImage%3C/text%3E%3C/svg%3E';
        const images = imagesFiltered.length > 0 ? imagesFiltered : [placeholder];
        if (typeof window !== 'undefined' && imagesFiltered.length !== allImages.length) {
            console.warn('Some listing images were transient (blob/data URLs) and were ignored. Please upload images to a permanent host.');
        }
    const amenities = Array.isArray(p.amenities) ? p.amenities : [];
    const groupedAmenities = groupAmenities(amenities);
    const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 8);
    const safeVisibleAmenities = Array.isArray(visibleAmenities) ? visibleAmenities : [];

    // Helper to get valid image URL and normalize relative paths
    const getImageUrl = (url: string): string | undefined => {
        if (!url) return undefined;
        if (url.startsWith('blob:') || url.startsWith('data:')) return url;
        if (/^https?:\/\//i.test(url)) return url;
        if (url.startsWith('/')) return url;
        return '/' + url;
    };

    return (
        <div className="w-full bg-white min-h-screen">
            {/* Enhanced Image Gallery */}
            <div className="pt-8 md:pt-12 lg:pt-16 px-4 md:px-6 lg:px-8 pb-6 max-w-7xl mx-auto">
                <EnhancedImageGallery images={images} title={p.title} />
            </div>

            {/* Content Section - Title and Info */}
            <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm text-gray-500">
                    <span className="hover:text-teal-600 cursor-pointer">Home</span>
                    <span className="mx-2">/</span>
                    <span className="hover:text-teal-600 cursor-pointer">Listings</span>
                    <span className="mx-2">/</span>
                    <span className="text-teal-600 font-medium">{p.title?.slice(0, 30)}{p.title?.length > 30 ? '...' : ''}</span>
                </nav>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-8">
                        {/* Left: Title and Location */}
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                {p.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 items-center text-gray-700 mb-6">
                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                                    <MapPin className="w-5 h-5 text-teal-600" />
                                    <span className="font-medium text-gray-700">{p.location?.area || p.location?.city || 'Location not specified'}</span>
                                </div>
                                {p.rating && p.rating > 0 ? (
                                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-full border border-amber-200">
                                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                        <span className="font-semibold text-gray-900">{p.rating.toFixed(1)}</span>
                                        <span className="text-sm text-gray-600">({p.reviewCount || 0} reviews)</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-2 rounded-full border border-teal-200">
                                        <Star className="w-5 h-5 text-teal-500" />
                                        <span className="text-sm text-gray-600">New listing - Be the first to review!</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="mt-4 md:mt-0 flex items-center gap-3">
                            <button 
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                            >
                                <Share2 className="w-5 h-5" />
                                <span className="hidden md:inline">Share</span>
                            </button>
                            <button 
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 ${
                                    isWishlisted 
                                        ? 'bg-red-50 border-red-200 text-red-600' 
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                                <span className="hidden md:inline">{isWishlisted ? 'Saved' : 'Save'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enhanced Feature Cards */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                    <div className="flex flex-col items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-teal-200">
                            <Home className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Type</div>
                        <div className="font-bold text-base text-gray-900 capitalize mt-1">{p.propertyType || 'apartment'}</div>
                    </div>
                    <div className="flex flex-col items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                            <Sofa className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Bedrooms</div>
                        <div className="font-bold text-base text-gray-900 mt-1">{p.bedrooms || 0}</div>
                    </div>
                    <div className="flex flex-col items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-purple-200">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Bathrooms</div>
                        <div className="font-bold text-base text-gray-900 mt-1">{p.bathrooms || 0}</div>
                    </div>
                    <div className="flex flex-col items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-pink-200">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Guests</div>
                        <div className="font-bold text-base text-gray-900 mt-1">{p.guests || 2}</div>
                    </div>
                    <div className="flex flex-col items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-amber-200">
                            <Award className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Reviews</div>
                        <div className="font-bold text-base text-gray-900 mt-1">{p.reviewCount || 0}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        {p.description && (
                            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fade-in-up">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                    <span className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></span>
                                    About this place
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                                    {p.description}
                                </p>
                            </section>
                        )}

                        {/* Enhanced Amenities Section */}
                        {amenities.length > 0 && (
                            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fade-in-up">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></span>
                                    What this place offers
                                </h2>
                                
                                {/* Category Tabs */}
                                {Object.keys(groupedAmenities).length > 1 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {Object.keys(groupedAmenities).map(category => (
                                            <button
                                                key={category}
                                                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-teal-50 hover:text-teal-600 text-gray-700 text-sm font-medium transition-all duration-200"
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {safeVisibleAmenities.map((amenity: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-all duration-300 group">
                                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-teal-600 flex-shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                                                {getAmenityIcon(amenity)}
                                            </div>
                                            <span className="text-gray-700 font-medium group-hover:text-teal-700 transition text-sm">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                {amenities.length > 8 && (
                                    <button
                                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                                        className="mt-6 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        {showAllAmenities ? 'Show less' : `Show all ${amenities.length} amenities`}
                                    </button>
                                )}
                            </section>
                        )}

                        {/* Enhanced Map Section */}
                        <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fade-in-up">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <span className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></span>
                                Where you'll be
                            </h2>
                            <div className="w-full h-80 md:h-96 rounded-2xl overflow-hidden bg-gray-100 relative">
                                {p.location?.lat && p.location?.lng ? (
                                    <>
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            style={{ border: 'none' }}
                                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${p.location.lat},${p.location.lng}&zoom=15`}
                                            allowFullScreen={true}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${p.location.lat},${p.location.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-white hover:bg-gray-50 text-teal-600 px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                            >
                                                <MapPin className="w-4 h-4" />
                                                Get Directions
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <div className="text-center">
                                            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>Location map not available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar */}
                    <aside>
                        <div className="sticky top-24 space-y-6">
                            {/* Enhanced Booking Form */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                                <BookingForm propertyId={p._id || p.id} maxGuests={p.guests || 1} />
                            </div>

                            {/* Enhanced Trust Badges */}
                            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100 space-y-4">
                                <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Why book with us</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <Shield className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-800 text-sm">Verified Host</span>
                                        <p className="text-xs text-gray-500">Identity confirmed</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <Award className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-800 text-sm">Superhost</span>
                                        <p className="text-xs text-gray-500">Top-rated experience</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-teal-100">
                                    <p className="text-sm text-teal-700 font-medium">✓ Trusted by 1000+ guests</p>
                                </div>
                            </div>

                            {/* Enhanced Host Section */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm group">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Hosted by {p.host?.role === 'admin' ? 'Glory Vacations' : (p.host?.name || 'Host')}</h3>
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-200 group-hover:scale-105 transition-transform">
                                        <User className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {p.host?.role === 'admin' ? 'Official Partner' : `Joined ${p.host?.joinedAt ? new Date(p.host.joinedAt).toLocaleDateString() : 'recently'}`}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Host Metrics */}
                                <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-teal-600">95%</div>
                                        <div className="text-xs text-gray-500">Response Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-teal-600">{"< 2h"}</div>
                                        <div className="text-xs text-gray-500">Response Time</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 bg-teal-50 px-4 py-3 rounded-xl">
                                    <Clock className="w-4 h-4 text-teal-600" />
                                    <span className="text-sm text-teal-700 font-medium">Usually responds within 2 hours</span>
                                </div>
                                
                                {p.host?.bio && (
                                    <p className="text-sm text-gray-600 leading-relaxed mt-4">{p.host.bio}</p>
                                )}
                            </div>

                            {/* Contact */}
                            <ContactBox propertyId={p._id || p.id} />
                        </div>
                    </aside>
                </div>
            </div>

            {/* Mobile Sticky Footer */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl p-4 z-40">
                    <div className="flex items-center justify-center">
                        <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-teal-200">
                            Request Booking
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Spacing for Mobile Footer */}
            {isMobile && <div className="h-24"></div>}
        </div>
    );
}

// Group amenities by category
function groupAmenities(amenities: string[]): Record<string, string[]> {
    const categories: Record<string, string[]> = {
        'Kitchen': [],
        'Entertainment': [],
        'Essentials': [],
        'Outdoor': [],
        'Safety': [],
        'Other': []
    };
    
    amenities.forEach(amenity => {
        const lower = amenity.toLowerCase();
        if (lower.includes('kitchen') || lower.includes('cook') || lower.includes('oven') || lower.includes('fridge')) {
            categories.Kitchen.push(amenity);
        } else if (lower.includes('tv') || lower.includes('wifi') || lower.includes('entertainment') || lower.includes('music')) {
            categories.Entertainment.push(amenity);
        } else if (lower.includes('pool') || lower.includes('garden') || lower.includes('balcony') || lower.includes('bbq')) {
            categories.Outdoor.push(amenity);
        } else if (lower.includes('security') || lower.includes('smoke') || lower.includes('fire') || lower.includes('alarm')) {
            categories.Safety.push(amenity);
        } else if (lower.includes('air') || lower.includes('heating') || lower.includes('parking') || lower.includes('elevator')) {
            categories.Essentials.push(amenity);
        } else {
            categories.Other.push(amenity);
        }
    });
    
    // Remove empty categories
    Object.keys(categories).forEach(key => {
        if (categories[key].length === 0) {
            delete categories[key];
        }
    });
    
    return categories;
}

// Amenity icon mapper
function getAmenityIcon(name: string) {
    const lower = (name || '').toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-5 h-5" />;
    if (lower.includes('park') || lower.includes('car')) return <Car className="w-5 h-5" />;
    if (lower.includes('kitchen') || lower.includes('cook')) return <Utensils className="w-5 h-5" />;
    if (lower.includes('tv')) return <Tv className="w-5 h-5" />;
    if (lower.includes('coffee')) return <Coffee className="w-5 h-5" />;
    if (lower.includes('pool')) return <Droplets className="w-5 h-5" />;
    if (lower.includes('gym')) return <Dumbbell className="w-5 h-5" />;
    if (lower.includes('ac') || lower.includes('air')) return <Wind className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
}
