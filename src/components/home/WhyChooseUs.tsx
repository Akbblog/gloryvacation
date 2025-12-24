"use client";

import { Shield, Clock, Headphones, Award, Home, Users } from "lucide-react";

const FEATURES = [
    {
        icon: <Shield className="w-8 h-8" />,
        title: "Verified Properties",
        description: "Every property is thoroughly verified and inspected for quality and safety standards.",
    },
    {
        icon: <Clock className="w-8 h-8" />,
        title: "Instant Booking",
        description: "Book your perfect holiday home instantly with our seamless reservation system.",
    },
    {
        icon: <Headphones className="w-8 h-8" />,
        title: "24/7 Support",
        description: "Our dedicated support team is available around the clock to assist you.",
    },
    {
        icon: <Award className="w-8 h-8" />,
        title: "Best Price Guarantee",
        description: "We guarantee the best rates for all our premium holiday properties.",
    },
    {
        icon: <Home className="w-8 h-8" />,
        title: "Premium Stays",
        description: "Experience luxury living with our handpicked collection of holiday homes.",
    },
    {
        icon: <Users className="w-8 h-8" />,
        title: "Trusted by Thousands",
        description: "Join thousands of satisfied guests who have made unforgettable memories.",
    },
];

export function WhyChooseUs() {
    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-neutral-50">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                        Why Choose EasyGo?
                    </h2>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        Discover the EasyGo difference – premium holiday homes with exceptional service.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {FEATURES.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group bg-white rounded-2xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-teal-600 group-hover:text-white transition-all duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-neutral-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-neutral-200">
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-2">500+</div>
                        <div className="text-neutral-600 font-medium">Holiday Homes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-2">50K+</div>
                        <div className="text-neutral-600 font-medium">Happy Guests</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-2">4.9</div>
                        <div className="text-neutral-600 font-medium">Average Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-2">24/7</div>
                        <div className="text-neutral-600 font-medium">Customer Support</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
