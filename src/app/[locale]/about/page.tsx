import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { Shield, Users, Award, Building, CheckCircle } from "lucide-react";

const STATS = [
    { value: "500+", label: "Holiday Homes" },
    { value: "50K+", label: "Happy Guests" },
    { value: "4.6", label: "Average Rating" },
    { value: "100+", label: "5-Star Reviews" },
];

const VALUES = [
    {
        icon: <Shield className="w-8 h-8" />,
        title: "Trust & Safety",
        description: "Every property is DTCM licensed and thoroughly verified for your peace of mind.",
    },
    {
        icon: <Users className="w-8 h-8" />,
        title: "Guest Experience",
        description: "We go above and beyond to ensure every guest has an unforgettable stay.",
    },
    {
        icon: <Award className="w-8 h-8" />,
        title: "Quality Standards",
        description: "Only premium properties that meet our strict quality criteria make it to our platform.",
    },
    {
        icon: <Building className="w-8 h-8" />,
        title: "Professional Management",
        description: "End-to-end property management including cleaning, maintenance, and guest support.",
    },
];

const TEAM = [
    { name: "Ahmed Al-Rashid", role: "CEO & Founder", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
    { name: "Sarah Mitchell", role: "Head of Operations", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
    { name: "Mohammed Hassan", role: "Property Manager", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" },
    { name: "Emma Chen", role: "Guest Relations", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/5 to-[#F5A623]/5">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1C1C1C] mb-6">
                            About <span className="text-teal-600">Glory Vacation</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[#7E7E7E]">
                            We're on a mission to make holiday home rentals in Dubai simple, safe, and exceptional for everyone.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-6">Our Story</h2>
                            <p className="text-[#7E7E7E] text-lg leading-relaxed mb-6">
                                Glory Vacation Homes was founded with a simple vision: to transform the holiday rental experience in Dubai. We noticed that property owners struggled to manage their properties effectively, while travelers often faced inconsistent experiences.
                            </p>
                            <p className="text-[#7E7E7E] text-lg leading-relaxed mb-6">
                                Today, we're proud to be one of Dubai's leading holiday home management companies, fully licensed by the Department of Tourism and Commerce Marketing (DTCM). We've helped hundreds of property owners maximize their returns while providing thousands of guests with memorable stays.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-[#1C1C1C]">
                                    <CheckCircle className="w-5 h-5 text-teal-600" />
                                    <span>DTCM Licensed</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#1C1C1C]">
                                    <CheckCircle className="w-5 h-5 text-teal-600" />
                                    <span>4.6★ Average Rating</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#1C1C1C]">
                                    <CheckCircle className="w-5 h-5 text-teal-600" />
                                    <span>100+ Reviews</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-[400px] rounded-2xl overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
                                alt="Glory Vacation Homes"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-[#1C1C1C]">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {STATS.map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-4xl md:text-5xl font-bold text-teal-400 mb-2">{stat.value}</div>
                                <div className="text-white/80">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-12 text-center">Our Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {VALUES.map((value, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-[#FAFAFA] hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-[#1C1C1C] mb-3">{value.title}</h3>
                                <p className="text-[#7E7E7E]">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section - Hidden */}
            {false && (
            <section className="py-16 md:py-24 bg-[#FAFAFA]">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-12 text-center">Meet Our Team</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {TEAM.map((member, idx) => (
                            <div key={idx} className="text-center">
                                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-[#1C1C1C]">{member.name}</h3>
                                <p className="text-[#7E7E7E] text-sm">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            <Footer />
        </div>
    );
}
