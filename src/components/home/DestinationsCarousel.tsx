"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

const DESTINATIONS = [
    {
        id: "downtown",
        name: "Downtown Dubai",
        image: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1974&auto=format&fit=crop",
        propertyCount: 45,
    },
    {
        id: "marina",
        name: "Dubai Marina",
        image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=2069&auto=format&fit=crop",
        propertyCount: 38,
    },
    {
        id: "jvc",
        name: "Dubai JVC",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
        propertyCount: 52,
    },
    {
        id: "palm",
        name: "Palm Jumeirah",
        image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=2072&auto=format&fit=crop",
        propertyCount: 28,
    },
    {
        id: "jbr",
        name: "JBR",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop",
        propertyCount: 35,
    },
    {
        id: "business-bay",
        name: "Business Bay",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        propertyCount: 41,
    },
];

export function DestinationsCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: "start",
        containScroll: "trimSnaps",
        dragFree: true,
    });

    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(2); // Start with middle item highlighted

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    const t = useTranslations('Destinations');

    return (
        <section className="py-12 md:py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-[#1C1C1C]">
                        {t('title')}
                    </h2>

                    {/* Navigation Arrows */}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={scrollPrev}
                            disabled={!canScrollPrev}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-[#1C1C1C] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                        </button>
                        <button
                            onClick={scrollNext}
                            disabled={!canScrollNext}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-[#1C1C1C] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                <div className="overflow-hidden -mx-4 md:mx-0" dir="ltr" ref={emblaRef}>
                    <div className="flex gap-3 md:gap-4 px-4 md:px-0">
                        {DESTINATIONS.map((dest, idx) => {
                            // Determine if this is the "featured" (larger) item
                            const isFeatured = idx === selectedIndex;

                            return (
                                <Link
                                    key={dest.id}
                                    href={`/destinations/${dest.id}`}
                                    className={`relative flex-shrink-0 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300
                    ${isFeatured
                                            ? "w-[280px] md:w-[500px] h-[180px] md:h-[320px]"
                                            : "w-[100px] md:w-[180px] h-[180px] md:h-[320px]"
                                        }`}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                >
                                    {/* Background Image */}
                                    <Image
                                        src={dest.image}
                                        alt={t(dest.id)}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes={isFeatured ? "(max-width: 768px) 280px, 500px" : "(max-width: 768px) 100px, 180px"}
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                    {/* Content */}
                                    <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 transition-opacity duration-300 ${isFeatured ? "opacity-100" : "opacity-0 md:opacity-100"}`}>
                                        <h3 className={`font-bold text-white ${isFeatured ? "text-xl md:text-2xl" : "text-sm md:text-base"}`}>
                                            {t(dest.id)}
                                        </h3>
                                        {isFeatured && (
                                            <p className="text-white/80 text-sm mt-1">
                                                {t('properties', { count: dest.propertyCount })}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
