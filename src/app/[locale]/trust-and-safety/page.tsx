import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, UserCheck, Home, Lock, AlertCircle, Phone } from "lucide-react";

const TRUST_FEATURES = [
    {
        icon: <Shield className="w-8 h-8" />,
        title: "DTCM Licensed",
        description: "All our properties are licensed by the Department of Tourism and Commerce Marketing (DTCM), ensuring compliance with Dubai's tourism regulations.",
    },
    {
        icon: <UserCheck className="w-8 h-8" />,
        title: "Verified Guests",
        description: "Every guest goes through our verification process including ID verification and payment authentication before booking confirmation.",
    },
    {
        icon: <Home className="w-8 h-8" />,
        title: "Property Standards",
        description: "Each property is personally inspected and must meet our quality standards for cleanliness, safety, and amenities before listing.",
    },
    {
        icon: <Lock className="w-8 h-8" />,
        title: "Secure Payments",
        description: "All payments are processed through secure, encrypted payment gateways. Your financial information is never stored on our servers.",
    },
    {
        icon: <AlertCircle className="w-8 h-8" />,
        title: "Insurance Coverage",
        description: "Properties are covered by comprehensive insurance policies, providing protection for both property owners and guests.",
    },
    {
        icon: <Phone className="w-8 h-8" />,
        title: "24/7 Support",
        description: "Our dedicated support team is available around the clock to assist with any issues or emergencies during your stay.",
    },
];

const SAFETY_TIPS = [
    "Always book through our official platform to ensure protection under our policies.",
    "Never share personal financial information outside of our secure booking system.",
    "Report any suspicious activity or safety concerns immediately to our team.",
    "Familiarize yourself with emergency exits and safety equipment upon arrival.",
    "Keep valuables in the provided safe when available.",
    "Follow check-in procedures and access instructions provided by our team.",
];

export default function TrustAndSafetyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-teal-50 to-amber-50">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8 text-teal-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] mb-4">
                            Trust & <span className="text-teal-600">Safety</span>
                        </h1>
                        <p className="text-lg text-[#7E7E7E]">
                            Your safety and security are our top priorities. Learn about the measures we take to protect our guests and property owners.
                        </p>
                    </div>
                </div>
            </section>

            {/* Trust Features */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] mb-10 text-center">
                        How We Keep You Safe
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {TRUST_FEATURES.map((feature, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-[#FAFAFA] hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-[#1C1C1C] mb-3">{feature.title}</h3>
                                <p className="text-[#7E7E7E]">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Safety Tips */}
            <section className="py-12 md:py-16 bg-[#1C1C1C]">
                <div className="container mx-auto px-4 md:px-6 max-w-[900px]">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                        Safety Tips for Guests
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SAFETY_TIPS.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-sm">
                                    {idx + 1}
                                </div>
                                <p className="text-white/80">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Property Owner Section */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-[900px]">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] mb-6 text-center">
                        Protection for Property Owners
                    </h2>
                    <div className="prose prose-lg max-w-none text-[#7E7E7E]">
                        <p>
                            As a property owner with EasyGo Holiday Homes, your property is protected by multiple layers of security and verification processes:
                        </p>
                        <ul>
                            <li><strong>Guest Verification:</strong> All guests must provide valid identification and undergo our verification process before booking confirmation.</li>
                            <li><strong>Security Deposits:</strong> We collect security deposits from guests to cover any potential damages during their stay.</li>
                            <li><strong>Insurance Coverage:</strong> Comprehensive property insurance is included as part of our management services.</li>
                            <li><strong>Professional Inspections:</strong> Our team conducts thorough inspections before and after each guest stay.</li>
                            <li><strong>Clear House Rules:</strong> Your property's rules are clearly communicated to guests and enforced by our team.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-12 bg-[#FAFAFA]">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px] text-center">
                    <h2 className="text-2xl font-bold text-[#1C1C1C] mb-4">Have Safety Concerns?</h2>
                    <p className="text-[#7E7E7E] mb-6">
                        Our team is available 24/7 to address any safety issues or concerns.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                        Contact Support
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
}
