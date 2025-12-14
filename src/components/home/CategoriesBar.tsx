
"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
    SquaresFour,
    Bed,
    House,
    Buildings,
    BuildingApartment,
    SwimmingPool,
    FunnelSimple,
    CaretLeft,
    CaretRight,
    CaretDown,
} from "@phosphor-icons/react";

interface Category {
    id: string;
    name: string;
    shortName: string;
    Icon: React.ElementType;
}

const CATEGORIES: Category[] = [
    { id: "all", name: "All Categories", shortName: "ALL", Icon: SquaresFour },
    { id: "1br", name: "1 Bedroom", shortName: "1BR", Icon: Bed },
    { id: "2br", name: "2 Bedrooms", shortName: "2BR", Icon: Bed },
    { id: "3br", name: "3 Bedrooms", shortName: "3BR", Icon: Bed },
    { id: "townhouse", name: "Townhouse", shortName: "Townhouse", Icon: House },
    { id: "studio", name: "Studio", shortName: "Studio", Icon: BuildingApartment },
    { id: "villa", name: "Villa", shortName: "Villa", Icon: Buildings },
    { id: "pool", name: "Pool", shortName: "Pool", Icon: SwimmingPool },
];

interface CategoriesBarProps {
    onCategoryChange?: (categoryId: string) => void;
    onFilterClick?: () => void;
}

export function CategoriesBar({ onCategoryChange, onFilterClick }: CategoriesBarProps) {
    const t = useTranslations('Categories');
    const [activeCategory, setActiveCategory] = useState("all");
    const [isScrolled, setIsScrolled] = useState(false); // Added new state as per instruction
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleCategoryClick = (categoryId: string) => {
        setActiveCategory(categoryId);
        onCategoryChange?.(categoryId);
    };

    const checkScrollButtons = () => {
        const container = scrollContainerRef.current;
        if (container) {
            setShowLeftArrow(container.scrollLeft > 0);
            setShowRightArrow(
                container.scrollLeft < container.scrollWidth - container.clientWidth - 1
            );
            // Added logic for isScrolled based on scroll position
            setIsScrolled(container.scrollLeft > 0 || container.scrollWidth > container.clientWidth);
        }
    };

    useEffect(() => {
        checkScrollButtons();
        window.addEventListener("resize", checkScrollButtons);
        return () => window.removeEventListener("resize", checkScrollButtons);
    }, []);

    const scroll = (direction: "left" | "right") => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 200;
            container.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="relative bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4 md:px-6 lg:px-[70px] max-w-[1440px]">
                <div className="flex items-center gap-4 py-3">
                    {/* Categories Scroll Container */}
                    <div className="relative flex-1 overflow-hidden">
                        {/* Left Scroll Button */}
                        {showLeftArrow && (
                            <button
                                onClick={() => scroll("left")}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all border border-gray-100 hover:border-gray-200"
                                aria-label="Scroll left"
                            >
                                <CaretLeft weight="bold" className="w-4 h-4 text-gray-600" />
                            </button>
                        )}

                        {/* Categories */}
                        <div
                            ref={scrollContainerRef}
                            onScroll={checkScrollButtons}
                            className="flex items-center overflow-x-auto scrollbar-hide scroll-smooth"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            {/* Desktop pill-style categories - Matching reference exactly */}
                            <div className="hidden md:flex items-center gap-0.5 p-1.5 bg-gray-50 border border-gray-200 rounded-full">
                                {CATEGORIES.map((cat) => {
                                    const IconComponent = cat.Icon;
                                    const isActive = activeCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                                                isActive
                                                    ? "bg-[#1C1C1C] text-white shadow-md"
                                                    : "text-gray-600 hover:bg-white hover:shadow-sm"
                                            )}
                                        >
                                            <IconComponent
                                                weight={isActive ? "fill" : "regular"}
                                                className={cn(
                                                    "w-[18px] h-[18px] transition-colors",
                                                    isActive ? "text-white" : "text-gray-500"
                                                )}
                                            />
                                            <span className={cn(
                                                "text-sm font-medium whitespace-nowrap transition-colors",
                                                isActive
                                                    ? "text-white"
                                                    : "text-gray-600"
                                            )}>
                                                {t(cat.id)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Mobile horizontal scroll categories */}
                            <div className="flex md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 gap-3 py-1">
                                {CATEGORIES.map((cat) => {
                                    const IconComponent = cat.Icon;
                                    const isActive = activeCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                                                isActive
                                                    ? "bg-[#1C1C1C] text-white border-[#1C1C1C] shadow-md"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 shadow-sm"
                                            )}
                                        >
                                            <IconComponent
                                                weight={isActive ? "fill" : "regular"}
                                                className="w-4 h-4"
                                            />
                                            <span>{t(cat.id)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Scroll Button */}
                        {showRightArrow && (
                            <button
                                onClick={() => scroll("right")}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all border border-gray-100 hover:border-gray-200"
                                aria-label="Scroll right"
                            >
                                <CaretRight weight="bold" className="w-4 h-4 text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={onFilterClick}
                        className="hidden md:flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                    >
                        <FunnelSimple weight="bold" className="w-4 h-4" />
                        <span>{t('filter')}</span>
                        <CaretDown weight="bold" className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}
