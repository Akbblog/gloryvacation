import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";

// This would come from MongoDB in production
const BLOGS_DATA: Record<string, {
    title: string;
    content: string;
    image: string;
    date: string;
    category: string;
    readTime: string;
    author: { name: string; image: string };
}> = {
    "romantic-escapes-booking-luxury-stays-for-couples-in-dubai": {
        title: "Romantic Escapes: Booking Luxury Stays for Couples in Dubai",
        content: `
      <p>Dubai has become one of the world's most sought-after romantic destinations, offering couples an unparalleled blend of luxury, adventure, and intimate experiences. Whether you're planning a honeymoon, celebrating an anniversary, or simply escaping for a romantic getaway, finding the perfect accommodation is key to creating unforgettable memories.</p>
      
      <h2>Why Choose Dubai for Your Romantic Escape?</h2>
      <p>Dubai offers a unique combination of world-class luxury, stunning architecture, pristine beaches, and year-round sunshine. The city's diverse offerings mean couples can enjoy everything from intimate desert dinners under the stars to private yacht cruises along the coast.</p>
      
      <h2>Top Areas for Romantic Stays</h2>
      <h3>Palm Jumeirah</h3>
      <p>Nothing says romance quite like waking up in a private villa with your own pool overlooking the Arabian Gulf. Our collection of Palm Jumeirah properties offers the ultimate in privacy and luxury, with many featuring private beach access and stunning sunset views.</p>
      
      <h3>Downtown Dubai</h3>
      <p>For couples who love city vibes, our Downtown apartments offer breathtaking views of the Burj Khalifa and Dubai Fountain. Imagine watching the fountain show from your private balcony as you toast to your love.</p>
      
      <h3>Dubai Marina</h3>
      <p>The Marina offers a vibrant yet romantic atmosphere, with waterfront dining and the sparkle of city lights reflecting on the water. Our Marina properties provide the perfect base for couples who want to explore the city's nightlife.</p>
      
      <h2>Romantic Experiences to Add to Your Stay</h2>
      <ul>
        <li>Private dinner in the desert with traditional Arabic entertainment</li>
        <li>Couples spa treatments at world-class facilities</li>
        <li>Sunset yacht cruise along the Dubai coastline</li>
        <li>Hot air balloon ride over the desert at sunrise</li>
        <li>Private photographer session at iconic Dubai landmarks</li>
      </ul>
      
      <h2>Book Your Romantic Escape</h2>
      <p>At EasyGo Holiday Homes, we specialize in creating memorable experiences. Our team can help you select the perfect property and even arrange special touches like rose petal turndowns, champagne on arrival, and personalized itineraries.</p>
    `,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025&auto=format&fit=crop",
        date: "December 10, 2024",
        category: "Travel Tips",
        readTime: "5 min read",
        author: { name: "Sarah Mitchell", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
    },
    // Add more blog entries...
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const blog = BLOGS_DATA[slug];

    if (!blog) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero */}
            <section className="relative h-[400px] md:h-[500px]">
                <Image src={blog.image} alt={blog.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                    <div className="container mx-auto max-w-[900px]">
                        <span className="inline-block bg-primary text-white text-sm font-medium px-4 py-1 rounded-full mb-4">
                            {blog.category}
                        </span>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            {blog.title}
                        </h1>
                        <div className="flex items-center gap-4 text-white/80">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{blog.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{blog.readTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <article className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-[900px]">
                    {/* Back & Share */}
                    <div className="flex justify-between items-center mb-8">
                        <Link href="/blogs" className="flex items-center gap-2 text-[#7E7E7E] hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blogs
                        </Link>
                        <button className="flex items-center gap-2 text-[#7E7E7E] hover:text-primary transition-colors">
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                            <Image src={blog.author.image} alt={blog.author.name} fill className="object-cover" />
                        </div>
                        <div>
                            <div className="font-semibold text-[#1C1C1C]">{blog.author.name}</div>
                            <div className="text-sm text-[#7E7E7E]">EasyGo Holiday Homes</div>
                        </div>
                    </div>

                    {/* Article Content */}
                    <div
                        className="prose prose-lg max-w-none prose-headings:text-[#1C1C1C] prose-p:text-[#7E7E7E] prose-a:text-primary"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* CTA */}
                    <div className="mt-12 p-8 bg-[#FAFAFA] rounded-2xl text-center">
                        <h3 className="text-2xl font-bold text-[#1C1C1C] mb-4">Ready to Book Your Stay?</h3>
                        <p className="text-[#7E7E7E] mb-6">
                            Explore our collection of premium holiday homes in Dubai.
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Browse Properties
                        </Link>
                    </div>
                </div>
            </article>

            <Footer />
        </div>
    );
}
