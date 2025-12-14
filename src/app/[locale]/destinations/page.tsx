import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

const DESTINATIONS = [
    {
        id: "dubai-marina",
        name: "Dubai Marina",
        description: "Iconic waterfront living with stunning views of the marina skyline",
        image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=2069&auto=format&fit=crop",
        propertyCount: 38,
        highlights: ["Marina Walk", "Beach Access", "Dining & Nightlife"],
    },
    {
        id: "downtown",
        name: "Downtown Dubai",
        description: "Home to Burj Khalifa and Dubai Mall - the heart of the city",
        image: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1974&auto=format&fit=crop",
        propertyCount: 45,
        highlights: ["Burj Khalifa Views", "Dubai Mall", "Dubai Fountain"],
    },
    {
        id: "palm-jumeirah",
        name: "Palm Jumeirah",
        description: "The iconic palm-shaped island offering luxury beachfront living",
        image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=2072&auto=format&fit=crop",
        propertyCount: 28,
        highlights: ["Private Beaches", "Luxury Villas", "Atlantis"],
    },
    {
        id: "jbr",
        name: "JBR - Jumeirah Beach Residence",
        description: "Beachfront community with The Walk promenade",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop",
        propertyCount: 35,
        highlights: ["The Walk", "Beach Access", "Ain Dubai"],
    },
    {
        id: "business-bay",
        name: "Business Bay",
        description: "Modern business district with canal views and skyline proximity",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        propertyCount: 41,
        highlights: ["Canal Views", "Near Downtown", "Modern Living"],
    },
    {
        id: "jvc",
        name: "Jumeirah Village Circle",
        description: "Family-friendly community with parks and affordable luxury",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
        propertyCount: 52,
        highlights: ["Family Friendly", "Parks", "Value for Money"],
    },
    {
        id: "dubai-hills",
        name: "Dubai Hills Estate",
        description: "Green community with golf course and premium residences",
        image: "https://images.unsplash.com/photo-1613490493576-2f045a4a708d?q=80&w=2069&auto=format&fit=crop",
        propertyCount: 22,
        highlights: ["Golf Course", "Dubai Hills Mall", "Green Spaces"],
    },
    {
        id: "emaar-beachfront",
        name: "Emaar Beachfront",
        description: "New beachfront destination between Marina and Palm",
        image: "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?q=80&w=2070&auto=format&fit=crop",
        propertyCount: 15,
        highlights: ["Private Beach", "Marina Views", "New Development"],
    },
];

export default function DestinationsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-[#F5A623]/5">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] mb-4">
                            Explore <span className="text-primary">Destinations</span> in Dubai
                        </h1>
                        <p className="text-lg text-[#7E7E7E]">
                            Discover the best neighborhoods for your holiday home stay in Dubai.
                        </p>
                    </div>
                </div>
            </section>

            {/* Destinations Grid */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {DESTINATIONS.map((dest) => (
                            <Link
                                key={dest.id}
                                href={`/destinations/${dest.id}`}
                                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative h-[200px] overflow-hidden">
                                    <Image
                                        src={dest.image}
                                        alt={dest.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h2 className="text-xl font-bold text-white">{dest.name}</h2>
                                        <p className="text-white/80 text-sm">{dest.propertyCount} Properties</p>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <p className="text-[#7E7E7E] text-sm mb-4">{dest.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {dest.highlights.map((h, idx) => (
                                            <span key={idx} className="text-xs bg-[#F5F5F5] text-[#7E7E7E] px-3 py-1 rounded-full">
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
