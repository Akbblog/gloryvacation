"use client";

import { useState, useEffect } from "react";
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
    CaretLeft,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Dubai Areas Configuration (Same as Hero.tsx)
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

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const router = useRouter();
    const t = useTranslations('Hero');
    const locale = useLocale();
    const dateLocale = locale === 'ar' ? ar : enUS;

    // Search state
    const [step, setStep] = useState<'destination' | 'dates' | 'guests'>('destination');
    const [destination, setDestination] = useState("");
    const [destinationLabel, setDestinationLabel] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filteredAreas, setFilteredAreas] = useState(DUBAI_AREAS);

    // Date states
    const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
    const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);

    // Guest states
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

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

    // Reset step when opening
    useEffect(() => {
        if (isOpen) {
            setStep('destination');
        }
    }, [isOpen]);

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (destination) {
            params.set("area", destinationLabel || destination);
        } else if (searchInput) {
            params.set("search", searchInput);
        }
        if (checkInDate) {
            params.set("checkIn", format(checkInDate, "yyyy-MM-dd"));
        }
        if (checkOutDate) {
            params.set("checkOut", format(checkOutDate, "yyyy-MM-dd"));
        }
        const totalGuests = adults + children;
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
        onClose();
    };

    const clearDestination = () => {
        setDestination("");
        setDestinationLabel("");
        setSearchInput("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                    <X weight="bold" className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex gap-2">
                    {step !== 'destination' && (
                        <button 
                            onClick={() => setStep(step === 'guests' ? 'dates' : 'destination')}
                            className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1"
                        >
                            <CaretLeft className="w-4 h-4" />
                            {t('back')}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {step === 'destination' && (
                    <div className="p-4 space-y-4">
                        <h2 className="text-2xl font-bold text-[#1C1C1C]">{t('whereTo')}</h2>
                        <div className="relative">
                            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('searchDestinations')}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full bg-gray-50 rounded-xl py-3.5 pl-12 pr-10 text-base font-medium outline-none focus:ring-2 focus:ring-[#F5A623]/20 transition-all"
                                autoFocus
                            />
                            {searchInput && (
                                <button 
                                    onClick={clearDestination}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                                >
                                    <X weight="bold" className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('popularDestinations')}</div>
                            {filteredAreas.map((area) => {
                                const IconComponent = area.Icon;
                                return (
                                    <button
                                        key={area.value}
                                        onClick={() => {
                                            setDestination(area.value);
                                            setDestinationLabel(area.label);
                                            setSearchInput(area.label);
                                            setStep('dates');
                                        }}
                                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-[#F5A623]/10 transition-colors">
                                            <IconComponent weight="duotone" className="w-6 h-6 text-gray-500 group-hover:text-[#F5A623]" />
                                        </div>
                                        <span className="font-medium text-[#1C1C1C]">{t(`areas.${area.value}`)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 'dates' && (
                    <div className="p-4 space-y-6">
                        <h2 className="text-2xl font-bold text-[#1C1C1C]">{t('when')}</h2>
                        <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
                            <div className={cn(
                                "flex-1 py-2 px-3 rounded-lg text-center transition-all",
                                !checkInDate ? "bg-white shadow-sm" : "text-gray-500"
                            )}>
                                <div className="text-xs font-medium mb-0.5">{t('checkIn')}</div>
                                <div className="text-sm font-bold text-[#1C1C1C]">
                                    {checkInDate ? format(checkInDate, "MMM dd", { locale: dateLocale }) : "-"}
                                </div>
                            </div>
                            <div className={cn(
                                "flex-1 py-2 px-3 rounded-lg text-center transition-all",
                                checkInDate && !checkOutDate ? "bg-white shadow-sm" : "text-gray-500"
                            )}>
                                <div className="text-xs font-medium mb-0.5">{t('checkOut')}</div>
                                <div className="text-sm font-bold text-[#1C1C1C]">
                                    {checkOutDate ? format(checkOutDate, "MMM dd", { locale: dateLocale }) : "-"}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <DayPicker
                                mode="single"
                                selected={!checkInDate ? checkInDate : (checkOutDate || checkInDate)}
                                onSelect={(date) => {
                                    if (!checkInDate) {
                                        setCheckInDate(date);
                                    } else if (!checkOutDate) {
                                        if (date && date < checkInDate) {
                                            setCheckInDate(date);
                                        } else {
                                            setCheckOutDate(date);
                                        }
                                    } else {
                                        setCheckInDate(date);
                                        setCheckOutDate(undefined);
                                    }
                                }}
                                disabled={[{ before: new Date() }]}
                                showOutsideDays
                                locale={dateLocale}
                                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                                className="border-0"
                                modifiers={{
                                    start: checkInDate,
                                    end: checkOutDate,
                                    range: (date) => {
                                        if (checkInDate && checkOutDate) {
                                            return date > checkInDate && date < checkOutDate;
                                        }
                                        return false;
                                    }
                                }}
                                modifiersStyles={{
                                    start: { backgroundColor: '#F5A623', color: 'white' },
                                    end: { backgroundColor: '#F5A623', color: 'white' },
                                    range: { backgroundColor: '#FFF8EB', color: '#1C1C1C' }
                                }}
                            />
                        </div>
                    </div>
                )}

                {step === 'guests' && (
                    <div className="p-4 space-y-6">
                        <h2 className="text-2xl font-bold text-[#1C1C1C]">{t('who')}</h2>
                        
                        {/* Adults */}
                        <div className="flex items-center justify-between py-4 border-b border-gray-100">
                            <div>
                                <div className="text-base font-semibold text-[#1C1C1C]">{t('adults')}</div>
                                <div className="text-sm text-gray-400 mt-0.5">{t('adultsBubble')}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setAdults(Math.max(1, adults - 1))}
                                    disabled={adults <= 1}
                                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <Minus weight="bold" className="w-4 h-4" />
                                </button>
                                <span className="w-6 text-center font-semibold text-[#1C1C1C] text-xl">{adults}</span>
                                <button
                                    onClick={() => setAdults(Math.min(10, adults + 1))}
                                    disabled={adults >= 10}
                                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <Plus weight="bold" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between py-4">
                            <div>
                                <div className="text-base font-semibold text-[#1C1C1C]">{t('children')}</div>
                                <div className="text-sm text-gray-400 mt-0.5">{t('childrenBubble')}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setChildren(Math.max(0, children - 1))}
                                    disabled={children <= 0}
                                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <Minus weight="bold" className="w-4 h-4" />
                                </button>
                                <span className="w-6 text-center font-semibold text-[#1C1C1C] text-xl">{children}</span>
                                <button
                                    onClick={() => setChildren(Math.min(10, children + 1))}
                                    disabled={children >= 10}
                                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <Plus weight="bold" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <button 
                        onClick={() => {
                            setDestination("");
                            setCheckInDate(undefined);
                            setCheckOutDate(undefined);
                            setAdults(1);
                            setChildren(0);
                            setStep('destination');
                        }}
                        className="text-sm font-semibold text-gray-500 underline"
                    >
                        {t('clearAll')}
                    </button>
                    {step !== 'guests' ? (
                        <button
                            onClick={() => setStep(step === 'destination' ? 'dates' : 'guests')}
                            className="bg-[#1C1C1C] text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition-colors"
                        >
                            {t('next')}
                        </button>
                    ) : (
                        <button
                            onClick={handleSearch}
                            className="bg-[#F5A623] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#E09000] transition-colors flex items-center gap-2"
                        >
                            <MagnifyingGlass weight="bold" className="w-5 h-5" />
                            {t('search')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
