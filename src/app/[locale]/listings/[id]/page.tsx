import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookingForm } from "@/components/bookings/BookingForm";
import {
    Star, MapPin, Share, Heart, Wifi, Car, Utensils, Tv, Coffee,
    Wind, Droplets, Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { notFound } from "next/navigation";

// Helper to map amenity names to icons
const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("wifi")) return <Wifi className="w-5 h-5" />;
    if (lower.includes("park")) return <Car className="w-5 h-5" />;
    if (lower.includes("kitchen") || lower.includes("utensil")) return <Utensils className="w-5 h-5" />;
    if (lower.includes("tv")) return <Tv className="w-5 h-5" />;
    if (lower.includes("coffee")) return <Coffee className="w-5 h-5" />;
    if (lower.includes("pool")) return <Droplets className="w-5 h-5" />;
    if (lower.includes("gym")) return <Dumbbell className="w-5 h-5" />;
    if (lower.includes("ac") || lower.includes("air")) return <Wind className="w-5 h-5" />;

    return <Star className="w-5 h-5" />; // Default
};

async function getProperty(id: string) {
    await connectDB();
    try {
        const property = await Property.findById(id).populate("host").lean();
        if (!property) return null;
        // Serialize strictly because of Mongoose hydration issues in Next.js
        return JSON.parse(JSON.stringify(property));
    } catch (e) {
        return null; // Handle invalid ID format or not found
    }
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const listing = await getProperty(id);

    if (!listing) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 md:px-6 py-8">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-semibold text-[#1C1C1C] mb-2">{listing.title}</h1>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-foreground font-medium underline">
                            <Star className="w-4 h-4 fill-current text-primary" />
                            <span>{listing.rating || "New"}</span>
                            <span>·</span>
                            <span>{listing.reviewCount || 0} reviews</span>
                            <span>·</span>
                            <span>{listing.location.city}, {listing.location.country}</span>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-md transition text-[#1C1C1C]"><Share className="w-4 h-4" /> Share</button>
                            <button className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-md transition text-[#1C1C1C]"><Heart className="w-4 h-4" /> Save</button>
                        </div>
                    </div>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[480px] rounded-2xl overflow-hidden mb-12 relative">
                    {listing.images && listing.images.length > 0 ? (
                        <>
                            <div className="md:col-span-2 md:row-span-2 relative h-full">
                                <Image
                                    src={listing.images[0]}
                                    alt={listing.title}
                                    fill
                                    className="object-cover hover:opacity-95 transition cursor-pointer"
                                    priority
                                />
                            </div>
                            {listing.images.slice(1, 5).map((img: string, idx: number) => (
                                <div key={idx} className="relative hidden md:block">
                                    <Image
                                        src={img}
                                        alt={`View ${idx + 2}`}
                                        fill
                                        className="object-cover hover:opacity-95 transition cursor-pointer"
                                    />
                                    {idx === 3 && listing.images.length > 5 && (
                                        <div className="absolute bottom-4 right-4 bg-white px-3 py-1 text-sm font-semibold rounded-md shadow-md cursor-pointer hover:scale-105 transition">
                                            Show all photos
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="col-span-4 bg-gray-200 flex items-center justify-center h-full">
                            <p className="text-gray-500">No images available</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Left Column: Details */}
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-center pb-6 border-b">
                            <div>
                                <h2 className="text-xl font-semibold mb-1 text-[#1C1C1C]">
                                    {listing.propertyType ? listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1) : "Property"} hosted by {listing.host?.name || "Host"}
                                </h2>
                                <p className="text-gray-500">
                                    {listing.guests} guests · {listing.bedrooms} bedrooms · {listing.bedrooms} beds · {listing.bathrooms} baths
                                </p>
                            </div>
                            <div className="relative w-14 h-14">
                                {listing.host?.image ? (
                                    <Image src={listing.host.image} alt={listing.host.name} fill className="object-cover rounded-full border border-gray-300" />
                                ) : (
                                    <div className="w-full h-full bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                        {listing.host?.name?.[0] || "H"}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="py-8 border-b space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1"><MapPin className="w-6 h-6 text-gray-500" /></div>
                                <div>
                                    <h3 className="font-semibold text-[#1C1C1C]">Great location</h3>
                                    <p className="text-gray-500 text-sm">{listing.location.area}</p>
                                </div>
                            </div>
                            {/* Static Feature for now, could be dynamic */}
                            <div className="flex gap-4">
                                <div className="mt-1"><Wifi className="w-6 h-6 text-gray-500" /></div>
                                <div>
                                    <h3 className="font-semibold text-[#1C1C1C]">Fast Wifi</h3>
                                    <p className="text-gray-500 text-sm">Perfect for remote work and streaming.</p>
                                </div>
                            </div>
                        </div>

                        <div className="py-8 border-b">
                            <h3 className="text-xl font-semibold mb-4 text-[#1C1C1C]">About this place</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                        </div>

                        <div className="py-8 border-b">
                            <h3 className="text-xl font-semibold mb-6 text-[#1C1C1C]">What this place offers</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {listing.amenities.map((item: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 text-gray-600">
                                        {getAmenityIcon(item)}
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            {listing.amenities.length > 8 && (
                                <Button variant="outline" className="mt-8 rounded-lg border-gray-800 text-gray-800 hover:bg-gray-50">Show all {listing.amenities.length} amenities</Button>
                            )}
                        </div>

                        <div className="py-8">
                            <h3 className="text-xl font-semibold mb-6 text-[#1C1C1C]">Where you'll be</h3>
                            <div className="bg-gray-200 h-[300px] rounded-xl flex items-center justify-center text-gray-500 relative overflow-hidden">
                                <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center">
                                    <MapPin className="w-12 h-12 text-gray-300 mb-2" />
                                    <span className="font-medium text-gray-500">{listing.location.address}</span>
                                    <span className="text-sm text-gray-400">{listing.location.city}, {listing.location.country}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Booking */}
                    <div className="relative">
                        <BookingForm price={listing.pricePerNight} propertyId={listing._id} maxGuests={listing.guests} />
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
