"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
    Heart,
    Star,
    CaretLeft,
    CaretRight,
    User,
    Bed,
    BuildingApartment,
    SwimmingPool,
} from "@phosphor-icons/react";

interface PropertyCardProps {
    id: string;
    title: string;
    pricePerNight?: number;
    images: string[];
    guests: number;
    bedrooms: number;
    propertyType: "apartment" | "villa" | "studio" | "townhouse" | "penthouse";
    amenities?: string[];
    isNew?: boolean;
}

export function PropertyCard({
    id,
    title,
    pricePerNight,
    images,
    guests,
    bedrooms,
    propertyType,
    amenities = [],
    isNew = false,
}: PropertyCardProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const t = useTranslations('PropertyCard');

    const scrollPrev = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        emblaApi?.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        emblaApi?.scrollNext();
    }, [emblaApi]);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorited(!isFavorited);
    };

    const hasPool = amenities.some(a => a.toLowerCase().includes("pool"));

    const getBedLabel = () => {
        if (propertyType === "studio") return t('studio');
        if (bedrooms === 1) return t('oneBedroom');
        return t('bedrooms', { count: bedrooms });
    };

    const listingHref = `/listings/${encodeURIComponent(id)}`;

    return (
        <Link href={listingHref}>
            <article className="flex flex-col rounded-2xl cursor-pointer border border-[#E8E8E8] overflow-hidden bg-white shadow-[0px_3px_8px_0px_rgba(0,0,0,0.08)] hover:shadow-[0px_8px_20px_0px_rgba(0,0,0,0.12)] transition-all duration-300 group">
                {/* Image Section */}
                <div className="relative w-full h-[165px] sm:h-[304px]">
                    <div className="relative w-full h-full overflow-hidden" ref={emblaRef}>
                        <div className="flex h-full">
                            {images.slice(0, 5).map((img, idx) => (
                                <div key={idx} className="min-w-0 shrink-0 grow-0 basis-full relative h-full">
                                    <Image
                                        src={img}
                                        alt={`${title} - Image ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 173px, 310px"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={scrollPrev}
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 shadow-lg hidden group-hover:flex items-center justify-center text-[#1C1C1C] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 backdrop-blur-sm"
                            >
                                <CaretLeft weight="bold" className="w-4 h-4" />
                            </button>
                            <button
                                onClick={scrollNext}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 shadow-lg hidden group-hover:flex items-center justify-center text-[#1C1C1C] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 backdrop-blur-sm"
                            >
                                <CaretRight weight="bold" className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    {/* Pool Tag & Heart */}
                    <div className="absolute top-4 sm:top-5 left-0 right-0 flex justify-between items-start px-4 sm:px-5">
                        {hasPool ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full font-medium shadow-lg bg-white/95 backdrop-blur-sm text-[#1C1C1C] py-1.5 px-3 text-xs">
                                <SwimmingPool weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                {t('pool')}
                            </span>
                        ) : <div />}
                        <button
                            onClick={handleFavoriteClick}
                            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:bg-white/40"
                        >
                            <Heart
                                weight={isFavorited ? "fill" : "regular"}
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    isFavorited ? "text-red-500" : "text-white"
                                )}
                            />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col p-3 sm:p-5 flex-1">
                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-semibold line-clamp-2 min-h-[44px] sm:min-h-[52px] text-[#1C1C1C] leading-tight">
                        {title}
                    </h3>

                    {/* Property Details */}
                    <div className="flex flex-col gap-1.5 sm:gap-2.5 mt-2.5">
                        <p className="flex items-center gap-2 text-[#7E7E7E] text-xs sm:text-sm font-medium">
                            <User weight="fill" className="w-4 h-4 text-[#9CA3AF]" />
                            <span>{guests} {t('guests')}</span>
                        </p>
                        <p className="flex items-center gap-2 text-[#7E7E7E] text-xs sm:text-sm font-medium">
                            {propertyType === "studio" ? (
                                <BuildingApartment weight="fill" className="w-4 h-4 text-[#9CA3AF]" />
                            ) : (
                                <Bed weight="fill" className="w-4 h-4 text-[#9CA3AF]" />
                            )}
                            <span>{getBedLabel()}</span>
                        </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-gray-100">
                        <div className="text-sm text-[#9CA3AF]">{/* Price hidden — contact for pricing */}</div>
                        {isNew && (
                            <div className="hidden sm:flex items-center gap-1 bg-[#F5A623]/10 px-2.5 py-1 rounded-full">
                                <Star weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                <span className="text-xs font-semibold text-[#F5A623]">{t('new')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}
