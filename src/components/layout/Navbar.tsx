"use client";

import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
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
import { SearchModal } from "@/components/home/SearchModal";

interface NavbarProps {
    variant?: "home" | "inner";
    hideSearchBar?: boolean;
}

export function Navbar({ variant = "inner", hideSearchBar = false }: NavbarProps) {
    const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
    const [isScrolledStart, setIsScrolledStart] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);

    const [currencyOpen, setCurrencyOpen] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);
    const burgerRef = useRef<HTMLButtonElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('Navbar');
    const tHero = useTranslations('Hero');
    const locale = useLocale();

    const handleLanguageChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    const isHome = variant === "home";
    // Switch to solid small translucent background earlier to avoid overlap while scrolling
    const showSolid = isScrolledStart || !isHome;
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
            const target = event.target as Node;
            // if click is inside desktop menu, do nothing
            if (menuRef.current && menuRef.current.contains(target)) return;
            // if click is inside mobile menu overlay, do nothing
            if (mobileMenuRef.current && mobileMenuRef.current.contains(target)) return;
            // if click is on the burger button, do nothing (it will toggle)
            if (burgerRef.current && burgerRef.current.contains(target)) return;
            // otherwise close menu
            setMenuOpen(false);
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
                "fixed top-0 z-50 w-full transition-all duration-300 h-16",
                showSolid
                    ? "bg-white/95 backdrop-blur-sm shadow-md"
                    : "bg-white/5"
                )}
        >
            <div className="container max-w-[1440px] mx-auto px-4 md:px-6 lg:px-[70px] h-16 flex items-center">
                <div className="flex items-center justify-between w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center z-50">
                        <div className="flex items-center gap-2">
                            <svg
                                className={cn(
                                    "w-8 h-8 transition-colors",
                                    showSolid ? "text-teal-600" : "text-white"
                                )}
                                viewBox="0 0 31.63 16.74"
                                fill="currentColor"
                            >
                                <path d="M23.78,16.73c0,.23.21.34.37.46A3.1,3.1,0,0,1,25.53,20c0,1.19,0,2.37,0,3.55a3.13,3.13,0,0,1-1.26,2.52,3,3,0,0,1-1.78.61A23.74,23.74,0,0,1,20,26.62a2.84,2.84,0,0,1-2-1.18,3.13,3.13,0,0,1-.69-2c0-1.17,0-2.33,0-3.5a3.22,3.22,0,0,1,1-2.29,3.71,3.71,0,0,1,.54-.51c.24-.17.25-.31,0-.5s-.61-.48-.91-.72c-1.17-.92-2.34-1.82-3.49-2.76a.81.81,0,0,0-1.2,0C11.63,14.45,10,15.74,8.32,17L6.57,18.39l-1.21,1a1.08,1.08,0,0,0-.39.94c0,1.62,0,3.25,0,4.87a1.41,1.41,0,0,1-.47,1.13,1.39,1.39,0,0,1-2.24-.61A2.58,2.58,0,0,1,2.19,25c0-1.68,0-3.36,0-5a8.73,8.73,0,0,1,.11-1,2,2,0,0,1,.59-1.16c.33-.32.67-.62,1-.91l3.19-2.53,2.56-2,2.16-1.7a3.38,3.38,0,0,1,4.25.2c.65.62,1.41,1.12,2.11,1.68l2.94,2.33a1.34,1.34,0,0,0,.27.17c.18.08.29,0,.46-.13A15,15,0,0,1,24,13.06a3.05,3.05,0,0,1,3.61.3c.94.72,1.87,1.44,2.8,2.18s1.54,1.23,2.3,1.86a3,3,0,0,1,1.11,2.32c0,1.8,0,3.6,0,5.4a1.5,1.5,0,0,1-.57,1.26,1.43,1.43,0,0,1-2.19-.72,3.39,3.39,0,0,1-.1-.84c0-1.45,0-2.9,0-4.35a1.42,1.42,0,0,0-.69-1.37,18.7,18.7,0,0,1-1.57-1.25L27,16.55c-.37-.29-.72-.58-1.09-.84s-.46-.26-.8,0Zm-1.11,4.95h0V20.15a.8.8,0,0,0-.23-.68c-.3-.25-.61-.49-.91-.72a.29.29,0,0,0-.43,0,9.82,9.82,0,0,0-.77.81.92.92,0,0,0-.19.53c0,1.07,0,2.15,0,3.22,0,.38.14.51.52.52s.92,0,1.38,0,.63-.13.64-.68S22.67,22.18,22.67,21.68Z" transform="translate(-2.19 -9.95)"/>
                                <path d="M15.24,23.14c0,.48,0,1,0,1.43s-.19.75-.78.76-.88,0-1.32,0-.73-.19-.74-.75c0-.95,0-1.91,0-2.86a1.43,1.43,0,0,1,1.89-1.34,1.46,1.46,0,0,1,1,1.29c0,.49,0,1,0,1.48Z" transform="translate(-2.19 -9.95)"/>
                            </svg>
                            <span
                                className={cn(
                                    "text-xl md:text-2xl font-bold transition-colors whitespace-nowrap",
                                    showSolid ? "text-teal-600" : "text-white"
                                )}
                            >
                                Glory Vacation Homes
                            </span>
                        </div>
                    </Link>

                    {/* Center Search Bar - Only shows on scroll, hidden when hideSearchBar is true */}
                    {showSolid && !hideSearchBar ? (
                        <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8 animate-in fade-in zoom-in-95 duration-300">
                            <div 
                                className="flex items-center w-full bg-white rounded-full pl-5 pr-2 py-1.5 border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                                onClick={() => setShowSearchModal(true)}
                            >
                                {/* Where Section */}
                                <div className="flex-1 min-w-0 pr-4 border-r border-gray-200">
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{tHero('where')}</div>
                                    <div className="text-sm font-medium text-gray-800 truncate">{tHero('searchDestinations')}</div>
                                </div>
                                
                                {/* Check In Section */}
                                <div className="flex-shrink-0 px-4 border-r border-gray-200">
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{tHero('checkIn')}</div>
                                    <div className="text-sm font-medium text-gray-400">{tHero('addDate')}</div>
                                </div>
                                
                                {/* Check Out Section */}
                                <div className="flex-shrink-0 px-4 border-r border-gray-200">
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{tHero('checkOut')}</div>
                                    <div className="text-sm font-medium text-gray-400">{tHero('addDate')}</div>
                                </div>
                                
                                {/* Guests Section */}
                                <div className="flex-shrink-0 px-4">
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{tHero('who')}</div>
                                    <div className="text-sm font-medium text-gray-400">{tHero('addGuests')}</div>
                                </div>
                                
                                {/* Search Button */}
                                <button className="ml-2 w-10 h-10 bg-[#F5A623] hover:bg-[#E09000] rounded-full flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105 shadow-md">
                                    <MagnifyingGlass weight="bold" className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Owner/Host Buttons - Only shows when NOT scrolled significantly */
                        <div className={cn(
                            "hidden lg:flex items-center gap-3 ml-auto mr-4 transition-opacity duration-300",
                            showNavButtons ? "opacity-100" : "opacity-0 pointer-events-none"
                        )}>
                            <button
                                onClick={() => router.push((session?.user?.role === 'admin' || session?.user?.role === 'sub-admin') ? "/web-admin" : "/profile")}
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

                        {/* Notifications - Desktop */}
                        {session && (
                            <NotificationDropdown className="hidden md:block" />
                        )}

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
                                            { label: t('manage'), icon: GearSix, href: (session?.user?.role === 'admin' || session?.user?.role === 'sub-admin') ? "/web-admin" : "/profile" },
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
                        <div className="flex md:hidden items-center gap-2">
                            {/* Mobile Language Toggle */}
                            <button
                                onClick={() => handleLanguageChange(locale === 'en' ? 'ar' : 'en')}
                                className={cn(
                                    "flex items-center justify-center w-9 h-9 rounded-full font-semibold text-xs transition-all duration-300",
                                    showSolid
                                        ? "bg-gray-100 text-[#1C1C1C] hover:bg-gray-200"
                                        : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                                )}
                            >
                                {locale === 'en' ? 'AR' : 'EN'}
                            </button>
                            <button
                                ref={burgerRef}
                                onClick={() => setMenuOpen(!menuOpen)}
                                className={cn(
                                    "flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300",
                                    showSolid
                                        ? "bg-gray-100 text-[#1C1C1C] hover:bg-gray-200"
                                        : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                                )}
                            >
                                <List weight="bold" className="w-5 h-5" />
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300" onClick={() => setMenuOpen(false)}>
                    <div
                        ref={mobileMenuRef}
                        className="absolute right-0 top-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-[#1C1C1C]">{t('menu')}</h2>
                            </div>
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                <X weight="bold" className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Mobile Search Button */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    setShowSearchModal(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors"
                            >
                                <MagnifyingGlass weight="bold" className="w-5 h-5 text-[#F5A623]" />
                                <span className="text-sm text-gray-600">{tHero('searchDestinations')}</span>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
                            {!session ? (
                                    <button
                                        onClick={() => handleMenuItemClick('/auth/signin')}
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
                                { label: t('manage'), icon: GearSix, href: (session?.user?.role === 'admin' || session?.user?.role === 'sub-admin') ? "/web-admin" : "/profile" },
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
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 safe-area-bottom">
                            <div className="flex items-center justify-center gap-4">
                                {["AED", "USD", "EUR"].map(c => (
                                    <button key={c} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-[#F5A623] hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
        </header>
    );
}
