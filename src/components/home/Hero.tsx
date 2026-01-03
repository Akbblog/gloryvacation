"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { format, addDays } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useTranslations, useLocale } from "next-intl";
import { ar, enUS } from "date-fns/locale";
import {
    MagnifyingGlass,
    MapPin,
    CalendarBlank,
    UsersThree,
    Minus,
    Plus,
    X,
    Buildings,
    Tree,
    Umbrella,
    Briefcase,
    Mountains,
    House,
    Laptop,
    Anchor,
    Storefront,
    Horse,
    SoccerBall,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Dubai Areas Configuration
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

export function Hero() {
    const router = useRouter();
    const t = useTranslations('Hero');
    const locale = useLocale();
    const dateLocale = locale === 'ar' ? ar : enUS;

    // Search state
    const [destination, setDestination] = useState("");
    const [destinationLabel, setDestinationLabel] = useState("");

    // Date states (Date objects)
    const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
    const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    // Dropdown states
    const [showDestinations, setShowDestinations] = useState(false);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showCheckOut, setShowCheckOut] = useState(false);
    const [showGuests, setShowGuests] = useState(false);
    const [filteredAreas, setFilteredAreas] = useState(DUBAI_AREAS);
    const [searchInput, setSearchInput] = useState("");

    // Refs for click outside
    const destRef = useRef<HTMLDivElement>(null);
    const checkInRef = useRef<HTMLDivElement>(null);
    const checkOutRef = useRef<HTMLDivElement>(null);
    const guestsRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (destRef.current && !destRef.current.contains(event.target as Node)) {
                setShowDestinations(false);
            }
            if (checkInRef.current && !checkInRef.current.contains(event.target as Node)) {
                setShowCheckIn(false);
            }
            if (checkOutRef.current && !checkOutRef.current.contains(event.target as Node)) {
                setShowCheckOut(false);
            }
            if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
                setShowGuests(false);
            }
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

    // Get today's date
    const today = new Date();

    // Total guests
    const totalGuests = adults + children;

    // Handle search
    const handleSearch = () => {
        const params = new URLSearchParams();

        if (destination) {
            params.set("area", destinationLabel || destination);
        } else if (searchInput) {
            // If user typed free text but didn't select a destination, use it as a general search query
            params.set("search", searchInput);
        }
        if (checkInDate) {
            params.set("checkIn", format(checkInDate, "yyyy-MM-dd"));
        }
        if (checkOutDate) {
            params.set("checkOut", format(checkOutDate, "yyyy-MM-dd"));
        }
        if (totalGuests > 1) {
            params.set("guests", totalGuests.toString());
        }
        if (adults > 1) {
            params.set("adults", adults.toString());
        }
        if (children > 0) {
            params.set("children", children.toString());
        }

        const queryString = params.toString();
        router.push(`/listings${queryString ? `?${queryString}` : ""}`);
    };

    // Handle destination selection
    const selectDestination = (area: typeof DUBAI_AREAS[0]) => {
        setDestination(area.value);
        setDestinationLabel(area.label);
        setSearchInput(area.label);
        setShowDestinations(false);
    };

    // Clear destination
    const clearDestination = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDestination("");
        setDestinationLabel("");
        setSearchInput("");
    };

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
        <section className="relative flex flex-col w-full h-[320px] md:h-[478px] items-center justify-center">
            <style>{css}</style>

            {/* Video/Image Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                poster="/hero-video-poster.webp"
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/hero-Video.webm" type="video/webm" />
                <source src="/hero-Video.mp4" type="video/mp4" />
                {/* Fallback to image if video not available */}
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2049&auto=format&fit=crop')"
                    }}
                />
            </video>

            {/* Gradient Overlay */}
            <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                    background: "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 30.5%, rgba(0, 0, 0, 0.43) 113.08%)"
                }}
            />

            {/* Content */}
            <div className="relative z-[45] flex flex-col items-center px-4 sm:px-6 w-full">
                <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center drop-shadow-lg">
                    {t('title')}
                </h1>

                {/* Desktop Search Bar */}
                <div className="hidden md:block mt-16 w-full max-w-5xl">
                    <div className="bg-white rounded-[60px] py-2 px-2 shadow-[0px_6px_22px_0px_rgba(139,80,17,0.17)] flex items-center">
                        {/* Where / Destination */}
                        <div ref={destRef} className="relative flex-1 min-w-[200px] lg:min-w-[280px]">
                            <div
                                className={`py-2 px-6 lg:px-8 rounded-full transition-colors cursor-pointer ${showDestinations ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
                                onClick={() => {
                                    setShowDestinations(!showDestinations);
                                    setShowCheckIn(false);
                                    setShowCheckOut(false);
                                    setShowGuests(false);
                                }}
                            >
                                <div className="text-xs font-semibold text-neutral-800 mb-0.5 flex items-center gap-1.5">
                                    <MapPin weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    {t('where')}
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        placeholder={t('searchDestinations')}
                                        value={searchInput}
                                        onChange={(e) => {
                                            setSearchInput(e.target.value);
                                            setShowDestinations(true);
                                        }}
                                        onFocus={() => setShowDestinations(true)}
                                        className="w-full bg-transparent border-none text-sm text-neutral-600 font-medium outline-none placeholder:text-neutral-400 p-0"
                                    />
                                    {searchInput && (
                                        <button onClick={clearDestination} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
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
                                            filteredAreas.map((area) => {
                                                const IconComponent = area.Icon;
                                                return (
                                                    <button
                                                        key={area.value}
                                                        className="w-full px-4 py-3.5 text-left hover:bg-[#F5A623]/5 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-b-0"
                                                        onClick={() => selectDestination(area)}
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623]/20 to-[#F5A623]/5 flex items-center justify-center">
                                                            <IconComponent weight="duotone" className="w-5 h-5 text-[#F5A623]" />
                                                        </div>
                                                        <span className="text-sm text-[#1C1C1C] font-medium">{t(`areas.${area.value}`)}</span>
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

                        {/* Check in */}
                        <div ref={checkInRef} className="relative flex-1">
                            <div
                                className={`py-2 px-6 lg:px-8 rounded-full transition-colors cursor-pointer ${showCheckIn ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
                                onClick={() => {
                                    setShowCheckIn(!showCheckIn);
                                    setShowDestinations(false);
                                    setShowCheckOut(false);
                                    setShowGuests(false);
                                }}
                            >
                                <div className="text-xs font-semibold text-neutral-800 mb-0.5 flex items-center gap-1.5">
                                    <CalendarBlank weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    {t('checkIn')}
                                </div>
                                <div className={`text-sm font-medium ${checkInDate ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                    {formatDateDisplay(checkInDate) || t('addDate')}
                                </div>
                            </div>

                            {/* Check-in Calendar */}
                            {showCheckIn && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <DayPicker
                                        mode="single"
                                        selected={checkInDate}
                                        onSelect={(date) => {
                                            setCheckInDate(date);
                                            // Auto advance to checkout
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

                        {/* Check out */}
                        <div ref={checkOutRef} className="relative flex-1">
                            <div
                                className={`py-2 px-6 lg:px-8 rounded-full transition-colors cursor-pointer ${showCheckOut ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
                                onClick={() => {
                                    setShowCheckOut(!showCheckOut);
                                    setShowDestinations(false);
                                    setShowCheckIn(false);
                                    setShowGuests(false);
                                }}
                            >
                                <div className="text-xs font-semibold text-neutral-800 mb-0.5 flex items-center gap-1.5">
                                    <CalendarBlank weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    {t('checkOut')}
                                </div>
                                <div className={`text-sm font-medium ${checkOutDate ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                    {formatDateDisplay(checkOutDate) || t('addDate')}
                                </div>
                            </div>

                            {/* Check-out Calendar */}
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

                        {/* Guests */}
                        <div ref={guestsRef} className="relative flex-[0.8]">
                            <div
                                className={`py-2 px-6 lg:px-8 rounded-full transition-colors cursor-pointer ${showGuests ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
                                onClick={() => {
                                    setShowGuests(!showGuests);
                                    setShowDestinations(false);
                                    setShowCheckIn(false);
                                    setShowCheckOut(false);
                                }}
                            >
                                <div className="text-xs font-semibold text-neutral-800 mb-0.5 flex items-center gap-1.5">
                                    <UsersThree weight="fill" className="w-3.5 h-3.5 text-[#F5A623]" />
                                    {t('who')}
                                </div>
                                <div className={`text-sm font-medium truncate ${totalGuests > 1 ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                    {totalGuests > 1 ? `${totalGuests} ${t('guests')}` : t('addGuests')}
                                </div>
                            </div>

                            {/* Guests Dropdown */}
                            {showGuests && (
                                <div className="absolute top-full right-0 mt-2 w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Adults */}
                                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                                        <div>
                                            <div className="text-sm font-semibold text-[#1C1C1C]">{t('adults')}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{t('adultsBubble')}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setAdults(Math.max(1, adults - 1))}
                                                disabled={adults <= 1}
                                                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Minus weight="bold" className="w-4 h-4" />
                                            </button>
                                            <span className="w-6 text-center font-semibold text-[#1C1C1C] text-lg">{adults}</span>
                                            <button
                                                onClick={() => setAdults(Math.min(10, adults + 1))}
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
                                            <div className="text-sm font-semibold text-[#1C1C1C]">{t('children')}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{t('childrenBubble')}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setChildren(Math.max(0, children - 1))}
                                                disabled={children <= 0}
                                                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Minus weight="bold" className="w-4 h-4" />
                                            </button>
                                            <span className="w-6 text-center font-semibold text-[#1C1C1C] text-lg">{children}</span>
                                            <button
                                                onClick={() => setChildren(Math.min(10, children + 1))}
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
                                        {t('done')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            className="bg-[#F5A623] hover:bg-[#E09000] text-white rounded-full h-14 min-w-[120px] px-8 flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <MagnifyingGlass weight="bold" className="w-5 h-5" />
                            <span className="font-bold text-base hidden lg:inline">{t('search')}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar - hidden per request */}
                <div className="hidden mt-6 w-full max-w-sm px-2">
                    <button
                        onClick={handleSearch}
                        className="w-full bg-white rounded-2xl p-3 flex items-center gap-3 shadow-lg border border-neutral-100 hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#E09000] flex items-center justify-center shadow-md flex-shrink-0">
                            <MagnifyingGlass weight="bold" className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <div className="text-sm font-semibold text-[#1C1C1C] truncate">{t('searchDestinations')}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                                <span>{t('dubai')}</span>
                                <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                                <span>{t('anyDate')}</span>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </section>
    );
}
