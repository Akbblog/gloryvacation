"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from 'swr';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { User, LogOut, Settings, Heart, Calendar, Home, Plus, LayoutDashboard, MapPin, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PropertyForm } from "@/components/properties/PropertyForm";

// Types
interface Booking {
    _id: string;
    property: {
        title: string;
        location: string;
        images: string[];
    };
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: string;
}

interface Property {
    _id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
    isActive: boolean;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(true);

    const fetcher = (url: string) => fetch(url).then((res) => res.json());

    const { data: bookingsData, mutate: mutateBookings } = useSWR<Booking[]>('/api/bookings', fetcher, { shouldRetryOnError: false });
    const { data: propertiesData, mutate: mutateProperties } = useSWR<Property[]>(
        session?.user?.role === 'host' ? '/api/properties?myProperties=true' : null,
        fetcher,
        { shouldRetryOnError: false }
    );

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
        setLoading(false);
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!session) return null;

    // View Components
    const DashboardView = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-[#1C1C1C] mb-2">Hello, {session.user?.name}!</h1>
                <p className="text-[#7E7E7E]">Welcome to your dashboard. Manage your bookings and profile here.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
                    <div className="text-4xl font-bold text-primary mb-1">{(bookingsData || []).length}</div>
                    <div className="text-[#7E7E7E] text-sm">Active Bookings</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
                    <div className="text-4xl font-bold text-primary mb-1">0</div>
                    <div className="text-[#7E7E7E] text-sm">Completed Stays</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
                    <div className="text-4xl font-bold text-primary mb-1">0</div>
                    <div className="text-[#7E7E7E] text-sm">Favorites</div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-center">
                {(bookingsData || []).length > 0 ? (
                    <div className="w-full text-left space-y-4">
                        <h3 className="text-xl font-bold text-[#1C1C1C]">Recent Bookings</h3>
                        <div className="space-y-4">
                            {(bookingsData || []).slice(0, 3).map((booking) => (
                                <div key={booking._id} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
                                        {/* Image placeholder */}
                                        <Image src={booking.property?.images?.[0] || "/placeholder.jpg"} alt="Property" fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1C1C1C]">{booking.property?.title || "Luxury Property"}</h4>
                                        <div className="text-sm text-gray-500 mb-1">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</div>
                                        <div className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md inline-block capitalize">{booking.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#1C1C1C] mb-2">No Recent Activity</h3>
                        <p className="text-[#7E7E7E] max-w-xs mb-6">
                            You haven't made any bookings yet. Start exploring our beautiful properties!
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
                        >
                            Browse Properties
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    const BookingsView = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#1C1C1C]">My Bookings</h2>
            {(bookingsData || []).length > 0 ? (
                <div className="grid gap-4">
                    {(bookingsData || []).map((booking) => (
                        <div key={booking._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-xl relative overflow-hidden flex-shrink-0">
                                <Image src={booking.property?.images?.[0] || "/placeholder.jpg"} alt={booking.property?.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1C1C1C] mb-1">{booking.property?.title}</h3>
                                        <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
                                            <MapPin className="w-4 h-4" /> {booking.property?.location || "Dubai, UAE"}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-semibold uppercase",
                                        booking.status === 'confirmed' ? "bg-green-100 text-green-700" :
                                            booking.status === 'cancelled' ? "bg-red-100 text-red-700" :
                                                "bg-yellow-100 text-yellow-700"
                                    )}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4 mt-2 pt-4 border-t border-gray-100">
                                    <div>
                                        <span className="text-xs text-gray-400 block uppercase tracking-wider">Check In</span>
                                        <span className="font-medium text-gray-800">{new Date(booking.checkIn).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-400 block uppercase tracking-wider">Check Out</span>
                                        <span className="font-medium text-gray-800">{new Date(booking.checkOut).toLocaleDateString()}</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-xs text-gray-400 block uppercase tracking-wider text-right">Total</span>
                                        <span className="font-bold text-primary text-lg">${booking.totalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No bookings yet</h3>
                    <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
                    <button onClick={() => router.push('/')} className="px-6 py-2 bg-primary text-white rounded-full">
                        Find a Place
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-20 md:py-32 max-w-[1240px]">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 space-y-6 flex-shrink-0">
                        {/* Profile Card */}
                        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
                            <div className="relative w-24 h-24 mx-auto mb-4">
                                {session?.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        fill
                                        className="object-cover rounded-full"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold">
                                        {session?.user?.name?.[0] || "U"}
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-[#1C1C1C] mb-1">{session?.user?.name}</h2>
                            <p className="text-[#7E7E7E] text-sm mb-4">{session?.user?.email}</p>
                            <span className="inline-block px-4 py-1.5 bg-[#F5F5F5] text-[#1C1C1C] text-xs font-semibold rounded-full uppercase tracking-wider">
                                {/* @ts-ignore */}
                                {session?.user?.role || "Guest"}
                            </span>
                        </div>

                        {/* Menu */}
                        <nav className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                                            activeTab === "dashboard" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        Dashboard
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab("bookings")}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                                            activeTab === "bookings" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <Calendar className="w-5 h-5" />
                                        My Bookings
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab("favorites")}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                                            activeTab === "favorites" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <Heart className="w-5 h-5" />
                                        Favorites
                                    </button>
                                </li>
                                {/* @ts-ignore */}
                                {session?.user?.role === "host" && (
                                    <>
                                        <li>
                                            <button
                                                onClick={() => setActiveTab("properties")}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                                                    activeTab === "properties" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:bg-gray-50"
                                                )}
                                            >
                                                <Home className="w-5 h-5" />
                                                My Properties
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => setActiveTab("add-property")}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                                                    activeTab === "add-property" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:bg-gray-50"
                                                )}
                                            >
                                                <Plus className="w-5 h-5" />
                                                List New Property
                                            </button>
                                        </li>
                                    </>
                                )}
                                <div className="my-2 border-t border-gray-100" />
                                <li>
                                    <button
                                        onClick={() => setActiveTab("settings")}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                                            activeTab === "settings" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <Settings className="w-5 h-5" />
                                        Settings
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* Main Content Area - Dynamic */}
                    <section className="flex-1 min-h-[500px]">
                        {activeTab === "dashboard" && <DashboardView />}
                        {activeTab === "bookings" && <BookingsView />}
                        {activeTab === "favorites" && (
                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 animate-in fade-in">
                                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 mb-2">My Favorites</h2>
                                <p className="text-gray-500">You haven't saved any properties yet.</p>
                            </div>
                        )}
                        {activeTab === "properties" && (
                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 animate-in fade-in">
                                <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 mb-2">My Properties</h2>
                                <p className="text-gray-500 mb-6">Manage your listed properties here.</p>
                                <button onClick={() => setActiveTab('add-property')} className="px-6 py-2 bg-primary text-white rounded-full">Add Property</button>
                            </div>
                        )}
                        {activeTab === "add-property" && (
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 animate-in fade-in">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">List a New Property</h2>
                                <PropertyForm
                                    onCancel={() => setActiveTab("properties")}
                                    onSuccess={() => {
                                        setActiveTab("properties");
                                        mutateProperties?.();
                                    }}
                                />
                            </div>
                        )}
                        {activeTab === "settings" && (
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 animate-in fade-in space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
                                <div className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input type="text" defaultValue={session.user?.name || ""} className="w-full p-3 rounded-xl border border-gray-200" disabled />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" defaultValue={session.user?.email || ""} className="w-full p-3 rounded-xl border border-gray-200" disabled />
                                    </div>
                                    <div className="pt-4">
                                        <button className="px-6 py-2 bg-gray-900 text-white rounded-full">Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
