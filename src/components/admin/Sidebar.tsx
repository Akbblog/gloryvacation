"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Home, Calendar, ClipboardList, Users, Settings, LogOut, PlusCircle, ChevronRight, MessageSquare, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Listings", href: "/admin/listings", icon: Home },
    { name: "Add Property", href: "/admin/listings/add", icon: PlusCircle },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Reservations", href: "/admin/reservations", icon: ClipboardList },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" });
    };

    const handleNavClick = () => {
        if (onClose) onClose();
    };

    const sidebarContent = (
        <>
            {/* Logo Header */}
            <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3" onClick={handleNavClick}>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Home className="w-5 h-5 md:w-6 md:h-6 text-[#F5A623]" />
                    </div>
                    <div>
                        <h2 className="text-base md:text-lg font-bold tracking-tight">Glory Vacation</h2>
                        <p className="text-[10px] md:text-xs text-white/60">Admin Panel</p>
                    </div>
                </Link>
                {/* Close button for mobile */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] md:text-xs font-semibold text-white/40 uppercase tracking-wider px-3 md:px-4 mb-2 md:mb-3">Menu</p>
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={handleNavClick}
                            className={cn(
                                "flex items-center justify-between gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-white/15 text-white shadow-lg"
                                    : "text-white/70 hover:bg-white/10 hover:text-white active:scale-[0.98]"
                            )}
                        >
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className={cn(
                                    "p-1.5 md:p-2 rounded-lg transition-colors",
                                    isActive ? "bg-[#F5A623]" : "bg-white/10 group-hover:bg-white/15"
                                )}>
                                    <item.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4", isActive ? "text-white" : "text-white/80")} />
                                </div>
                                <span className="font-medium text-sm md:text-base">{item.name}</span>
                            </div>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User & Sign Out */}
            <div className="p-3 md:p-4 border-t border-white/10">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 w-full rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 active:scale-[0.98]"
                >
                    <div className="p-1.5 md:p-2 rounded-lg bg-white/10">
                        <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                    <span className="font-medium text-sm md:text-base">Sign Out</span>
                </button>
            </div>

            {/* Decorative Element - Hidden on mobile */}
            <div className="hidden md:block p-4">
                <div className="bg-gradient-to-r from-[#F5A623]/20 to-[#F5A623]/5 rounded-xl p-4 border border-[#F5A623]/20">
                    <p className="text-sm font-medium text-white/90 mb-1">Need Help?</p>
                    <p className="text-xs text-white/60 mb-3">Contact support or view documentation</p>
                    <Link href="/contact" className="text-xs font-semibold text-[#F5A623] hover:underline">
                        Get Support →
                    </Link>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col w-64 lg:w-72 bg-gradient-to-b from-[#0F4C45] to-[#0A3630] min-h-screen text-white shadow-xl flex-shrink-0">
                {sidebarContent}
            </div>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    {/* Sidebar */}
                    <div className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-[#0F4C45] to-[#0A3630] text-white shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
}

// Mobile Header Component
export function MobileAdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname();
    
    // Get current page title
    const getPageTitle = () => {
        const currentItem = MENU_ITEMS.find(item => 
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
        );
        return currentItem?.name || "Admin";
    };

    return (
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-40">
            <button
                onClick={onMenuClick}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors active:scale-95"
            >
                <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-[#1C1C1C]">{getPageTitle()}</h1>
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Home className="w-5 h-5" />
            </Link>
        </header>
    );
}
