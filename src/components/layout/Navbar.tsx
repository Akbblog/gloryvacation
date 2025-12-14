"use client";

import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import {
    Globe,
    List,
    User,
    SignIn,
    House,
    Armchair,
    Buildings,
    GearSix,
    Phone,
    CaretDown,
    X,
    SignOut,
    MagnifyingGlass,
    UserCircle,
} from "@phosphor-icons/react";

interface NavbarProps {
    variant?: "home" | "inner";
}

export function Navbar({ variant = "inner" }: NavbarProps) {
    const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
    const [isScrolledStart, setIsScrolledStart] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const [currencyOpen, setCurrencyOpen] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('Navbar');
    const tHero = useTranslations('Hero');
    const locale = useLocale();

    const handleLanguageChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    const isHome = variant === "home";
    const showSolid = isScrolledPastHero || !isHome;
    const showNavButtons = !isScrolledStart && isHome;

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsScrolledPastHero(scrollY > 450);
            setIsScrolledStart(scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMenuItemClick = (href: string) => {
        setMenuOpen(false);
        router.push(href);
    };

    return (
        <header
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                showSolid
                    ? "bg-white shadow-md py-2"
                    : "bg-transparent py-4 md:py-5"
            )}
        >
            <div className="container max-w-[1440px] mx-auto px-4 md:px-6 lg:px-[70px]">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center z-50">
                        <span
                            className={cn(
                                "text-xl md:text-2xl font-bold transition-colors whitespace-nowrap",
                                showSolid ? "text-primary" : "text-white"
                            )}
                        >
                            Glory Vacation
                        </span>
                    </Link>

                    {/* Center Search Bar - Only shows on scroll */}
                    {showSolid ? (
                        <div className="hidden lg:flex items-center flex-1 max-w-xl mx-8 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center w-full bg-gray-100 rounded-full px-4 py-2.5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => router.push("/listings")}
                            >
                                <MagnifyingGlass weight="bold" className="w-4 h-4 text-gray-500 mr-3" />
                                <span className="text-sm text-gray-500">{tHero('searchDestinations')}</span>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="text-xs text-gray-400">{tHero('dubai')}</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-xs text-gray-400">{tHero('addDate')}</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-xs text-gray-400">{tHero('guests')}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Owner/Host Buttons - Only shows when NOT scrolled significantly */
                        <div className={cn(
                            "hidden lg:flex items-center gap-3 ml-auto mr-4 transition-opacity duration-300",
                            showNavButtons ? "opacity-100" : "opacity-0 pointer-events-none"
                        )}>
                            <button
                                onClick={() => router.push(session?.user?.role === 'admin' ? "/admin" : "/profile")}
                                className="bg-[#2D2D2D]/80 backdrop-blur-sm hover:bg-[#2D2D2D] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                {t('ownersPortal')}
                            </button>
                            <button
                                onClick={() => router.push("/list-your-property")}
                                className="bg-[#2D2D2D]/80 backdrop-blur-sm hover:bg-[#2D2D2D] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                {t('listProperty')}
                            </button>
                        </div>
                    )}

                    {/* Right Side Actions */}
                    <nav className="flex items-center gap-3 z-50">
                        {/* Language Switcher - Desktop */}
                        <button
                            onClick={() => handleLanguageChange(locale === 'en' ? 'ar' : 'en')}
                            className={cn(
                                "hidden md:flex items-center gap-0 min-w-[90px] px-4 py-2.5 rounded-full font-semibold transition-all duration-300 cursor-pointer",
                                showSolid
                                    ? "bg-white border border-gray-200 hover:bg-gray-50"
                                    : "bg-white/90 hover:bg-white"
                            )}
                        >
                            <span className={cn("text-sm transition-colors", locale === 'en' ? "text-[#1C1C1C] font-bold" : "text-[#B4B4B4]")}>EN</span>
                            <span className="text-[#7E7E7E] mx-1">|</span>
                            <span className={cn("text-sm transition-colors", locale === 'ar' ? "text-[#1C1C1C] font-bold" : "text-[#B4B4B4]")}>AR</span>
                        </button>

                        {/* Profile Menu Button - Desktop */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className={cn(
                                    "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
                                    showSolid
                                        ? "bg-white border border-gray-200 hover:shadow-md"
                                        : "bg-white/90 hover:bg-white"
                                )}
                            >
                                <List weight="bold" className="w-5 h-5 text-[#3D3D3D]" />
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7E7E7E] to-[#5E5E5E] flex items-center justify-center">
                                    <User weight="fill" className="w-4 h-4 text-white" />
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-4 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                                    {/* Auth Section */}
                                    {!session ? (
                                        <button
                                            onClick={() => handleMenuItemClick("/auth/signin")}
                                            className="w-full flex items-center gap-3.5 px-6 py-3.5 hover:bg-[#F5A623]/10 transition-colors text-left group"
                                        >
                                            <div className="p-2 rounded-full bg-[#F5A623]/10 group-hover:bg-[#F5A623]/20 transition-colors">
                                                <SignIn weight="duotone" className="w-5 h-5 text-[#F5A623]" />
                                            </div>
                                            <div>
                                                <span className="block text-[#1C1C1C] font-semibold text-sm">{t('login')}</span>
                                                <span className="block text-xs text-gray-500 mt-0.5">{t('accessProfile')}</span>
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="px-6 py-4 border-b border-gray-100/50 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E09000] flex items-center justify-center ring-2 ring-white shadow-sm">
                                                <UserCircle weight="fill" className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#1C1C1C] text-sm">{session.user?.name}</p>
                                                <p className="text-xs text-[#7E7E7E]">{session.user?.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-100/50 my-2"></div>

                                    {/* Menu Items */}
                                    <div className="px-2">
                                        {[
                                            { label: t('becomeHost'), icon: House, href: "/list-your-property" },
                                            { label: t('furnish'), icon: Armchair, href: "/list-your-property" },
                                            { label: t('buyProperty'), icon: Buildings, href: "/listings" },
                                            { label: t('manage'), icon: GearSix, href: session?.user?.role === 'admin' ? "/admin" : "/profile" },
                                        ].map((item) => (
                                            <button
                                                key={item.label}
                                                onClick={() => handleMenuItemClick(item.href)}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                                            >
                                                <item.icon weight="duotone" className="w-5 h-5 text-[#7E7E7E] group-hover:text-[#F5A623] transition-colors" />
                                                <span className="text-sm font-medium text-[#1C1C1C] group-hover:text-black">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-100/50 my-2"></div>

                                    {/* Currency */}
                                    <div className="px-2">
                                        <button
                                            onClick={() => setCurrencyOpen(!currencyOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Globe weight="duotone" className="w-5 h-5 text-[#7E7E7E] group-hover:text-[#F5A623] transition-colors" />
                                                <span className="text-sm font-medium text-[#1C1C1C]">{t('currency')}</span>
                                            </div>
                                            <CaretDown weight="bold" className={cn("w-3.5 h-3.5 text-[#7E7E7E] transition-transform", currencyOpen && "rotate-180")} />
                                        </button>

                                        {currencyOpen && (
                                            <div className="mx-4 mb-2 p-2 bg-gray-50/80 rounded-xl grid grid-cols-2 gap-1 animate-in slide-in-from-top-1 duration-200">
                                                {["AED", "USD", "EUR", "GBP"].map((currency) => (
                                                    <button
                                                        key={currency}
                                                        className="text-center py-2 text-xs font-semibold text-gray-600 hover:text-[#F5A623] hover:bg-white rounded-lg transition-all"
                                                    >
                                                        {currency}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleMenuItemClick("/contact")}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                                        >
                                            <Phone weight="duotone" className="w-5 h-5 text-[#7E7E7E] group-hover:text-[#F5A623] transition-colors" />
                                            <span className="text-sm font-medium text-[#1C1C1C]">{t('contact')}</span>
                                        </button>
                                    </div>

                                    {session && (
                                        <>
                                            <div className="border-t border-gray-100/50 my-2"></div>
                                            <div className="px-2">
                                                <button
                                                    onClick={() => signOut({ callbackUrl: "/" })}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50/50 transition-colors text-left group"
                                                >
                                                    <SignOut weight="duotone" className="w-5 h-5 text-red-400 group-hover:text-red-500" />
                                                    <span className="text-sm font-medium text-red-600">{t('logout')}</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className={cn(
                                "md:hidden flex items-center justify-center p-2 rounded-full transition-all duration-300",
                                showSolid
                                    ? "bg-gray-100 text-[#1C1C1C] hover:bg-gray-200"
                                    : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                            )}
                        >
                            <List weight="bold" className="w-6 h-6" />
                        </button>
                    </nav>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300" onClick={() => setMenuOpen(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-[85%] max-w-[360px] bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-[#1C1C1C]">{t('menu')}</h2>
                                <p className="text-xs text-gray-400 mt-1">{t('explore')}</p>
                            </div>
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                <X weight="bold" className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                            {!session ? (
                                <button
                                    onClick={() => handleMenuItemClick("/auth/signin")}
                                    className="w-full flex items-center gap-4 px-4 py-4 mb-4 bg-[#F5A623]/10 rounded-2xl hover:bg-[#F5A623]/20 transition-colors text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#F5A623]">
                                        <SignIn weight="fill" className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[#1C1C1C] font-bold text-base">{t('login')}</span>
                                        <span className="block text-xs text-gray-600 mt-0.5">{t('startJourney')}</span>
                                    </div>
                                </button>
                            ) : (
                                <div className="px-4 py-4 bg-gray-50 rounded-2xl mb-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E09000] flex items-center justify-center text-white shadow-md">
                                        <UserCircle weight="fill" className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1C1C1C]">{session.user?.name}</p>
                                        <p className="text-sm text-gray-500">{session.user?.email}</p>
                                    </div>
                                </div>
                            )}

                            {[
                                { label: t('becomeHost'), icon: House, href: "/list-your-property" },
                                { label: t('furnish'), icon: Armchair, href: "/list-your-property" },
                                { label: t('buyProperty'), icon: Buildings, href: "/listings" },
                                { label: t('manage'), icon: GearSix, href: session?.user?.role === 'admin' ? "/admin" : "/profile" },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => handleMenuItemClick(item.href)}
                                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                                >
                                    <item.icon weight="duotone" className="w-5 h-5 text-gray-400 group-hover:text-[#F5A623] transition-colors" />
                                    <span className="text-[#1C1C1C] font-medium">{item.label}</span>
                                </button>
                            ))}

                            <div className="my-2 border-t border-gray-100/60 mx-4"></div>

                            <button
                                onClick={() => handleMenuItemClick("/contact")}
                                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                            >
                                <Phone weight="duotone" className="w-5 h-5 text-gray-400 group-hover:text-[#F5A623] transition-colors" />
                                <span className="text-[#1C1C1C] font-medium">{t('contact')}</span>
                            </button>

                            {session && (
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 rounded-xl transition-colors text-left group mt-2"
                                >
                                    <SignOut weight="duotone" className="w-5 h-5 text-red-400 group-hover:text-red-500" />
                                    <span className="text-red-600 font-medium">{t('logout')}</span>
                                </button>
                            )}
                        </div>

                        {/* Mobile Footer */}
                        <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-500">{t('currency')}</span>
                                <div className="flex gap-2">
                                    {["AED", "USD", "EUR"].map(c => (
                                        <button key={c} className="px-2 py-1 text-xs font-bold text-gray-400 hover:text-[#F5A623] hover:bg-white rounded border border-transparent hover:border-gray-200 transition-all">
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
