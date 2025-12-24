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

    const images = p.images && p.images.length > 0 ? p.images : [];
    // Debug: log images array
    if (typeof window !== 'undefined') {
      // Only log on client
      console.log('Listing images:', images);
    }
    const amenities = p.amenities || [];
    const groupedAmenities = groupAmenities(amenities);
    const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 8);

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
            <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto">
                <EnhancedImageGallery images={images} title={p.title} />
            </div>

            {/* Content Section - Title and Info */}
            <div className="px-4 md:px-6 py-8 md:py-12 max-w-7xl mx-auto border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-8">
                    {/* Left: Title and Location */}
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                            {p.title}
                        </h1>
                        <div className="flex flex-wrap gap-6 items-center text-gray-700 mb-6">
                            <div className="flex items-center gap-2">
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
                                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-full border border-blue-200">
                                    <Star className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm text-gray-600">New listing - Be the first to review!</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Price and Actions */}
                    <div className="mt-6 md:mt-0 flex flex-col items-start md:items-end gap-4">
                        {/* Price display removed as per reservation model */}
                        <button 
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
                        >
                            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                            <span>{isWishlisted ? 'Saved' : 'Save'}</span>
                        </button>
                    </div>
                </div>

                {/* Enhanced Feature Cards */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Type</div>
                        <div className="font-bold text-sm text-gray-900 capitalize">{p.propertyType || 'apartment'}</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Sofa className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Bedrooms</div>
                        <div className="font-bold text-sm text-gray-900">{p.bedrooms || 0}</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Bathrooms</div>
                        <div className="font-bold text-sm text-gray-900">{p.bathrooms || 0}</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Guests</div>
                        <div className="font-bold text-sm text-gray-900">{p.guests || 2}</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Reviews</div>
                        <div className="font-bold text-sm text-gray-900">{p.reviewCount || 0}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 md:px-6 py-8 md:py-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Description */}
                        {p.description && (
                            <section className="animate-fade-in-up">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">About this place</h2>
                                <p className="text-gray-700 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                                    {p.description}
                                </p>
                            </section>
                        )}

                        {/* Enhanced Amenities Section */}
                        {amenities.length > 0 && (
                            <section className="animate-fade-in-up">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">What this place offers</h2>
                                
                                {/* Category Tabs */}
                                {Object.keys(groupedAmenities).length > 1 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {Object.keys(groupedAmenities).map(category => (
                                            <button
                                                key={category}
                                                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {visibleAmenities.map((amenity: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white flex-shrink-0 group-hover:scale-110 transition-transform animate-pulse">
                                                {getAmenityIcon(amenity)}
                                            </div>
                                            <span className="text-gray-800 font-medium group-hover:text-teal-600 transition text-sm">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                {amenities.length > 8 && (
                                    <button
                                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                                        className="mt-6 px-6 py-3 border border-teal-500 text-teal-600 hover:bg-teal-50 rounded-lg font-medium transition-colors"
                                    >
                                        {showAllAmenities ? 'Show less' : `Show all ${amenities.length} amenities`}
                                    </button>
                                )}
                            </section>
                        )}

                        {/* Enhanced Map Section */}
                        <section className="animate-fade-in-up">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Where you'll be</h2>
                            <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-slate-200 bg-gray-100 shadow-lg relative">
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
                                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg"
                                            >
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
                        <div className="sticky top-24 space-y-5">
                            {/* Enhanced Booking Form */}
                            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                <BookingForm propertyId={p._id || p.id} maxGuests={p.guests || 1} />
                            </div>

                            {/* Enhanced Trust Badges */}
                            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 border border-emerald-200 space-y-3 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-emerald-600" />
                                    <span className="font-semibold text-gray-800">Verified Host</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Award className="w-5 h-5 text-amber-500" />
                                    <span className="font-semibold text-gray-800">Superhost</span>
                                </div>
                                <p className="text-sm text-gray-600">Trusted by 1000+ guests</p>
                            </div>

                            {/* Enhanced Host Section */}
                            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300 group">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Hosted by</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 border-3 border-white shadow-md group-hover:scale-105 transition-transform">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {p.host?.role === 'admin' ? 'Glory Vacations' : (p.host?.name || 'Host')}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {p.host?.role === 'admin' ? 'Official Partner' : `Joined ${p.host?.joinedAt ? new Date(p.host.joinedAt).toLocaleDateString() : 'recently'}`}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Host Metrics */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-teal-600">95%</div>
                                        <div className="text-xs text-gray-600">Response Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-teal-600">{"< 2h"}</div>
                                        <div className="text-xs text-gray-600">Response Time</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-700">Usually responds within 2 hours</span>
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
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-40">
                    <div className="flex items-center justify-between">
                        {/* Price display removed from mobile footer */}
                        <div />
                        <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            Request Booking
                        </button>
                    </div>
                </div>
            )}
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
