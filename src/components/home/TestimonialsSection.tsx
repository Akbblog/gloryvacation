"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useTranslations } from "next-intl";

const TESTIMONIALS = [
    { id: 1, rating: 5 },
    { id: 2, rating: 5 },
    { id: 3, rating: 5 },
    { id: 4, rating: 5 },
    { id: 5, rating: 5 },
];

export function TestimonialsSection() {
    const t = useTranslations('Testimonials');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            setCanScrollLeft(scrollRef.current.scrollLeft > 0);
            setCanScrollRight(
                scrollRef.current.scrollLeft <
                scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
            );
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 350;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="py-12 md:py-20 bg-[#FAFAFA]">
            <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px]">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-[#1C1C1C]">
                        {t('title')}
                    </h2>

                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-[#1C1C1C] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-[#1C1C1C] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                        </button>
                    </div>
                </div>

                {/* Testimonials Carousel */}
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    dir="ltr"
                >
                    {TESTIMONIALS.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="flex-shrink-0 w-[300px] md:w-[340px] bg-white rounded-2xl p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.1)] transition-shadow duration-300"
                        >
                            {/* Quote Icon */}
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Quote className="w-5 h-5 text-primary" />
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-[#1C1C1C] mb-3">
                                {t(`${testimonial.id}.title`)}
                            </h3>

                            {/* Text */}
                            <p className="text-[#7E7E7E] text-sm leading-relaxed mb-4">
                                {t(`${testimonial.id}.text`)}
                            </p>

                            {/* Rating & Author */}
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                <span className="text-sm font-medium text-[#1C1C1C]">
                                    {t(`${testimonial.id}.author`)}
                                </span>
                                <div className="flex items-center gap-1">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-4 h-4 text-[#F5A623] fill-[#F5A623]"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
