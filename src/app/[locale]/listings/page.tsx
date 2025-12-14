"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/listings/PropertyCard";
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
} from "@phosphor-icons/react";

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

const DUBAI_AREAS = [
    "Any Area",
    "Dubai Marina",
    "Downtown Dubai",
    "Palm Jumeirah",
    "JBR",
    "Business Bay",
    "Dubai Hills",
    "JVC",
    "DIFC",
    "Creek Harbour",
    "Al Barsha",
    "Meydan",
    "Discovery Gardens",
    "Sports City",
    "Silicon Oasis",
];

// Mock properties for demo
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

    // State for filters
    const [area, setArea] = useState(searchParams.get("area") || "");
    const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
    const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
    const [guests, setGuests] = useState(searchParams.get("guests") || "1");
    const [propertyType, setPropertyType] = useState(searchParams.get("type") || "");
    const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
    const [priceRange, setPriceRange] = useState(searchParams.get("price") || "");
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [showMap, setShowMap] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);
    const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

    // Loading and pagination
    const [isLoading, setIsLoading] = useState(false);
    const [properties, setProperties] = useState<typeof MOCK_PROPERTIES>([] as any);
    const [visibleCount, setVisibleCount] = useState(8);
    const [totalCount, setTotalCount] = useState(MOCK_PROPERTIES.length);

    // Filter properties based on current filters
    const filterProperties = useCallback(() => {
        let filtered = [...MOCK_PROPERTIES];

        // Filter by area
        if (area && area !== "Any Area") {
            filtered = filtered.filter((p) =>
                p.area.toLowerCase().includes(area.toLowerCase())
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
            const guestNum = parseInt(guests);
            filtered = filtered.filter((p) => p.guests >= guestNum);
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

    // Fetch properties from API so newly created listings appear live
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/properties`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                if (!mounted) return;
                // Map server properties to the client shape expected by the UI
                const mapped = data.map((p: any) => ({
                    id: p._id || p.id,
                    title: p.title,
                    pricePerNight: p.pricePerNight || p.price,
                    images: p.images && p.images.length ? p.images : ["/placeholder.jpg"],
                    guests: p.guests || 1,
                    bedrooms: p.bedrooms || 1,
                    propertyType: p.propertyType || 'apartment',
                    amenities: p.amenities || [],
                    isNew: p.isNew || false,
                    area: p.location?.area || (p.area || 'Unknown'),
                }));
                setProperties(mapped);
                setTotalCount(mapped.length);
            } catch (e) {
                // fallback to mock data in development or if API fails
                if (process.env.NODE_ENV !== 'production') {
                    setProperties(MOCK_PROPERTIES);
                    setTotalCount(MOCK_PROPERTIES.length);
                }
            } finally {
                setIsLoading(false);
            }
        };

        load();

        return () => { mounted = false; };
    }, []);

    // Update URL with filters
    const updateURL = useCallback(() => {
        const params = new URLSearchParams();
        if (area && area !== "Any Area") params.set("area", area);
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        if (guests && guests !== "1") params.set("guests", guests);
        if (propertyType) params.set("type", propertyType);
        if (bedrooms) params.set("bedrooms", bedrooms);
        if (priceRange) params.set("price", priceRange);
        if (sortBy && sortBy !== "featured") params.set("sort", sortBy);

        const queryString = params.toString();
        router.push(`/listings${queryString ? `?${queryString}` : ""}`, { scroll: false });
    }, [area, checkIn, checkOut, guests, propertyType, bedrooms, priceRange, sortBy, router]);

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
        setCheckIn("");
        setCheckOut("");
        setGuests("1");
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
        (propertyType ? 1 : 0) +
        (bedrooms ? 1 : 0) +
        (priceRange ? 1 : 0) +
        selectedAmenities.length;

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
            <Navbar />

            {/* Search Header */}
            <section className="relative md:sticky md:top-0 z-40 bg-white border-b border-gray-100 shadow-sm pt-20">
                {/* Main Search Bar */}
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px] py-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Location/Area */}
                        <div className="relative flex-1 min-w-[200px]">
                            <div
                                className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white cursor-pointer hover:border-primary transition-colors"
                                onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                            >
                                <MapPin weight="fill" className="w-5 h-5 text-[#F5A623]" />
                                <span className="text-[#1C1C1C] flex-1 truncate">
                                    {area || "Dubai, United Arab Emirates"}
                                </span>
                                <CaretDown weight="bold" className="w-4 h-4 text-gray-400" />
                            </div>
                            {showAreaDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                                    {DUBAI_AREAS.map((areaOption) => (
                                        <button
                                            key={areaOption}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[#1C1C1C] first:rounded-t-xl last:rounded-b-xl"
                                            onClick={() => {
                                                setArea(areaOption === "Any Area" ? "" : areaOption);
                                                setShowAreaDropdown(false);
                                            }}
                                        >
                                            {areaOption}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Check-in / Check-out */}
                        <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white min-w-[240px]">
                            <CalendarBlank weight="fill" className="w-5 h-5 text-[#F5A623]" />
                            <input
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                className="bg-transparent outline-none text-[#1C1C1C] w-[110px]"
                                placeholder="Check-in"
                            />
                            <span className="text-gray-300">—</span>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                className="bg-transparent outline-none text-[#1C1C1C] w-[110px]"
                                placeholder="Check-out"
                            />
                        </div>

                        {/* Guests */}
                        <div className="relative">
                            <div
                                className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white cursor-pointer hover:border-primary transition-colors min-w-[130px]"
                                onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                            >
                                <UsersThree weight="fill" className="w-5 h-5 text-[#F5A623]" />
                                <span className="text-[#1C1C1C]">{guests} Guest{parseInt(guests) !== 1 ? "s" : ""}</span>
                                <CaretDown weight="bold" className="w-4 h-4 text-gray-400" />
                            </div>
                            {showGuestsDropdown && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[150px]">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <button
                                            key={num}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[#1C1C1C] first:rounded-t-xl last:rounded-b-xl"
                                            onClick={() => {
                                                setGuests(num.toString());
                                                setShowGuestsDropdown(false);
                                            }}
                                        >
                                            {num} Guest{num !== 1 ? "s" : ""}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Property Type */}
                        <select
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-[#1C1C1C] outline-none hover:border-primary transition-colors cursor-pointer min-w-[140px]"
                        >
                            {PROPERTY_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            className="p-3 bg-[#F5A623] text-white rounded-xl hover:bg-[#E09000] transition-colors flex items-center justify-center"
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
                                    <SpinnerGap weight="bold" className="w-4 h-4 animate-spin" />
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
                                            pricePerNight={property.pricePerNight}
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
