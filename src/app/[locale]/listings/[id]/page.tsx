import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PropertyDetailClient from "./PropertyDetailClient";
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
        // Prefer lookup by ObjectId when id looks like one, otherwise try slug.
        const isObjectId = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

        let property: any = null;

        if (isObjectId) {
            property = await Property.findById(id).populate("host").lean();
        }

        // If not found by _id or id wasn't an ObjectId, try slug lookup as a fallback
        if (!property) {
            property = await Property.findOne({ slug: id }).populate("host").lean();
        }

        if (!property) return null;

        // Serialize strictly because of Mongoose hydration issues in Next.js
        return JSON.parse(JSON.stringify(property));
    } catch (e) {
        // If DB is unavailable or ID invalid, fall back to demo data in non-production
        if (process.env.NODE_ENV !== 'production') {
            return {
                _id: id,
                title: 'Demo Property',
                images: [
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
                ],
                pricePerNight: 299,
                guests: 2,
                bedrooms: 1,
                bathrooms: 1,
                propertyType: 'apartment',
                amenities: ['Pool', 'WiFi'],
                isNew: false,
                location: { area: 'Demo Area', address: 'Demo Address', city: 'Dubai', country: 'UAE' },
                description: 'This is demo property data used when the database is not available in development.',
                host: { name: 'Demo Host', image: '' },
                rating: null,
                reviewCount: 0,
            };
        }
        return null; // Handle invalid ID format or not found
    }
}

export default async function ListingPage({ params }: { params: any }) {
    const { id } = await params;
    const listing = await getProperty(id);

    if (!listing) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
                {/* Render server content and include a client child that uses SWR to revalidate */}
                <PropertyDetailClient id={id} initialProperty={listing} />
            </main>

            <Footer />
        </div>
    );
}
