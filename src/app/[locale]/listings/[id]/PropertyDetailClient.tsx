"use client";

import React, { useMemo, useState } from 'react';
import { BookingForm } from '@/components/bookings/BookingForm';
import ContactBox from '@/components/listings/ContactBox';
import { useProperty } from '@/lib/hooks/useProperty';
import { Star, MapPin, Share2, Heart, Wifi, Car, Utensils, Tv, Coffee, Wind, Droplets, Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    id: string;
    initialProperty: any;
}

export default function PropertyDetailClient({ id, initialProperty }: Props) {
    const { property, isLoading } = useProperty(id);
    const [activeImageIdx, setActiveImageIdx] = useState(0);

    const p = useMemo(() => property || initialProperty, [property, initialProperty]);
    if (!p && !isLoading) return <div className="p-8 text-center text-gray-500">Property not found</div>;

    const images = p.images && p.images.length > 0 ? p.images : [];
    const mainImage = images[activeImageIdx] || '';

    const nextImage = () => {
        if (images.length > 0) {
            setActiveImageIdx((activeImageIdx + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (images.length > 0) {
            setActiveImageIdx((activeImageIdx - 1 + images.length) % images.length);
        }
    };

    return (
        <div className="w-full bg-white">
            {/* Full-width hero gallery */}
            <div className="relative w-full bg-gray-100">
                {mainImage ? (
                    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gray-200">
                        <img
                            src={mainImage}
                            alt={p.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23ddd%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2220%22%3EImage not available%3C/text%3E%3C/svg%3E';
                            }}
                        />

                        {/* Navigation arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Image counter */}
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {activeImageIdx + 1} / {images.length}
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center text-gray-400">
                        No images available
                    </div>
                )}

                {/* Thumbnail gallery */}
                {images.length > 0 && (
                    <div className="bg-white px-4 md:px-8 py-4 border-b overflow-x-auto">
                        <div className="flex gap-3">
                            {images.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIdx(idx)}
                                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition ${
                                        activeImageIdx === idx
                                            ? 'border-[#F5A623]'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Title and metadata card */}
            <div className="bg-white px-4 md:px-8 py-6 border-b">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{p.title}</h1>
                    <div className="flex flex-wrap gap-4 text-gray-600">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-5 h-5 text-[#F5A623]" />
                            <span>{p.location?.area || p.location?.city || 'Location not specified'}</span>
                        </div>
                        {p.rating && (
                            <div className="flex items-center gap-1">
                                <Star className="w-5 h-5 text-[#F5A623]" />
                                <span>{p.rating} rating</span>
                            </div>
                        )}
                        {p.bedrooms && (
                            <div className="text-gray-700">
                                {p.bedrooms} Bedroom{p.bedrooms !== 1 ? 's' : ''}
                            </div>
                        )}
                        {p.guests && (
                            <div className="text-gray-700">
                                {p.guests} Guest{p.guests !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content area */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left column - main content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* About section */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this place</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base">
                                    {p.description}
                                </p>
                            </section>

                            {/* Amenities section */}
                            {p.amenities && p.amenities.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {p.amenities.map((amenity: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-[#F5A623] transition">
                                                <span className="text-[#F5A623] flex-shrink-0">
                                                    {getAmenityIcon(amenity)}
                                                </span>
                                                <span className="text-sm text-gray-700">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Location section */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                                <div className="w-full h-80 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                    {p.location?.lat && p.location?.lng ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            style={{ border: 'none' }}
                                            src={`https://www.google.com/maps?q=${p.location.lat},${p.location.lng}&z=15&output=embed`}
                                            allowFullScreen={true}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            Location map not available
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Right column - sticky sidebar */}
                        <aside className="lg:col-span-1">
                            <div className="sticky top-32 space-y-4">
                                {/* Booking form */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <BookingForm propertyId={p._id || p.id} maxGuests={p.guests || 1} />
                                </div>

                                {/* Host info */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                            {p.host?.image ? (
                                                <img
                                                    src={p.host.image}
                                                    alt={p.host.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23ddd%22/%3E%3C/svg%3E';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                Hosted by {p.host?.name || 'Host'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {p.host?.joinedAt ? new Date(p.host.joinedAt).toLocaleDateString() : 'Joined recently'}
                                            </p>
                                        </div>
                                    </div>
                                    {p.host?.bio && (
                                        <p className="text-sm text-gray-600 leading-relaxed">{p.host.bio}</p>
                                    )}
                                </div>

                                {/* Contact form */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <ContactBox propertyId={p._id || p.id} />
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Amenity icon mapper
function getAmenityIcon(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-5 h-5" />;
    if (lower.includes('park') || lower.includes('car')) return <Car className="w-5 h-5" />;
    if (lower.includes('kitchen') || lower.includes('cook')) return <Utensils className="w-5 h-5" />;
    if (lower.includes('tv')) return <Tv className="w-5 h-5" />;
    if (lower.includes('coffee')) return <Coffee className="w-5 h-5" />;
    if (lower.includes('pool')) return <Droplets className="w-5 h-5" />;
    if (lower.includes('gym')) return <Dumbbell className="w-5 h-5" />;
    if (lower.includes('ac') || lower.includes('air')) return <Wind className="w-5 h-5" />;
    return <Star className="w-5 h-5" />;
}
