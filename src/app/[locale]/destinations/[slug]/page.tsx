import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";

// This would come from MongoDB in production
const DESTINATIONS_DATA: Record<string, {
    name: string;
    description: string;
    longDescription: string;
    image: string;
    highlights: string[];
}> = {
    "dubai-marina": {
        name: "Dubai Marina",
        description: "Iconic waterfront living with stunning views of the marina skyline",
        longDescription: "Dubai Marina is a stunning waterfront development that has become one of the most sought-after destinations for both residents and tourists. With its impressive skyline, world-class restaurants, and vibrant nightlife, the Marina offers an unparalleled urban lifestyle. The Marina Walk provides access to countless dining and shopping options, while JBR Beach is just a short walk away.",
        image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=2069&auto=format&fit=crop",
        highlights: ["Marina Walk", "Beach Access", "World-class Dining", "Stunning Views", "Yacht Club"],
    },
    "downtown": {
        name: "Downtown Dubai",
        description: "Home to Burj Khalifa and Dubai Mall - the heart of the city",
        longDescription: "Downtown Dubai is the vibrant heart of the city, home to iconic landmarks including the world's tallest building, Burj Khalifa, and the world's largest mall, The Dubai Mall. This pedestrian-friendly neighborhood offers a perfect blend of luxury living, world-class entertainment, fine dining, and cultural experiences. Wake up to views of the Dubai Fountain and step out to endless attractions.",
        image: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1974&auto=format&fit=crop",
        highlights: ["Burj Khalifa Views", "Dubai Mall", "Dubai Fountain", "Opera District", "Boulevard"],
    },
    "palm-jumeirah": {
        name: "Palm Jumeirah",
        description: "The iconic palm-shaped island offering luxury beachfront living",
        longDescription: "Palm Jumeirah is an engineering marvel and one of the most recognized developments in the world. This palm-shaped island offers some of the most exclusive properties in Dubai, ranging from luxury apartments to palatial villas with private beaches. Home to Atlantis The Palm and numerous five-star hotels, the Palm offers an unmatched resort-style living experience.",
        image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=2072&auto=format&fit=crop",
        highlights: ["Private Beaches", "Atlantis", "Luxury Villas", "Beach Clubs", "Stunning Sunsets"],
    },
    "jbr": {
        name: "JBR - Jumeirah Beach Residence",
        description: "Beachfront community with The Walk promenade",
        longDescription: "JBR is Dubai's most vibrant beachfront community, featuring The Walk – a popular promenade lined with shops, restaurants, and entertainment venues. With direct beach access and views of Ain Dubai (the world's largest observation wheel), JBR offers an active lifestyle with the convenience of urban amenities right at your doorstep.",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop",
        highlights: ["The Walk", "Beach Access", "Ain Dubai", "Water Sports", "Family Friendly"],
    },
    "business-bay": {
        name: "Business Bay",
        description: "Modern business district with canal views and skyline proximity",
        longDescription: "Business Bay is Dubai's central business district, offering modern high-rise living with stunning views of the Dubai Canal and Downtown skyline. This dynamic neighborhood is perfect for those who want to be close to the action while enjoying more space and value. The Dubai Water Canal provides scenic promenade walks and waterfront dining options.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        highlights: ["Canal Views", "Near Downtown", "Modern Towers", "Promenade", "Great Value"],
    },
    "jvc": {
        name: "Jumeirah Village Circle",
        description: "Family-friendly community with parks and affordable luxury",
        longDescription: "JVC is a well-planned, family-friendly community that offers excellent value without compromising on quality. With numerous parks, community centers, and a growing selection of restaurants and cafes, JVC has become a favorite among families and young professionals. Its central location provides easy access to major attractions and business districts.",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
        highlights: ["Family Friendly", "Parks & Playgrounds", "Value for Money", "Community Feel", "Central Location"],
    },
};


export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const destination = DESTINATIONS_DATA[slug];

    if (!destination) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero */}
            <section className="relative h-[350px] md:h-[450px]">
                <Image src={destination.image} alt={destination.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                    <div className="container mx-auto max-w-[1440px]">
                        <div className="flex items-center gap-2 text-white/80 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>Dubai, UAE</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{destination.name}</h1>
                        <p className="text-lg text-white/90 max-w-2xl">{destination.description}</p>
                    </div>
                </div>
            </section>

            {/* About */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold text-[#1C1C1C] mb-4">About {destination.name}</h2>
                        <p className="text-[#7E7E7E] leading-relaxed mb-6">{destination.longDescription}</p>
                        <div className="flex flex-wrap gap-3">
                            {destination.highlights.map((h, idx) => (
                                <span key={idx} className="bg-teal-50 text-teal-600 px-4 py-2 rounded-full text-sm font-medium">
                                    {h}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Properties */}
            <section className="py-12 md:py-16 bg-[#FAFAFA]">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <h2 className="text-2xl font-bold text-[#1C1C1C] mb-8">
                        Properties in {destination.name}
                    </h2>
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-lg shadow-gray-100">
                        <p className="text-gray-600 text-lg mb-4">
                            This destination page highlights curated neighborhoods. For the latest available listings, visit the main listings page and filter by destination.
                        </p>
                        <Link
                            href="/listings"
                            className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-teal-200"
                        >
                            Browse all listings
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
