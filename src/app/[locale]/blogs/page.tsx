import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

// This would come from MongoDB in production
const BLOGS = [
    {
        id: "romantic-escapes-booking-luxury-stays-for-couples-in-dubai",
        title: "Romantic Escapes: Booking Luxury Stays for Couples in Dubai",
        excerpt: "Planning a romantic escape to Dubai? Discover luxury villas with private pools on Palm Jumeirah, beachfront properties, and stunning Downtown apartments. Find the perfect intimate setting for honeymoons, anniversaries, or special retreats.",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025&auto=format&fit=crop",
        date: "December 10, 2024",
        category: "Travel Tips",
        readTime: "5 min read",
    },
    {
        id: "family-oriented-expat-rentals-finding-your-perfect-3-bhk-villa",
        title: "Family-Oriented Expat Rentals: Finding Your Perfect 3 BHK Villa in Jumeirah",
        excerpt: "Moving to Dubai with family? This comprehensive guide helps you navigate the rental market to find the perfect family-friendly villa in Jumeirah and surrounding areas.",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
        date: "December 8, 2024",
        category: "Property Guide",
        readTime: "7 min read",
    },
    {
        id: "stay-near-history-holiday-homes-perfect-for-dubai-heritage-tours",
        title: "Stay Near History: Holiday Homes Perfect for Dubai Heritage Tours",
        excerpt: "Explore Dubai's rich cultural heritage while staying in perfectly located holiday homes near Al Fahidi, Dubai Creek, and the historic districts.",
        image: "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=2009&auto=format&fit=crop",
        date: "December 5, 2024",
        category: "Heritage & Culture",
        readTime: "6 min read",
    },
    {
        id: "al-barsha-holiday-apartments-your-central-hub",
        title: "Al Barsha Holiday Apartments: Your Central Hub Near Shopping and Entertainment",
        excerpt: "Discover why Al Barsha is becoming a top choice for holiday rentals - perfectly positioned near Mall of the Emirates and key attractions.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        date: "December 3, 2024",
        category: "Neighborhoods",
        readTime: "4 min read",
    },
    {
        id: "downtown-dubai-serviced-apartments-wake-up-to-the-worlds-best-view",
        title: "Downtown Dubai Serviced Apartments: Wake Up to the World's Best View",
        excerpt: "Experience the magic of waking up to views of Burj Khalifa and the Dubai Fountain. Our guide to the best serviced apartments in Downtown Dubai.",
        image: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1974&auto=format&fit=crop",
        date: "December 1, 2024",
        category: "Featured Properties",
        readTime: "5 min read",
    },
    {
        id: "dubai-winter-rentals-how-to-maximize-your-returns",
        title: "Dubai Winter Rentals: How EasyGo Holiday Homes Maximizes Your Returns",
        excerpt: "Learn why Dubai's winter season (October to April) is the golden season for property owners and how to capitalize on peak demand.",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop",
        date: "November 28, 2024",
        category: "Property Owners",
        readTime: "8 min read",
    },
];

const CATEGORIES = ["All", "Travel Tips", "Property Guide", "Heritage & Culture", "Neighborhoods", "Featured Properties", "Property Owners"];

export default function BlogsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-teal-50 to-amber-50">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] mb-4">
                            Travel <span className="text-teal-600">Blogs</span>
                        </h1>
                        <p className="text-lg text-[#7E7E7E]">
                            Discover travel tips, property guides, and insider knowledge about Dubai's best holiday destinations.
                        </p>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-8 border-b">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {CATEGORIES.map((cat, idx) => (
                            <button
                                key={idx}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${idx === 0
                                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                                    : "bg-[#F5F5F5] text-[#7E7E7E] hover:bg-gray-200"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {BLOGS.map((blog) => (
                            <Link
                                key={blog.id}
                                href={`/blogs/${blog.id}`}
                                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative h-[220px] overflow-hidden">
                                    <Image
                                        src={blog.image}
                                        alt={blog.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                                            {blog.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-sm text-[#7E7E7E] mb-3">
                                        <span>{blog.date}</span>
                                        <span>•</span>
                                        <span>{blog.readTime}</span>
                                    </div>
                                    <h2 className="text-xl font-semibold text-[#1C1C1C] mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                                        {blog.title}
                                    </h2>
                                    <p className="text-[#7E7E7E] line-clamp-2">{blog.excerpt}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="mt-12 text-center">
                        <button className="px-8 py-3 border border-[#1C1C1C] rounded-full text-[#1C1C1C] font-semibold hover:bg-[#1C1C1C] hover:text-white transition-colors">
                            Load More Articles
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
