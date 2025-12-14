"use client";

import { Shield, Clock, Home, Star, Sparkles, Heart } from "lucide-react";
import { useTranslations } from "next-intl";

const SERVICES = [
    {
        icon: <Shield className="w-8 h-8" />,
        id: "verified",
    },
    {
        icon: <Clock className="w-8 h-8" />,
        id: "support",
    },
    {
        icon: <Home className="w-8 h-8" />,
        id: "premium",
    },
    {
        icon: <Star className="w-8 h-8" />,
        id: "rates",
    },
    {
        icon: <Sparkles className="w-8 h-8" />,
        id: "clean",
    },
    {
        icon: <Heart className="w-8 h-8" />,
        id: "trusted",
    },
];

export function OurServicesSection() {
    const t = useTranslations('Services');

    return (
        <section className="py-12 md:py-16 bg-white">
            <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px]">
                {/* Header */}
                <h2 className="text-xl md:text-2xl font-bold text-[#1C1C1C] text-center mb-10">
                    {t('title')}
                </h2>

                {/* Services Icons Row */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
                    {SERVICES.map((service, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center gap-3 group cursor-pointer"
                        >
                            {/* Orange Circle Icon */}
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F5A623] text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                                {service.icon}
                            </div>
                            {/* Title */}
                            <span className="text-sm md:text-base font-medium text-[#1C1C1C] text-center">
                                {t(service.id)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
