"use client";

import Image from "next/image";
import Link from "next/link";

const LOCATIONS = [
    {
        name: "Dubai Marina",
        image: "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=2009&auto=format&fit=crop",
        count: "120+ Homes",
        slug: "dubai-marina",
    },
    {
        name: "Downtown Dubai",
        image: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1974&auto=format&fit=crop",
        count: "85+ Homes",
        slug: "downtown-dubai",
    },
    {
        name: "Palm Jumeirah",
        image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=2072&auto=format&fit=crop",
        count: "60+ Homes",
        slug: "palm-jumeirah",
    },
    {
        name: "JBR",
        image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=2069&auto=format&fit=crop",
        count: "95+ Homes",
        slug: "jbr",
    },
    {
        name: "Business Bay",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop",
        count: "110+ Homes",
        slug: "business-bay",
    },
    {
        name: "Dubai Hills",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        count: "45+ Homes",
        slug: "dubai-hills",
    },
];

export function Destinations() {
    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex justify-between items-end mb-10 md:mb-12">
                    <div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
                            Live Anywhere
                        </h2>
                        <p className="text-gray-500 text-base md:text-lg">
                            Keep calm & travel on
                        </p>
                    </div>
                    <Link
                        href="/destinations"
                        className="hidden md:block text-primary font-semibold hover:underline transition-colors"
                    >
                        View all destinations →
                    </Link>
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {LOCATIONS.map((loc, idx) => (
                        <Link
                            key={idx}
                            href={`/destinations/${loc.slug}`}
                            className="group cursor-pointer"
                        >
                            <div className="relative aspect-square rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                <Image
                                    src={loc.image}
                                    alt={loc.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 150px, 180px"
                                />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-primary transition-colors">
                                    {loc.name}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">{loc.count}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile View All Button */}
                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/destinations"
                        className="inline-block text-primary font-semibold hover:underline"
                    >
                        View all destinations →
                    </Link>
                </div>
            </div>
        </section>
    );
}
