"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useProperties, useFilteredProperties } from "@/lib/hooks/useProperties";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { format, addDays } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useTranslations, useLocale } from "next-intl";
import { ar, enUS } from "date-fns/locale";
import {
    MagnifyingGlass,
    FunnelSimple,
    MapPin,
    CalendarBlank,
    UsersThree,
    House,
    CaretDown,
    X,
    MapTrifold,
    SquaresFour,
    SpinnerGap,
    Buildings,
    Tree,
    Umbrella,
    Briefcase,
    Mountains,
    Laptop,
    Anchor,
    Storefront,
    Horse,
    SoccerBall,
    Minus,
    Plus,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Filter options
const PROPERTY_TYPES = [
    { value: "", label: "Any Type" },
    { value: "studio", label: "Studio" },
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "townhouse", label: "Townhouse" },
    { value: "penthouse", label: "Penthouse" },
];

const BEDROOM_OPTIONS = [
    { value: "", label: "Bedrooms" },
    { value: "0", label: "Studio" },
    { value: "1", label: "1 Bedroom" },
    { value: "2", label: "2 Bedrooms" },
    { value: "3", label: "3 Bedrooms" },
    { value: "4", label: "4+ Bedrooms" },
];

const PRICE_RANGES = [
    { value: "", label: "Price" },
    { value: "0-300", label: "Under AED 300" },
    { value: "300-500", label: "AED 300 - 500" },
    { value: "500-800", label: "AED 500 - 800" },
    { value: "800-1200", label: "AED 800 - 1,200" },
    { value: "1200-99999", label: "AED 1,200+" },
];

const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "rating", label: "Top Rated" },
];

const AMENITIES = [
    "Pool",
    "Gym",
    "WiFi",
    "Parking",
    "Beach Access",
    "Balcony",
    "Kitchen",
    "Washer",
    "Dryer",
    "Air Conditioning",
    "Heating",
    "TV",
    "Workspace",
    "Pet Friendly",
    "Kids Friendly",
    "BBQ",
    "Garden",
    "Hot Tub",
];

// Dubai Areas Configuration with Icons
const DUBAI_AREAS = [
    { value: "downtown-dubai", label: "Downtown Dubai", Icon: Buildings },
    { value: "palm-jumeirah", label: "Palm Jumeirah", Icon: Tree },
    { value: "jbr", label: "JBR - Jumeirah Beach Residence", Icon: Umbrella },
    { value: "business-bay", label: "Business Bay", Icon: Briefcase },
    { value: "dubai-hills", label: "Dubai Hills", Icon: Mountains },
    { value: "jvc", label: "Jumeirah Village Circle", Icon: House },
    { value: "difc", label: "DIFC", Icon: Briefcase },
    { value: "creek-harbour", label: "Creek Harbour", Icon: Anchor },
    { value: "al-barsha", label: "Al Barsha", Icon: Storefront },
    { value: "meydan", label: "Meydan", Icon: Horse },
    { value: "sports-city", label: "Sports City", Icon: SoccerBall },
    { value: "silicon-oasis", label: "Silicon Oasis", Icon: Laptop },
];

