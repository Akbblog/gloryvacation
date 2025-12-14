"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Home, Calendar, Users, Settings, LogOut, PlusCircle, ChevronRight, MessageSquare } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Listings", href: "/admin/listings", icon: Home },
    { name: "Add Property", href: "/admin/listings/add", icon: PlusCircle },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" });
    };

    return (
        <div className="hidden md:flex flex-col w-72 bg-gradient-to-b from-[#0F4C45] to-[#0A3630] min-h-screen text-white shadow-xl">
            {/* Logo Header */}
            <div className="p-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Home className="w-6 h-6 text-[#F5A623]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-tight">Glory Vacation</h2>
                        <p className="text-xs text-white/60">Admin Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1.5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-4 mb-3">Menu</p>
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? "bg-white/15 text-white shadow-lg"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isActive ? "bg-[#F5A623]" : "bg-white/10 group-hover:bg-white/15"} transition-colors`}>
                                    <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-white/80"}`} />
                                </div>
                                <span className="font-medium">{item.name}</span>
                            </div>
                            {isActive && <ChevronRight className="w-4 h-4 text-white/60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User & Sign Out */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                >
                    <div className="p-2 rounded-lg bg-white/10">
                        <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>

            {/* Decorative Element */}
            <div className="p-4">
                <div className="bg-gradient-to-r from-[#F5A623]/20 to-[#F5A623]/5 rounded-xl p-4 border border-[#F5A623]/20">
                    <p className="text-sm font-medium text-white/90 mb-1">Need Help?</p>
                    <p className="text-xs text-white/60 mb-3">Contact support or view documentation</p>
                    <Link href="/contact" className="text-xs font-semibold text-[#F5A623] hover:underline">
                        Get Support →
                    </Link>
                </div>
            </div>
        </div>
    );
}
