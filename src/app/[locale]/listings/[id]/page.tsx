import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PropertyDetailClient from "./PropertyDetailClient";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { notFound } from "next/navigation";

async function getProperty(id: string) {
    try {
        await connectDB();
        // Prefer lookup by ObjectId when id looks like one, otherwise try slug.
        const isObjectId = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

        let property: any = null;

        if (isObjectId) {
            // Fetch active properties for public viewing
            property = await Property.findById(id).populate({
                path: "host",
                select: "name role bio image joinedAt"
            }).lean();
            if (property && !property.isActive) {
                return null; // Property not active
            }
        }

        // If not found by _id or id wasn't an ObjectId, try slug lookup as a fallback
        if (!property) {
            property = await Property.findOne({ slug: id }).populate({
                path: "host",
                select: "name role bio image joinedAt"
            }).lean();
            if (property && !property.isActive) {
                return null; // Property not active
            }
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
