import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PropertyDetailClient from "./PropertyDetailClient";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { Link } from "@/i18n/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProperty(id: string) {
    console.log(`[getProperty] Looking up property for slug: '${id}'`);
    
    try {
        await connectDB();

        // Single slug-based lookup keeps the logic simple and deterministic
        const property = await Property.findOne({
            slug: id,
            isActive: true,
            $or: [
                { isApprovedByAdmin: true },
                { isApprovedByAdmin: { $exists: false } },
            ],
        })
            .populate({
                path: "host",
                select: "name role bio image joinedAt",
            })
            .lean();

        if (!property) {
            console.log(`[getProperty] Property missing or not visible for slug: '${id}'`);
            return null;
        }

        return JSON.parse(JSON.stringify(property));
    } catch (e) {
        console.error("[getProperty] Error fetching property:", e);
        return null;
    }
}

export default async function ListingPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const listing = await getProperty(id);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
                {listing ? (
                    <PropertyDetailClient id={id} initialProperty={listing} />
                ) : (
                    <div className="flex flex-col items-center justify-center text-center gap-4 py-20">
                        <h1 className="text-3xl font-bold text-gray-900">Listing unavailable</h1>
                        <p className="text-gray-600 max-w-xl">
                            The property you tried to visit is not live yet. It may still be pending approval or has been archived.
                        </p>
                        <Link
                            href="/listings"
                            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-white font-semibold shadow-lg shadow-teal-200"
                        >
                            Browse available listings
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
