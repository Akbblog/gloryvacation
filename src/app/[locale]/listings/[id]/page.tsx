import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PropertyDetailClient from "./PropertyDetailClient";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { notFound } from "next/navigation";

console.log('[page.tsx] Property model loaded:', !!Property);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProperty(id: string) {
    console.log(`[getProperty] Starting lookup for id: '${id}'`);
    
    // TEMPORARY: Return mock data to test if the issue is with database lookup
    if (id === '694daf1580239e0639cee23f') {
        console.log(`[getProperty] Returning mock data for test property`);
        return {
            _id: '694daf1580239e0639cee23f',
            title: 'Test Property',
            slug: 'test-property',
            description: 'Test description',
            propertyType: 'apartment',
            bedrooms: 2,
            bathrooms: 2,
            guests: 2,
            images: ['/placeholder.jpg'],
            amenities: ['Wifi'],
            location: {
                address: 'Test Address',
                area: 'Test Area',
                city: 'Dubai',
                country: 'UAE'
            },
            host: { name: 'Test Host' },
            isActive: true,
            isApprovedByAdmin: true
        };
    }
    
    try {
        console.log(`[getProperty] Connecting to database...`);
        await connectDB();
        console.log(`[getProperty] Connected successfully`);
        
        // Prefer lookup by ObjectId when id looks like one, otherwise try slug.
        const isObjectId = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        console.log(`[getProperty] isObjectId: ${isObjectId}`);

        let property: any = null;

        if (isObjectId) {
            console.log(`[getProperty] Looking up by ObjectId: ${id}`);
            // Fetch property by _id (allow inactive so admin-created stays viewable)
            property = await Property.findById(id).populate({
                path: "host",
                select: "name role bio image joinedAt"
            }).lean();
            console.log(`[getProperty] ObjectId lookup result:`, property ? 'found' : 'not found');
        }

        // If not found by _id or id wasn't an ObjectId, try slug lookup as a fallback
        if (!property) {
            console.log(`[getProperty] Not found by ID or not ID, trying slug: '${id}'`);
            property = await Property.findOne({ slug: id }).populate({
                path: "host",
                select: "name role bio image joinedAt"
            }).lean();
            console.log(`[getProperty] Slug lookup result:`, property ? 'found' : 'not found');
        }

        if (!property) {
            console.log(`[getProperty] Property not found for id/slug: '${id}'`);
            return null;
        }

        console.log(`[getProperty] Found property: ${property._id}`);
        // Serialize strictly because of Mongoose hydration issues in Next.js
        return JSON.parse(JSON.stringify(property));
    } catch (e) {
        console.error(`[getProperty] Error fetching property:`, e);
        // If DB is unavailable or ID invalid, fall back to demo data in non-production
        // If DB is unavailable or ID invalid, fall back to demo data in non-production
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

export default async function ListingPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log(`[ListingPage] Page requested with id: '${id}', locale: '${resolvedParams.locale}'`);
    
    const listing = await getProperty(id);

    if (!listing) {
        console.log(`[ListingPage] Listing not found for id: '${id}', calling notFound()`);
        notFound();
    }

    console.log(`[ListingPage] Property found, rendering page for: ${listing._id}`);
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