// Mock properties for demo (Keeping the existing mock data)
const MOCK_PROPERTIES = [
    {
        id: "1",
        title: "Cozy Studio Stay in Meydan",
        pricePerNight: 291,
        images: [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
        ],
        guests: 2,
        bedrooms: 0,
        propertyType: "studio" as const,
        amenities: ["Pool", "Gym", "WiFi"],
        isNew: true,
        area: "Meydan",
    },
    {
        id: "2",
        title: "Modern 1BR with Balcony & City View",
        pricePerNight: 323,
        images: [
            "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
        ],
        guests: 2,
        bedrooms: 1,
        propertyType: "apartment" as const,
        amenities: ["Pool", "Parking", "WiFi", "Balcony"],
        isNew: true,
        area: "Business Bay",
    },
    {
        id: "3",
        title: "Elegant 1-Bedroom Apartment with Balcony",
        pricePerNight: 334,
        images: [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        ],
        guests: 2,
        bedrooms: 1,
        propertyType: "apartment" as const,
        amenities: ["Pool", "Gym", "Balcony"],
        isNew: true,
        area: "Downtown Dubai",
    },
    {
        id: "4",
        title: "Luxury 3BR+M with Dubai Eye View, JBR",
        pricePerNight: 1250,
        images: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
        ],
        guests: 8,
        bedrooms: 3,
        propertyType: "apartment" as const,
        amenities: ["Pool", "Beach Access", "Gym", "Parking"],
        isNew: true,
        area: "JBR",
    },
    {
        id: "5",
        title: "Chic Studio Escape in Dubai Sports City",
        pricePerNight: 275,
        images: [
            "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=2070&auto=format&fit=crop",
        ],
        guests: 2,
        bedrooms: 0,
        propertyType: "studio" as const,
        amenities: ["Pool", "Gym"],
        isNew: true,
        area: "Sports City",
    },
    {
        id: "6",
        title: "Chic 2-Bedroom with Dubai Skyline View",
        pricePerNight: 580,
        images: [
            "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
        ],
        guests: 4,
        bedrooms: 2,
        propertyType: "apartment" as const,
        amenities: ["Pool", "Balcony", "Parking"],
        isNew: true,
        area: "Dubai Marina",
    },
    {
        id: "7",
        title: "Stylish Studio with Dubai Skyline View",
        pricePerNight: 295,
        images: [
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=2070&auto=format&fit=crop",
        ],
        guests: 2,
        bedrooms: 0,
        propertyType: "studio" as const,
        amenities: ["Pool", "Gym", "WiFi"],
        isNew: true,
        area: "Business Bay",
    },
    {
        id: "8",
        title: "Stylish 2BR w/ City View in Sobha Creek",
        pricePerNight: 620,
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
        ],
        guests: 4,
        bedrooms: 2,
        propertyType: "apartment" as const,
        amenities: ["Pool", "Parking", "Balcony"],
        isNew: true,
        area: "Creek Harbour",
    },
    {
        id: "9",
        title: "Beautiful 4BR Villa with Private Pool",
        pricePerNight: 2100,
        images: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        ],
        guests: 10,
        bedrooms: 4,
        propertyType: "villa" as const,
        amenities: ["Pool", "Garden", "BBQ", "Parking", "Gym"],
        isNew: false,
        area: "Palm Jumeirah",
    },
    {
        id: "10",
        title: "Modern Penthouse with Panoramic Views",
        pricePerNight: 1850,
        images: [
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
        ],
        guests: 6,
        bedrooms: 3,
        propertyType: "penthouse" as const,
        amenities: ["Pool", "Gym", "Balcony", "Hot Tub"],
        isNew: false,
        area: "Dubai Marina",
    },
    {
        id: "11",
        title: "Cozy Townhouse in Jumeirah Village",
        pricePerNight: 750,
        images: [
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=2070&auto=format&fit=crop",
        ],
        guests: 6,
        bedrooms: 3,
        propertyType: "townhouse" as const,
        amenities: ["Pool", "Garden", "Parking", "Kitchen"],
        isNew: true,
        area: "JVC",
    },
    {
        id: "12",
        title: "Luxurious 2BR in DIFC",
        pricePerNight: 890,
        images: [
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop",
        ],
        guests: 4,
        bedrooms: 2,
        propertyType: "apartment" as const,
        amenities: ["Pool", "Gym", "Parking", "Workspace"],
        isNew: false,
        area: "DIFC",
    },
];

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Using Hero's translation namespace where appropriate or falling back to defaults
    // Since we don't know if 'Hero' namespace is available globally, we'll implement safe defaults using hardcoded strings for now to match the existing listing page style, 
    // but adopting the visual structure of Hero.
    const locale = useLocale();
    const dateLocale = locale === 'ar' ? ar : enUS;

    // State for filters
    const [area, setArea] = useState(searchParams.get("area") || "");
    const [checkInDate, setCheckInDate] = useState<Date | undefined>(
        searchParams.get("checkIn") ? new Date(searchParams.get("checkIn")!) : undefined
    );
    const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(
        searchParams.get("checkOut") ? new Date(searchParams.get("checkOut")!) : undefined
    );
    const [guests, setGuests] = useState(parseInt(searchParams.get("guests") || "1"));
    const [adults, setAdults] = useState(guests); // Simplified mapping
    const [children, setChildren] = useState(0); // Listing page doesn't usually track children separately in URL param 'guests' usually implies total

    const [propertyType, setPropertyType] = useState(searchParams.get("type") || "");
    const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
    const [priceRange, setPriceRange] = useState(searchParams.get("price") || "");
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        searchParams.get("amenities") ? searchParams.get("amenities")!.split(",") : []
    );

    // UI States for dropdowns
    const [showDestinations, setShowDestinations] = useState(false);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showCheckOut, setShowCheckOut] = useState(false);
    const [showGuests, setShowGuests] = useState(false);
    const [showType, setShowType] = useState(false);

    // Refs for click outside
    const destRef = useRef<HTMLDivElement>(null);
    const checkInRef = useRef<HTMLDivElement>(null);
    const checkOutRef = useRef<HTMLDivElement>(null);
    const guestsRef = useRef<HTMLDivElement>(null);
    const typeRef = useRef<HTMLDivElement>(null);

    const [showMap, setShowMap] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Filter Area Search - Initialize from URL param if area is set
    const initialAreaLabel = searchParams.get("area") 
        ? DUBAI_AREAS.find(a => a.value === searchParams.get("area"))?.label || searchParams.get("area") || ""
        : "";
    const [searchInput, setSearchInput] = useState(initialAreaLabel);
    const [filteredAreas, setFilteredAreas] = useState(DUBAI_AREAS);

    // General search query
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

    // Loading and pagination
    const [isLoading, setIsLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(8);

    // Use filtered properties hook
    const {
        properties: fetchedProperties,
        pagination,
        isLoading: propsLoading,
        isError
    } = useFilteredProperties({
        area: area !== "Any Area" ? area : undefined,
        propertyType,
        bedrooms,
        priceRange,
        guests: guests > 1 ? guests : undefined,
        sortBy: sortBy !== "featured" ? sortBy : undefined,
        search: searchQuery || undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        page: 1, // Start with page 1, can be extended for pagination
        limit: 50 // Load more properties for better UX
    });

    const [properties, setProperties] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    // Handle Click Outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (destRef.current && !destRef.current.contains(event.target as Node)) setShowDestinations(false);
            if (checkInRef.current && !checkInRef.current.contains(event.target as Node)) setShowCheckIn(false);
            if (checkOutRef.current && !checkOutRef.current.contains(event.target as Node)) setShowCheckOut(false);
            if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) setShowGuests(false);
            if (typeRef.current && !typeRef.current.contains(event.target as Node)) setShowType(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter destinations based on input
    useEffect(() => {
        if (searchInput) {
            const filtered = DUBAI_AREAS.filter(a =>
                a.label.toLowerCase().includes(searchInput.toLowerCase())
            );
            setFilteredAreas(filtered);
        } else {
            setFilteredAreas(DUBAI_AREAS);
        }
    }, [searchInput]);

    // Update searchInput display when area is selected
    useEffect(() => {
        if (area) {
            const areaLabel = DUBAI_AREAS.find(a => a.value === area)?.label;
            if (areaLabel) {
                setSearchInput(areaLabel);
            }
        }
    }, [area]);

    // Auto-update URL when filters change (debounced)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        // Clear any pending timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        // Debounce the URL update to avoid too many navigations
        searchTimeoutRef.current = setTimeout(() => {
            updateURL();
        }, 300);
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [area, checkInDate, checkOutDate, guests, propertyType, updateURL]);

    // Format date for display
    const formatDateDisplay = (date: Date | undefined) => {
        if (!date) return null;
        return format(date, "MMM dd", { locale: dateLocale });
    };

    const today = new Date();

    // Update properties from filtered hook
    useEffect(() => {
        if (propsLoading) return;
        if (isError) {
            // Fallback to mock data in development if API fails
            if (process.env.NODE_ENV !== 'production') {
                setProperties(MOCK_PROPERTIES);
                setTotalCount(MOCK_PROPERTIES.length);
            }
            return;
        }

        const normalized = Array.isArray(fetchedProperties)
            ? fetchedProperties.map((p: any) => ({
                ...p,
                id: p.id || p._id || (p._id && p._id.toString && p._id.toString()) || p.slug || (p.slug && p.slug.toString && p.slug.toString()),
            }))
            : [];

        setProperties(normalized);
        setTotalCount(pagination?.totalCount || normalized.length);
    }, [fetchedProperties, propsLoading, isError, pagination]);

    // Update URL with filters
    const updateURL = useCallback(() => {
        const params = new URLSearchParams();
        if (area && area !== "Any Area") params.set("area", area);
        if (checkInDate) params.set("checkIn", format(checkInDate, 'yyyy-MM-dd'));
        if (checkOutDate) params.set("checkOut", format(checkOutDate, 'yyyy-MM-dd'));
        if (guests > 1) params.set("guests", guests.toString());
        if (propertyType) params.set("type", propertyType);
        if (bedrooms) params.set("bedrooms", bedrooms);
        if (priceRange) params.set("price", priceRange);
        if (sortBy && sortBy !== "featured") params.set("sort", sortBy);
        if (searchQuery) params.set("search", searchQuery);
        if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(","));

        const queryString = params.toString();
        router.push(`/listings${queryString ? `?${queryString}` : ""}`, { scroll: false });
    }, [area, checkInDate, checkOutDate, guests, propertyType, bedrooms, priceRange, sortBy, searchQuery, selectedAmenities, router]);

    const handleSearch = () => {
        setIsLoading(true);
        updateURL();
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    };

    const handleLoadMore = () => {
        setVisibleCount((prev) => Math.min(prev + 4, totalCount));
    };

    const clearFilters = () => {
        setArea("");
        setCheckInDate(undefined);
        setCheckOutDate(undefined);
        setGuests(1);
        setAdults(1);
        setChildren(0);
        setPropertyType("");
        setBedrooms("");
        setPriceRange("");
        setSelectedAmenities([]);
        setSortBy("featured");
        router.push("/listings", { scroll: false });
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const activeFiltersCount =
        (bedrooms ? 1 : 0) +
        (priceRange ? 1 : 0) +
        selectedAmenities.length;

    // Custom Calendar Styles
    const css = `
    .rdp {
    --rdp-cell-size: 40px;
    --rdp-accent-color: #F5A623;
    --rdp-background-color: #FFF8EB;
    margin: 0;
    }
        .rdp-day {
    color: #1C1C1C;
    }
        .rdp-caption_label {
    color: #1C1C1C;
    font-weight: bold;
    }
        .rdp-head_cell {
    color: #7E7E7E;
    font-weight: 500;
    }
        .rdp-nav_button {
    color: #1C1C1C;
    }
        .rdp-day_selected:not([disabled]), .rdp-day_selected:focus:not([disabled]), .rdp-day_selected:active:not([disabled]), .rdp-day_selected:hover:not([disabled]) {
    background-color: var(--rdp-accent-color);
    color: white;
    font-weight: bold;
    }
        .rdp-day_today {
    font-weight: bold;
    color: #F5A623;
    }
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: #FFF8EB;
    color: #F5A623;
    }
        .rdp-day_disabled {
    opacity: 0.25;
    }
    `;

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
            <Navbar hideSearchBar />
            <style>{css}</style>

            {/* Search Header - Modern Design */}
            <section className="relative md:sticky md:top-0 z-40 bg-gradient-to-b from-white to-gray-50/80 border-b border-gray-100/80 pt-20">
                {/* Main Search Bar - Modern Pill Design */}
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px] py-4 md:py-6">
                    {/* Desktop Search Bar */}
                    <div className="hidden lg:flex bg-white rounded-full py-1.5 px-1.5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1),0_2px_8px_-2px_rgba(0,0,0,0.06)] items-center max-w-5xl mx-auto border border-gray-200/60 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.08)] transition-shadow duration-300">

                        {/* 1. Destination */}
                        <div ref={destRef} className="relative flex-1">
                            <div
                                className={`py-3 px-5 rounded-full transition-all duration-200 cursor-pointer ${showDestinations ? 'bg-gray-100 shadow-inner' : 'hover:bg-gray-50'}`}
                                onClick={() => {
                                    setShowDestinations(!showDestinations);
                                    setShowCheckIn(false);
                                    setShowCheckOut(false);
                                    setShowGuests(false);
                                    setShowType(false);
                                }}
                            >
                                <div className="text-[11px] font-bold text-gray-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                    <MapPin weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    Where
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Search destinations"
                                        value={searchInput}
                                        onChange={(e) => {
                                            setSearchInput(e.target.value);
                                            // Clear area if user is typing something different
                                            if (area) {
                                                const currentAreaLabel = DUBAI_AREAS.find(a => a.value === area)?.label || "";
                                                if (e.target.value !== currentAreaLabel) {
                                                    setArea("");
                                                }
                                            }
                                            setShowDestinations(true);
                                        }}
                                        onFocus={() => setShowDestinations(true)}
                                        className="w-full bg-transparent border-none text-sm text-gray-900 font-medium outline-none placeholder:text-gray-400 p-0"
                                    />
                                    {(searchInput || area) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setArea("");
                                                setSearchInput("");
                                            }}
                                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                        >
                                            <X weight="bold" className="w-3.5 h-3.5 text-gray-400" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Destination Dropdown */}
                            {showDestinations && (
                                <div className="absolute top-full left-0 mt-3 w-[360px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 border-b border-gray-100">
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">Popular Destinations</div>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto p-2">
                                        {filteredAreas.length > 0 ? (
                                            filteredAreas.map((item) => {
                                                const IconComponent = item.Icon;
                                                const isSelected = area === item.value;
                                                return (
                                                    <button
                                                        key={item.value}
                                                        className={`w-full px-3 py-3 text-left rounded-xl flex items-center gap-3 transition-all ${isSelected ? 'bg-[#F5A623]/10' : 'hover:bg-gray-50'}`}
                                                        onClick={() => {
                                                            setArea(item.value);
                                                            setSearchInput(item.label);
                                                            setShowDestinations(false);
                                                        }}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-[#F5A623] shadow-md' : 'bg-gradient-to-br from-gray-100 to-gray-50'}`}>
                                                            <IconComponent weight="duotone" className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#F5A623]'}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className={`text-sm font-medium ${isSelected ? 'text-[#E09000]' : 'text-gray-900'}`}>{item.label}</span>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="w-5 h-5 rounded-full bg-[#F5A623] flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="px-4 py-8 text-center">
                                                <MapPin weight="duotone" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                <p className="text-gray-400 text-sm">No destinations found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-10 bg-gray-200/80" />

                        {/* 2. Check In */}
                        <div ref={checkInRef} className="relative flex-[0.9]">
                            <div
                                className={`py-3 px-5 rounded-full transition-all duration-200 cursor-pointer ${showCheckIn ? 'bg-gray-100 shadow-inner' : 'hover:bg-gray-50'}`}
                                onClick={() => {
                                    setShowCheckIn(!showCheckIn);
                                    setShowDestinations(false);
                                    setShowCheckOut(false);
                                    setShowGuests(false);
                                    setShowType(false);
                                }}
                            >
                                <div className="text-[11px] font-bold text-gray-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                    <CalendarBlank weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    Check In
                                </div>
                                <div className={`text-sm font-medium ${checkInDate ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {formatDateDisplay(checkInDate) || "Add dates"}
                                </div>
                            </div>

                            {showCheckIn && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <DayPicker
                                        mode="single"
                                        selected={checkInDate}
                                        onSelect={(date) => {
                                            setCheckInDate(date);
                                            if (date && (!checkOutDate || date >= checkOutDate)) {
                                                const nextDay = addDays(date, 1);
                                                setCheckOutDate(nextDay);
                                                setShowCheckIn(false);
                                                setShowCheckOut(true);
                                            } else if (date) {
                                                setShowCheckIn(false);
                                                setShowCheckOut(true);
                                            }
                                        }}
                                        disabled={[{ before: today }]}
                                        showOutsideDays
                                        locale={dateLocale}
                                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="w-px h-10 bg-gray-200/80" />

                        {/* 3. Check Out */}
                        <div ref={checkOutRef} className="relative flex-[0.9]">
                            <div
                                className={`py-3 px-5 rounded-full transition-all duration-200 cursor-pointer ${showCheckOut ? 'bg-gray-100 shadow-inner' : 'hover:bg-gray-50'}`}
                                onClick={() => {
                                    setShowCheckOut(!showCheckOut);
                                    setShowDestinations(false);
                                    setShowCheckIn(false);
                                    setShowGuests(false);
                                    setShowType(false);
                                }}
                            >
                                <div className="text-[11px] font-bold text-gray-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                    <CalendarBlank weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    Check Out
                                </div>
                                <div className={`text-sm font-medium ${checkOutDate ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {formatDateDisplay(checkOutDate) || "Add dates"}
                                </div>
                            </div>

                            {showCheckOut && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <DayPicker
                                        mode="single"
                                        selected={checkOutDate}
                                        onSelect={(date) => {
                                            setCheckOutDate(date);
                                            if (date) setShowCheckOut(false);
                                        }}
                                        disabled={[
                                            { before: checkInDate ? addDays(checkInDate, 1) : addDays(today, 1) }
                                        ]}
                                        showOutsideDays
                                        locale={dateLocale}
                                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="w-px h-10 bg-gray-200/80" />

                        {/* 4. Guests */}
                        <div ref={guestsRef} className="relative flex-[0.7]">
                            <div
                                className={`py-3 px-5 rounded-full transition-all duration-200 cursor-pointer ${showGuests ? 'bg-gray-100 shadow-inner' : 'hover:bg-gray-50'}`}
                                onClick={() => {
                                    setShowGuests(!showGuests);
                                    setShowDestinations(false);
                                    setShowCheckIn(false);
                                    setShowCheckOut(false);
                                    setShowType(false);
                                }}
                            >
                                <div className="text-[11px] font-bold text-gray-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                    <UsersThree weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    Guests
                                </div>
                                <div className={`text-sm font-medium truncate ${guests > 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {guests > 1 ? `${guests} guests` : "Add guests"}
                                </div>
                            </div>

                            {showGuests && (
                                <div className="absolute top-full right-0 mt-3 w-[320px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border border-gray-100 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Adults */}
                                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">Adults</div>
                                            <div className="text-xs text-gray-400 mt-0.5">Ages 13 or above</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    const newVal = Math.max(1, adults - 1);
                                                    setAdults(newVal);
                                                    setGuests(newVal + children);
                                                }}
                                                disabled={adults <= 1}
                                                className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Minus weight="bold" className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-8 text-center font-semibold text-gray-900 text-lg">{adults}</span>
                                            <button
                                                onClick={() => {
                                                    const newVal = Math.min(10, adults + 1);
                                                    setAdults(newVal);
                                                    setGuests(newVal + children);
                                                }}
                                                disabled={adults >= 10}
                                                className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Plus weight="bold" className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Children */}
                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">Children</div>
                                            <div className="text-xs text-gray-400 mt-0.5">Ages 2–12</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    const newVal = Math.max(0, children - 1);
                                                    setChildren(newVal);
                                                    setGuests(adults + newVal);
                                                }}
                                                disabled={children <= 0}
                                                className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Minus weight="bold" className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-8 text-center font-semibold text-gray-900 text-lg">{children}</span>
                                            <button
                                                onClick={() => {
                                                    const newVal = Math.min(10, children + 1);
                                                    setChildren(newVal);
                                                    setGuests(adults + newVal);
                                                }}
                                                disabled={children >= 10}
                                                className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Plus weight="bold" className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowGuests(false)}
                                        className="w-full mt-4 px-4 py-2.5 bg-[#F5A623] text-white rounded-xl text-sm font-semibold hover:bg-[#E09000] transition-all shadow-sm hover:shadow-md"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-10 bg-gray-200/80" />

                        {/* 5. Property Type */}
                        <div ref={typeRef} className="relative flex-[0.7]">
                            <div
                                className={`py-3 px-5 rounded-full transition-all duration-200 cursor-pointer ${showType ? 'bg-gray-100 shadow-inner' : 'hover:bg-gray-50'}`}
                                onClick={() => {
                                    setShowType(!showType);
                                    setShowDestinations(false);
                                    setShowCheckIn(false);
                                    setShowCheckOut(false);
                                    setShowGuests(false);
                                }}
                            >
                                <div className="text-[11px] font-bold text-gray-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                    <House weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    Type
                                </div>
                                <div className={`text-sm font-medium truncate ${propertyType ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {PROPERTY_TYPES.find(t => t.value === propertyType)?.label || "Any type"}
                                </div>
                            </div>

                            {showType && (
                                <div className="absolute top-full right-0 mt-3 w-[240px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {PROPERTY_TYPES.map((type) => (
                                        <button
                                            key={type.value}
                                            className={`w-full px-4 py-3 text-left text-sm font-medium border-b border-gray-50 last:border-b-0 transition-colors ${propertyType === type.value ? 'bg-[#F5A623]/10 text-[#F5A623]' : 'hover:bg-gray-50 text-gray-900'}`}
                                            onClick={() => {
                                                setPropertyType(type.value);
                                                setShowType(false);
                                            }}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            className="bg-gradient-to-r from-[#F5A623] to-[#E09000] hover:from-[#E09000] hover:to-[#D08000] text-white rounded-full h-12 w-12 flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ml-1"
                        >
                            <MagnifyingGlass weight="bold" className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="lg:hidden">
                        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] border border-gray-200/60 p-4 space-y-3">
                            {/* Location */}
                            <div className="relative" ref={destRef}>
                                <div
                                    onClick={() => {
                                        setShowDestinations(!showDestinations);
                                        setShowCheckIn(false);
                                        setShowCheckOut(false);
                                        setShowGuests(false);
                                    }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin weight="fill" className="w-5 h-5 text-[#F5A623]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Where</div>
                                        <div className={`text-sm font-medium truncate ${searchInput || area ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {searchInput || (area ? DUBAI_AREAS.find(a => a.value === area)?.label : "Search destinations")}
                                        </div>
                                    </div>
                                    {(searchInput || area) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setArea("");
                                                setSearchInput("");
                                            }}
                                            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                                        >
                                            <X weight="bold" className="w-4 h-4 text-gray-400" />
                                        </button>
                                    )}
                                </div>
                                {/* Mobile Destination Dropdown */}
                                {showDestinations && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-[250px] overflow-y-auto">
                                        {filteredAreas.map((item) => {
                                            const IconComponent = item.Icon;
                                            return (
                                                <button
                                                    key={item.value}
                                                    className="w-full px-4 py-3 text-left hover:bg-[#F5A623]/5 flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                                                    onClick={() => {
                                                        setArea(item.value);
                                                        setSearchInput(item.label);
                                                        setShowDestinations(false);
                                                    }}
                                                >
                                                    <IconComponent weight="duotone" className="w-5 h-5 text-[#F5A623]" />
                                                    <span className="text-sm text-gray-900 font-medium">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Dates Row */}
                            <div className="grid grid-cols-2 gap-2">
                                <div
                                    ref={checkInRef}
                                    onClick={() => {
                                        setShowCheckIn(!showCheckIn);
                                        setShowDestinations(false);
                                        setShowCheckOut(false);
                                        setShowGuests(false);
                                    }}
                                    className="relative flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <CalendarBlank weight="fill" className="w-5 h-5 text-[#F5A623]" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Check In</div>
                                        <div className={`text-sm font-medium truncate ${checkInDate ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {formatDateDisplay(checkInDate) || "Add date"}
                                        </div>
                                    </div>
                                    {showCheckIn && (
                                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-50">
                                            <DayPicker
                                                mode="single"
                                                selected={checkInDate}
                                                onSelect={(date) => {
                                                    setCheckInDate(date);
                                                    if (date && (!checkOutDate || date >= checkOutDate)) {
                                                        const nextDay = addDays(date, 1);
                                                        setCheckOutDate(nextDay);
                                                        setShowCheckIn(false);
                                                        setShowCheckOut(true);
                                                    } else if (date) {
                                                        setShowCheckIn(false);
                                                        setShowCheckOut(true);
                                                    }
                                                }}
                                                disabled={[{ before: today }]}
                                                showOutsideDays
                                                locale={dateLocale}
                                                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div
                                    ref={checkOutRef}
                                    onClick={() => {
                                        setShowCheckOut(!showCheckOut);
                                        setShowDestinations(false);
                                        setShowCheckIn(false);
                                        setShowGuests(false);
                                    }}
                                    className="relative flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <CalendarBlank weight="fill" className="w-5 h-5 text-[#F5A623]" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Check Out</div>
                                        <div className={`text-sm font-medium truncate ${checkOutDate ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {formatDateDisplay(checkOutDate) || "Add date"}
                                        </div>
                                    </div>
                                    {showCheckOut && (
                                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-50">
                                            <DayPicker
                                                mode="single"
                                                selected={checkOutDate}
                                                onSelect={(date) => {
                                                    setCheckOutDate(date);
                                                    if (date) setShowCheckOut(false);
                                                }}
                                                disabled={[
                                                    { before: checkInDate ? addDays(checkInDate, 1) : addDays(today, 1) }
                                                ]}
                                                showOutsideDays
                                                locale={dateLocale}
                                                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Guests & Type Row */}
                            <div className="grid grid-cols-2 gap-2">
                                <div
                                    ref={guestsRef}
                                    onClick={() => {
                                        setShowGuests(!showGuests);
                                        setShowDestinations(false);
                                        setShowCheckIn(false);
                                        setShowCheckOut(false);
                                    }}
                                    className="relative flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <UsersThree weight="fill" className="w-5 h-5 text-[#F5A623]" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Guests</div>
                                        <div className={`text-sm font-medium truncate ${guests > 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {guests > 1 ? `${guests} guests` : "Add guests"}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    ref={typeRef}
                                    onClick={() => {
                                        setShowType(!showType);
                                        setShowDestinations(false);
                                        setShowCheckIn(false);
                                        setShowCheckOut(false);
                                        setShowGuests(false);
                                    }}
                                    className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <House weight="fill" className="w-5 h-5 text-[#F5A623]" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Type</div>
                                        <div className={`text-sm font-medium truncate ${propertyType ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {PROPERTY_TYPES.find(t => t.value === propertyType)?.label || "Any type"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Search Button */}
                            <button
                                onClick={handleSearch}
                                className="w-full py-3.5 bg-gradient-to-r from-[#F5A623] to-[#E09000] hover:from-[#E09000] hover:to-[#D08000] text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                            >
                                <MagnifyingGlass weight="bold" className="w-5 h-5" />
                                Search Properties
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px] py-3 border-t border-gray-100/80 bg-white/50 backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Bedrooms */}
                            <select
                                value={bedrooms}
                                onChange={(e) => {
                                    setBedrooms(e.target.value);
                                    handleSearch();
                                }}
                                className="px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-full bg-white text-gray-900 text-xs md:text-sm outline-none hover:border-[#F5A623] focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 transition-all cursor-pointer"
                            >
                                {BEDROOM_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Price */}
                            <select
                                value={priceRange}
                                onChange={(e) => {
                                    setPriceRange(e.target.value);
                                    handleSearch();
                                }}
                                className="px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-full bg-white text-gray-900 text-xs md:text-sm outline-none hover:border-[#F5A623] focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 transition-all cursor-pointer"
                            >
                                {PRICE_RANGES.map((range) => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>

                            {/* Search Input - Hidden on mobile */}
                            <div className="relative hidden md:block flex-1 max-w-xs">
                                <MagnifyingGlass weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search properties..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2 md:py-2.5 border border-gray-200 rounded-full bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            handleSearch();
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X weight="bold" className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                )}
                            </div>

                            {/* More Filters */}
                            <button
                                onClick={() => setShowFiltersModal(true)}
                                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 border rounded-full text-xs md:text-sm font-medium transition-all ${activeFiltersCount > 0
                                    ? "border-[#F5A623] bg-[#F5A623]/10 text-[#E09000]"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-[#F5A623] hover:bg-[#F5A623]/5"
                                    }`}
                            >
                                <FunnelSimple weight="bold" className="w-4 h-4" />
                                <span className="hidden sm:inline">Filters</span>
                                {activeFiltersCount > 0 && (
                                    <span className="w-5 h-5 bg-[#F5A623] text-white text-xs rounded-full flex items-center justify-center font-semibold">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* Clear Filters */}
                            {(area || propertyType || bedrooms || priceRange || selectedAmenities.length > 0) && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 px-2.5 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-gray-500 hover:text-[#F5A623] transition-colors rounded-full hover:bg-[#F5A623]/5"
                                >
                                    <X weight="bold" className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Clear</span>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 md:gap-3">
                            {/* Map Toggle */}
                            <button
                                onClick={() => setShowMap(!showMap)}
                                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 border rounded-full text-xs md:text-sm font-medium transition-all ${showMap
                                    ? "border-[#F5A623] bg-[#F5A623] text-white shadow-md"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-[#F5A623] hover:bg-[#F5A623]/5"
                                    }`}
                            >
                                {showMap ? <SquaresFour weight="bold" className="w-4 h-4" /> : <MapTrifold weight="fill" className="w-4 h-4" />}
                                <span className="hidden sm:inline">{showMap ? "Grid" : "Map"}</span>
                            </button>

                            {/* Sort */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-full bg-white text-gray-700 text-xs md:text-sm font-medium hover:border-[#F5A623] transition-all"
                                >
                                    <span className="hidden sm:inline">Sort:</span>
                                    <span className="text-gray-900">{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                                    <CaretDown weight="bold" className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showSortDropdown && (
                                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-50 min-w-[180px] overflow-hidden">
                                        {SORT_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${sortBy === option.value
                                                    ? "bg-[#F5A623]/10 text-[#E09000]"
                                                    : "hover:bg-gray-50 text-gray-700"
                                                    }`}
                                                onClick={() => {
                                                    setSortBy(option.value);
                                                    setShowSortDropdown(false);
                                                    handleSearch();
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50/50">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px] py-6 md:py-8">
                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <p className="text-sm md:text-base text-gray-500 font-medium">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <SpinnerGap weight="bold" className="w-4 h-4 animate-spin text-[#F5A623]" />
                                    Searching...
                                </span>
                            ) : (
                                <>
                                    <span className="text-gray-900 font-semibold">{totalCount}</span> properties found
                                </>
                            )}
                        </p>
                    </div>

                    {/* Property Grid / Map View */}
                    {showMap ? (
                        <div className="relative w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#8ECAE6] to-[#E8E5DB] flex items-center justify-center shadow-sm">
                            <div className="text-center px-4">
                                <MapTrifold weight="duotone" className="w-12 md:w-16 h-12 md:h-16 text-[#F5A623] mx-auto mb-4" />
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Map View</h3>
                                <p className="text-gray-500 text-sm md:text-base">
                                    Interactive map coming soon. Configure your Google Maps API key to enable.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {(() => {
                                const safeProperties = Array.isArray(properties) ? properties : [];
                                return safeProperties.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                                        {safeProperties.slice(0, visibleCount).map((property) => (
                                            <PropertyCard
                                                key={property.id}
                                                id={property.id}
                                                slug={property.slug}
                                                title={property.title}
                                                images={property.images}
                                                guests={property.guests}
                                                bedrooms={property.bedrooms}
                                                propertyType={property.propertyType}
                                                amenities={property.amenities}
                                                isNew={property.isNew}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 md:py-16">
                                        <MapPin weight="duotone" className="w-12 md:w-16 h-12 md:h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                                            No Properties Found
                                        </h3>
                                        <p className="text-gray-500 mb-6 text-sm md:text-base">
                                            Try adjusting your filters or search criteria.
                                        </p>
                                        <button
                                            onClick={clearFilters}
                                            className="inline-block px-6 py-3 bg-gradient-to-r from-[#F5A623] to-[#E09000] hover:from-[#E09000] hover:to-[#D08000] text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-sm md:text-base"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                );
                            })()}

                            {/* Load More */}
                            {visibleCount < totalCount && (
                                <div className="mt-8 md:mt-10 text-center">
                                    <button
                                        onClick={handleLoadMore}
                                        className="px-6 md:px-8 py-3 border-2 border-[#F5A623] rounded-full text-[#F5A623] font-semibold hover:bg-[#F5A623] hover:text-white transition-all duration-300 text-sm md:text-base"
                                    >
                                        Load More ({totalCount - visibleCount} remaining)
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* More Filters Modal */}
            {showFiltersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowFiltersModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden mx-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                            <button
                                onClick={() => setShowFiltersModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X weight="bold" className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                            {/* Price Range */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Price Range</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRICE_RANGES.slice(1).map((range) => (
                                        <button
                                            key={range.value}
                                            onClick={() => setPriceRange(range.value)}
                                            className={`px-4 py-3 border rounded-xl text-sm font-medium transition-all ${priceRange === range.value
                                                ? "border-[#F5A623] bg-[#F5A623]/10 text-[#E09000]"
                                                : "border-gray-200 text-gray-700 hover:border-[#F5A623]"
                                                }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Property Type */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Property Type</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {PROPERTY_TYPES.slice(1).map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => setPropertyType(type.value)}
                                            className={`px-3 py-3 border rounded-xl text-xs font-medium transition-all ${propertyType === type.value
                                                ? "border-[#F5A623] bg-[#F5A623]/10 text-[#E09000]"
                                                : "border-gray-200 text-gray-700 hover:border-[#F5A623]"
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bedrooms */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Bedrooms</h3>
                                <div className="flex flex-wrap gap-2">
                                    {BEDROOM_OPTIONS.slice(1).map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setBedrooms(option.value)}
                                            className={`px-4 py-2 border rounded-full text-sm font-medium transition-all ${bedrooms === option.value
                                                ? "border-[#F5A623] bg-[#F5A623] text-white shadow-md"
                                                : "border-gray-200 text-gray-700 hover:border-[#F5A623]"
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Amenities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {AMENITIES.map((amenity) => (
                                        <button
                                            key={amenity}
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`px-4 py-2 border rounded-full text-sm font-medium transition-all ${selectedAmenities.includes(amenity)
                                                ? "border-[#F5A623] bg-[#F5A623] text-white shadow-md"
                                                : "border-gray-200 text-gray-700 hover:border-[#F5A623]"
                                                }`}
                                        >
                                            {amenity}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 flex items-center justify-between gap-3">
                            <button
                                onClick={() => {
                                    setPropertyType("");
                                    setBedrooms("");
                                    setPriceRange("");
                                    setSelectedAmenities([]);
                                }}
                                className="text-gray-500 hover:text-gray-900 font-medium transition-colors text-sm"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => {
                                    setShowFiltersModal(false);
                                    handleSearch();
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-[#F5A623] to-[#E09000] hover:from-[#E09000] hover:to-[#D08000] text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-sm"
                            >
                                Show {totalCount} Properties
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default function ListingsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <SpinnerGap weight="bold" className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}
