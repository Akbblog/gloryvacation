import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PropertyDetailClient from "./PropertyDetailClient";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { notFound } from "next/navigation";

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
