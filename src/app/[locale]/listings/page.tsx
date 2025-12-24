"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useProperties } from "@/lib/hooks/useProperties";
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
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

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

    // Filter Area Search
    const [searchInput, setSearchInput] = useState("");
    const [filteredAreas, setFilteredAreas] = useState(DUBAI_AREAS);

    // Loading and pagination
    const [isLoading, setIsLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(8);
    const { properties: fetchedProperties, isLoading: propsLoading, isError } = useProperties();
    const [properties, setProperties] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(MOCK_PROPERTIES.length);

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
            const filtered = DUBAI_AREAS.filter(area =>
                area.label.toLowerCase().includes(searchInput.toLowerCase())
            );
            setFilteredAreas(filtered);
        } else {
            setFilteredAreas(DUBAI_AREAS);
        }
    }, [searchInput]);

    // Format date for display
    const formatDateDisplay = (date: Date | undefined) => {
        if (!date) return null;
        return format(date, "MMM dd", { locale: dateLocale });
    };

    const today = new Date();

    // Filter properties based on current filters
    const filterProperties = useCallback(() => {
        let filtered = [...MOCK_PROPERTIES];

        // Filter by area
        if (area && area !== "Any Area") {
            // Check if area matches value or label
            filtered = filtered.filter((p) =>
                p.area.toLowerCase().includes(area.toLowerCase()) ||
                DUBAI_AREAS.find(a => a.value === area)?.label.toLowerCase().includes(p.area.toLowerCase())
            );
        }

        // Filter by property type
        if (propertyType) {
            filtered = filtered.filter((p) => p.propertyType === propertyType);
        }

        // Filter by bedrooms
        if (bedrooms) {
            const bedroomNum = parseInt(bedrooms);
            if (bedroomNum === 4) {
                filtered = filtered.filter((p) => p.bedrooms >= 4);
            } else {
                filtered = filtered.filter((p) => p.bedrooms === bedroomNum);
            }
        }

        // Filter by price range
        if (priceRange) {
            const [min, max] = priceRange.split("-").map(Number);
            filtered = filtered.filter(
                (p) => p.pricePerNight >= min && p.pricePerNight <= max
            );
        }

        // Filter by amenities
        if (selectedAmenities.length > 0) {
            filtered = filtered.filter((p) =>
                selectedAmenities.every((amenity) =>
                    p.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
                )
            );
        }

        // Filter by guests
        if (guests) {
            filtered = filtered.filter((p) => p.guests >= guests);
        }

        // Sort
        switch (sortBy) {
            case "price-asc":
                filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
                break;
            case "price-desc":
                filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
                break;
            case "newest":
                filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
                break;
            case "rating":
                // For demo, just shuffle
                break;
            default:
                // featured - no additional sorting
                break;
        }

        setProperties(filtered);
        setTotalCount(filtered.length);
    }, [area, propertyType, bedrooms, priceRange, selectedAmenities, guests, sortBy]);

    useEffect(() => {
        filterProperties();
    }, [filterProperties]);

    // Update properties from SWR hook
    useEffect(() => {
        if (propsLoading) return;
        if (isError) {
            if (process.env.NODE_ENV !== 'production') {
                setProperties(MOCK_PROPERTIES);
                setTotalCount(MOCK_PROPERTIES.length);
            }
            return;
        }

        const normalized = (fetchedProperties || []).map((p: any) => ({
            ...p,
            id: p.id || p._id || (p._id && p._id.toString && p._id.toString()) || p.slug || (p.slug && p.slug.toString && p.slug.toString()),
        }));

        setProperties(normalized);
        setTotalCount(normalized.length || 0);
    }, [fetchedProperties, propsLoading, isError]);

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

        const queryString = params.toString();
        router.push(`/listings${queryString ? `?${queryString}` : ""}`, { scroll: false });
    }, [area, checkInDate, checkOutDate, guests, propertyType, bedrooms, priceRange, sortBy, router]);

    const handleSearch = () => {
        setIsLoading(true);
        updateURL();
        setTimeout(() => {
            filterProperties();
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
            <Navbar />
            <style>{css}</style>

            {/* Search Header */}
            <section className="relative md:sticky md:top-0 z-40 bg-white border-b border-gray-100 shadow-sm pt-20">
                {/* Main Search Bar (Pill Design) */}
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px] py-6">
                    <div className="bg-white rounded-[60px] py-2 px-2 shadow-[0px_6px_22px_0px_rgba(139,80,17,0.17)] flex items-center max-w-6xl mx-auto border border-gray-100">

                        {/* 1. Destination */}
                        <div ref={destRef} className="relative flex-1 min-w-[180px]">
                            <div
                                className={`py-2 px-6 rounded-full transition-colors cursor-pointer ${showDestinations ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
                                onClick={() => {
                                    setShowDestinations(!showDestinations);
                                    setShowCheckIn(false);
                                    setShowCheckOut(false);
                                    setShowGuests(false);
                                    setShowType(false);
                                }}
                            >
                                <div className="text-xs font-semibold text-neutral-800 mb-0.5 flex items-center gap-1.5">
                                    <MapPin weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    Where
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Search destinations"
                                        value={searchInput || (area ? DUBAI_AREAS.find(a => a.value === area)?.label : "")}
                                        onChange={(e) => {
                                            setSearchInput(e.target.value);
                                            setShowDestinations(true);
                                        }}
                                        onFocus={() => setShowDestinations(true)}
                                        className="w-full bg-transparent border-none text-sm text-neutral-600 font-medium outline-none placeholder:text-neutral-400 p-0"
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
                                <div className="absolute top-full left-0 mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="max-h-[320px] overflow-y-auto">
                                        {filteredAreas.length > 0 ? (
                                            filteredAreas.map((item) => {
                                                const IconComponent = item.Icon;
                                                return (
                                                    <button
                                                        key={item.value}
                                                        className="w-full px-4 py-3.5 text-left hover:bg-[#F5A623]/5 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-b-0"
                                                        onClick={() => {
                                                            setArea(item.value);
                                                            setSearchInput("");
                                                            setShowDestinations(false);
                                                        }}
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623]/20 to-[#F5A623]/5 flex items-center justify-center">
                                                            <IconComponent weight="duotone" className="w-5 h-5 text-[#F5A623]" />
                                                        </div>
                                                        <span className="text-sm text-[#1C1C1C] font-medium">{item.label}</span>
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

                        <div className="w-px h-8 bg-neutral-200" />

                        {/* 2. Check In */}
                        <div ref={checkInRef} className="relative flex-1">
                            <div
                                className={`py-2 px-6 rounded-full transition-colors cursor-pointer ${showCheckIn ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
                                onClick={() => {
                                    setShowCheckIn(!showCheckIn);
                                    setShowDestinations(false);
                                    setShowCheckOut(false);
                                    setShowGuests(false);
                                    setShowType(false);
                                }}
                            >
                                <div className="text-xs font-semibold text-neutral-800 mb-0.5 flex items-center gap-1.5">
                                    <CalendarBlank weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    Check In
                                </div>
                                <div className={`text-sm font-medium ${checkInDate ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                    {formatDateDisplay(checkInDate) || "Add Dates"}
                                </div>
                            </div>

                            {showCheckIn && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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

                        <div className="w-px h-8 bg-neutral-200" />

                        {/* 3. Check Out */}
                        <div ref={checkOutRef} className="relative flex-1">
                            <div
                                className={`py-2 px-6 rounded-full transition-colors cursor-pointer ${showCheckOut ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
                                onClick={() => {
                                    setShowCheckOut(!showCheckOut);
                                    setShowDestinations(false);
                                    setShowCheckIn(false);
                                    setShowGuests(false);
                                    setShowType(false);
                                }}
                            >
                                <div className="text-xs font-semibold text-neutral-800 mb-0.5 flex items-center gap-1.5">
                                    <CalendarBlank weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    Check Out
                                </div>
                                <div className={`text-sm font-medium ${checkOutDate ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                    {formatDateDisplay(checkOutDate) || "Add Dates"}
                                </div>
                            </div>

                            {showCheckOut && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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

                        <div className="w-px h-8 bg-neutral-200" />

                        {/* 4. Guests */}
                        <div ref={guestsRef} className="relative flex-[0.8]">
                            <div
                                className={`py-2 px-6 rounded-full transition-colors cursor-pointer ${showGuests ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
                                onClick={() => {
                                    setShowGuests(!showGuests);
                                    setShowDestinations(false);
                                    setShowCheckIn(false);
                                    setShowCheckOut(false);
                                    setShowType(false);
                                }}
                            >
                                <div className="text-xs font-semibold text-neutral-800 mb-0.5 flex items-center gap-1.5">
                                    <UsersThree weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    Who
                                </div>
                                <div className={`text-sm font-medium truncate ${guests > 1 ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                    {guests > 1 ? `${guests} Guests` : "Add Guests"}
                                </div>
                            </div>

                            {showGuests && (
                                <div className="absolute top-full right-0 mt-2 w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Adults */}
                                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                                        <div>
                                            <div className="text-sm font-semibold text-[#1C1C1C]">Adults</div>
                                            <div className="text-xs text-gray-400 mt-0.5">Ages 13 or above</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => {
                                                    const newVal = Math.max(1, adults - 1);
                                                    setAdults(newVal);
                                                    setGuests(newVal + children);
                                                }}
                                                disabled={adults <= 1}
                                                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Minus weight="bold" className="w-4 h-4" />
                                            </button>
                                            <span className="w-6 text-center font-semibold text-[#1C1C1C] text-lg">{adults}</span>
                                            <button
                                                onClick={() => {
                                                    const newVal = Math.min(10, adults + 1);
                                                    setAdults(newVal);
                                                    setGuests(newVal + children);
                                                }}
                                                disabled={adults >= 10}
                                                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Plus weight="bold" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Children */}
                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <div className="text-sm font-semibold text-[#1C1C1C]">Children</div>
                                            <div className="text-xs text-gray-400 mt-0.5">Ages 2–12</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => {
                                                    const newVal = Math.max(0, children - 1);
                                                    setChildren(newVal);
                                                    setGuests(adults + newVal);
                                                }}
                                                disabled={children <= 0}
                                                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Minus weight="bold" className="w-4 h-4" />
                                            </button>
                                            <span className="w-6 text-center font-semibold text-[#1C1C1C] text-lg">{children}</span>
                                            <button
                                                onClick={() => {
                                                    const newVal = Math.min(10, children + 1);
                                                    setChildren(newVal);
                                                    setGuests(adults + newVal);
                                                }}
                                                disabled={children >= 10}
                                                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Plus weight="bold" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowGuests(false)}
                                        className="w-full mt-3 px-4 py-2.5 bg-[#F5A623] text-white rounded-xl text-sm font-semibold hover:bg-[#E09000] transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-8 bg-neutral-200" />

                        {/* 5. Property Type (Added to Pill) */}
                        <div ref={typeRef} className="relative flex-[0.8]">
                            <div
                                className={`py-2 px-6 rounded-full transition-colors cursor-pointer ${showType ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
                                onClick={() => {
                                    setShowType(!showType);
                                    setShowDestinations(false);
                                    setShowCheckIn(false);
                                    setShowCheckOut(false);
                                    setShowGuests(false);
                                }}
                            >
                                <div className="text-xs font-semibold text-neutral-800 mb-0.5 flex items-center gap-1.5">
                                    <House weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    Kind
                                </div>
                                <div className={`text-sm font-medium truncate ${propertyType ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                    {PROPERTY_TYPES.find(t => t.value === propertyType)?.label || "Any Type"}
                                </div>
                            </div>

                            {showType && (
                                <div className="absolute top-full right-0 mt-2 w-[240px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {PROPERTY_TYPES.map((type) => (
                                        <button
                                            key={type.value}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[#1C1C1C] text-sm font-medium border-b border-gray-50 last:border-b-0"
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
                            className="bg-[#F5A623] hover:bg-[#E09000] text-white rounded-full h-12 w-12 flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-[1.05] active:scale-[0.98] mr-1"
                        >
                            <MagnifyingGlass weight="bold" className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px] py-3 border-t border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Bedrooms */}
                            <select
                                value={bedrooms}
                                onChange={(e) => {
                                    setBedrooms(e.target.value);
                                    handleSearch();
                                }}
                                className="px-4 py-2.5 border border-gray-200 rounded-full bg-white text-[#1C1C1C] text-sm outline-none hover:border-primary transition-colors cursor-pointer"
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
                                className="px-4 py-2.5 border border-gray-200 rounded-full bg-white text-[#1C1C1C] text-sm outline-none hover:border-primary transition-colors cursor-pointer"
                            >
                                {PRICE_RANGES.map((range) => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>

                            {/* More Filters */}
                            <button
                                onClick={() => setShowFiltersModal(true)}
                                className={`flex items-center gap-2 px-4 py-2.5 border rounded-full text-sm transition-colors ${activeFiltersCount > 0
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-gray-200 bg-white text-[#1C1C1C] hover:border-primary"
                                    }`}
                            >
                                <FunnelSimple weight="bold" className="w-4 h-4" />
                                <span>More Filters</span>
                                {activeFiltersCount > 0 && (
                                    <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* Clear Filters */}
                            {(area || propertyType || bedrooms || priceRange || selectedAmenities.length > 0) && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 px-3 py-2.5 text-sm text-[#7E7E7E] hover:text-primary transition-colors"
                                >
                                    <X weight="bold" className="w-4 h-4" />
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Map Toggle */}
                            <button
                                onClick={() => setShowMap(!showMap)}
                                className={`flex items-center gap-2 px-4 py-2.5 border rounded-full text-sm transition-colors ${showMap
                                    ? "border-primary bg-primary text-white"
                                    : "border-gray-200 bg-white text-[#1C1C1C] hover:border-primary"
                                    }`}
                            >
                                {showMap ? <SquaresFour weight="bold" className="w-4 h-4" /> : <MapTrifold weight="fill" className="w-4 h-4" />}
                                <span>{showMap ? "Show Grid" : "Show on map"}</span>
                            </button>

                            {/* Sort */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full bg-white text-[#1C1C1C] text-sm hover:border-primary transition-colors"
                                >
                                    <span>Sort: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                                    <CaretDown weight="bold" className="w-4 h-4 text-gray-400" />
                                </button>
                                {showSortDropdown && (
                                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[180px]">
                                        {SORT_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                className={`w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${sortBy === option.value
                                                    ? "bg-primary/5 text-primary"
                                                    : "hover:bg-gray-50 text-[#1C1C1C]"
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
            <main className="flex-1">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px] py-8">
                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[#7E7E7E]">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <SpinnerGap weight="bold" className="w-4 h-8 animate-spin" />
                                    Searching...
                                </span>
                            ) : (
                                `${totalCount} properties found`
                            )}
                        </p>
                    </div>

                    {/* Property Grid / Map View */}
                    {showMap ? (
                        <div className="relative w-full h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#8ECAE6] to-[#E8E5DB] flex items-center justify-center">
                            <div className="text-center">
                                <MapTrifold weight="duotone" className="w-16 h-16 text-[#F5A623] mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-[#1C1C1C] mb-2">Map View</h3>
                                <p className="text-[#7E7E7E]">
                                    Interactive map coming soon. Configure your Google Maps API key to enable.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {properties.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {properties.slice(0, visibleCount).map((property) => (
                                        <PropertyCard
                                            key={property.id}
                                            id={property.id}
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
                                <div className="text-center py-16">
                                    <MapPin weight="duotone" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-[#1C1C1C] mb-2">
                                        No Properties Found
                                    </h3>
                                    <p className="text-[#7E7E7E] mb-6">
                                        Try adjusting your filters or search criteria.
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}

                            {/* Load More */}
                            {visibleCount < totalCount && (
                                <div className="mt-10 text-center">
                                    <button
                                        onClick={handleLoadMore}
                                        className="px-8 py-3 border border-[#1C1C1C] rounded-full text-[#1C1C1C] font-semibold hover:bg-[#1C1C1C] hover:text-white transition-colors duration-300"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowFiltersModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-[#1C1C1C]">Filters</h2>
                            <button
                                onClick={() => setShowFiltersModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X weight="bold" className="w-5 h-5 text-[#7E7E7E]" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Price Range */}
                            <div>
                                <h3 className="font-semibold text-[#1C1C1C] mb-3">Price Range</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {PRICE_RANGES.slice(1).map((range) => (
                                        <button
                                            key={range.value}
                                            onClick={() => setPriceRange(range.value)}
                                            className={`px-4 py-3 border rounded-xl text-sm transition-colors ${priceRange === range.value
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-gray-200 text-[#1C1C1C] hover:border-primary"
                                                }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Property Type */}
                            <div>
                                <h3 className="font-semibold text-[#1C1C1C] mb-3">Property Type</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {PROPERTY_TYPES.slice(1).map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => setPropertyType(type.value)}
                                            className={`px-4 py-3 border rounded-xl text-sm transition-colors ${propertyType === type.value
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-gray-200 text-[#1C1C1C] hover:border-primary"
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bedrooms */}
                            <div>
                                <h3 className="font-semibold text-[#1C1C1C] mb-3">Bedrooms</h3>
                                <div className="flex flex-wrap gap-2">
                                    {BEDROOM_OPTIONS.slice(1).map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setBedrooms(option.value)}
                                            className={`px-4 py-2 border rounded-full text-sm transition-colors ${bedrooms === option.value
                                                ? "border-primary bg-primary text-white"
                                                : "border-gray-200 text-[#1C1C1C] hover:border-primary"
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div>
                                <h3 className="font-semibold text-[#1C1C1C] mb-3">Amenities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {AMENITIES.map((amenity) => (
                                        <button
                                            key={amenity}
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`px-4 py-2 border rounded-full text-sm transition-colors ${selectedAmenities.includes(amenity)
                                                ? "border-primary bg-primary text-white"
                                                : "border-gray-200 text-[#1C1C1C] hover:border-primary"
                                                }`}
                                        >
                                            {amenity}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                            <button
                                onClick={() => {
                                    setPropertyType("");
                                    setBedrooms("");
                                    setPriceRange("");
                                    setSelectedAmenities([]);
                                }}
                                className="text-[#7E7E7E] hover:text-[#1C1C1C] font-medium transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => {
                                    setShowFiltersModal(false);
                                    handleSearch();
                                }}
                                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
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
                <SpinnerGap weight="bold" className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}
