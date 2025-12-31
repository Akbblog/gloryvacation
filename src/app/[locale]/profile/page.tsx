"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from 'swr';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
    LogOut, Settings, Heart, Calendar, Home, Plus, LayoutDashboard, 
    MapPin, Loader2, Clock, CheckCircle, XCircle, MessageSquare, 
    ChevronRight, ExternalLink, RefreshCcw,
    Building, Users, ArrowRight, Sparkles
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "@/i18n/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Types
interface Reservation {
    _id: string;
    property?: {
        _id: string;
        title: string;
        images?: string[];
        location?: {
            area?: string;
            city?: string;
            address?: string;
        };
        pricePerNight?: number;
    };
    checkIn: string;
    checkOut?: string;
    guests: number;
    notes?: string;
    status: string;
    guestDetails?: {
        name: string;
        email: string;
        phone?: string;
    };
    totalAmount?: number;
    currency?: string;
    createdAt: string;
    updatedAt: string;
}

interface Booking {
    _id: string;
    property: {
        _id: string;
        title: string;
        location?: string;
        images: string[];
    };
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: string;
    guestDetails?: {
        name: string;
        email: string;
        phone?: string;
    };
    createdAt: string;
}

interface Property {
    _id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
    isActive: boolean;
}

// Status configurations
const reservationStatusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock; description: string }> = {
    pending: { 
        label: "Pending Review", 
        color: "text-amber-700", 
        bgColor: "bg-amber-50 border-amber-200", 
        icon: Clock,
        description: "Your request is being reviewed by our team"
    },
    contacted: { 
        label: "Contacted", 
        color: "text-blue-700", 
        bgColor: "bg-blue-50 border-blue-200", 
        icon: MessageSquare,
        description: "We've reached out with more information"
    },
    approved: { 
        label: "Approved", 
        color: "text-green-700", 
        bgColor: "bg-green-50 border-green-200", 
        icon: CheckCircle,
        description: "Your reservation has been approved!"
    },
    confirmed: { 
        label: "Confirmed", 
        color: "text-emerald-700", 
        bgColor: "bg-emerald-50 border-emerald-200", 
        icon: CheckCircle,
        description: "Your booking is confirmed and ready"
    },
    rejected: { 
        label: "Declined", 
        color: "text-red-700", 
        bgColor: "bg-red-50 border-red-200", 
        icon: XCircle,
        description: "Unfortunately, this request couldn't be accommodated"
    },
    cancelled: { 
        label: "Cancelled", 
        color: "text-gray-700", 
        bgColor: "bg-gray-50 border-gray-200", 
        icon: XCircle,
        description: "This reservation was cancelled"
    },
};

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("dashboard");

    // Fetch user data
    const { data: reservationsData, mutate: mutateReservations, isLoading: reservationsLoading } = useSWR<Reservation[]>(
        '/api/reservations', 
        fetcher, 
        { shouldRetryOnError: false }
    );
    
    const { data: bookingsData, mutate: mutateBookings, isLoading: bookingsLoading } = useSWR<Booking[]>(
        '/api/bookings', 
        fetcher, 
        { shouldRetryOnError: false }
    );
    
    const { data: propertiesData, mutate: mutateProperties } = useSWR<Property[]>(
        // @ts-ignore
        session?.user?.role === 'host' ? '/api/properties?myProperties=true' : null,
        fetcher,
        { shouldRetryOnError: false }
    );

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
        if (session?.user?.role === "admin" || session?.user?.role === "sub-admin") {
            router.push("/web-admin");
        }
    }, [status, router, session]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    const reservations = Array.isArray(reservationsData) ? reservationsData : [];
    const bookings = Array.isArray(bookingsData) ? bookingsData : [];

    // Stats calculations
    const pendingReservations = reservations.filter(r => r.status === 'pending').length;
    const approvedReservations = reservations.filter(r => ['approved', 'confirmed'].includes(r.status)).length;
    const activeBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;

    // Dashboard View
    const DashboardView = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <div className="relative bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl p-8 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-teal-100 text-sm font-medium">Welcome back</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Hello, {session.user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-teal-100">Track your reservations and manage your bookings all in one place.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                    onClick={() => setActiveTab("reservations")}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-teal-200 text-left group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{pendingReservations}</div>
                    <div className="text-sm text-gray-500">Pending Requests</div>
                </button>

                <button 
                    onClick={() => setActiveTab("reservations")}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-teal-200 text-left group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{approvedReservations}</div>
                    <div className="text-sm text-gray-500">Approved</div>
                </button>

                <button 
                    onClick={() => setActiveTab("bookings")}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-teal-200 text-left group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-teal-600" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{activeBookings}</div>
                    <div className="text-sm text-gray-500">Active Bookings</div>
                </button>

                <button 
                    onClick={() => setActiveTab("bookings")}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-teal-200 text-left group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{completedBookings}</div>
                    <div className="text-sm text-gray-500">Completed Stays</div>
                </button>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Reservations */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Recent Reservations</h3>
                        <button 
                            onClick={() => setActiveTab("reservations")}
                            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {reservations.length === 0 ? (
                            <div className="p-8 text-center">
                                <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No reservation requests yet</p>
                            </div>
                        ) : (
                            reservations.slice(0, 3).map((reservation) => {
                                const statusConfig = reservationStatusConfig[reservation.status] || reservationStatusConfig.pending;
                                const StatusIcon = statusConfig.icon;
                                
                                return (
                                    <div key={reservation._id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 relative overflow-hidden flex-shrink-0">
                                                {reservation.property?.images?.[0] ? (
                                                    <Image 
                                                        src={reservation.property.images[0]} 
                                                        alt={reservation.property.title || "Property"} 
                                                        fill 
                                                        className="object-cover" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Building className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">
                                                    {reservation.property?.title || "Property"}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {reservation.checkIn && format(new Date(reservation.checkIn), 'MMM d')}
                                                    {reservation.checkOut && ` - ${format(new Date(reservation.checkOut), 'MMM d')}`}
                                                </p>
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 text-xs font-medium mt-1 px-2 py-0.5 rounded-full border",
                                                    statusConfig.bgColor,
                                                    statusConfig.color
                                                )}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Upcoming Stays</h3>
                        <button 
                            onClick={() => setActiveTab("bookings")}
                            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {bookings.length === 0 ? (
                            <div className="p-8 text-center">
                                <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No upcoming stays</p>
                                <button 
                                    onClick={() => router.push('/')}
                                    className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                                >
                                    Browse Properties
                                </button>
                            </div>
                        ) : (
                            bookings.slice(0, 3).map((booking) => (
                                <div key={booking._id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 relative overflow-hidden flex-shrink-0">
                                            {booking.property?.images?.[0] ? (
                                                <Image 
                                                    src={booking.property.images[0]} 
                                                    alt={booking.property.title || "Property"} 
                                                    fill 
                                                    className="object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Building className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {booking.property?.title || "Property"}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {format(new Date(booking.checkIn), 'MMM d')} - {format(new Date(booking.checkOut), 'MMM d')}
                                            </p>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-xs font-medium mt-1 px-2 py-0.5 rounded-full",
                                                booking.status === 'confirmed' ? "bg-green-100 text-green-700" :
                                                booking.status === 'completed' ? "bg-purple-100 text-purple-700" :
                                                "bg-amber-100 text-amber-700"
                                            )}>
                                                {booking.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* CTA */}
            {reservations.length === 0 && bookings.length === 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 text-center border border-gray-100">
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Home className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ready for Your Next Adventure?</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Discover amazing vacation properties in Dubai and beyond. Your dream stay is just a click away!
                    </p>
                    <button 
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-medium hover:from-teal-600 hover:to-teal-700 transition-all hover:shadow-lg hover:shadow-teal-500/25"
                    >
                        Explore Properties
                    </button>
                </div>
            )}
        </div>
    );

    // Reservations View
    const ReservationsView = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Reservations</h2>
                    <p className="text-gray-500 text-sm mt-1">Track the status of your reservation requests</p>
                </div>
                <button 
                    onClick={() => mutateReservations()}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Refresh"
                >
                    <RefreshCcw className={cn("w-5 h-5 text-gray-500", reservationsLoading && "animate-spin")} />
                </button>
            </div>

            {/* Status Legend */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Status Guide</p>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(reservationStatusConfig).slice(0, 4).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                            <div key={key} className="flex items-center gap-2 text-sm">
                                <span className={cn("px-2 py-1 rounded-full border flex items-center gap-1", config.bgColor, config.color)}>
                                    <Icon className="w-3 h-3" />
                                    {config.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Reservations List */}
            {reservationsLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                            <div className="flex gap-6">
                                <div className="w-32 h-24 bg-gray-200 rounded-xl" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                    <div className="h-6 bg-gray-200 rounded w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : reservations.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reservations Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        When you request to book a property, your reservations will appear here.
                    </p>
                    <button 
                        onClick={() => router.push('/')}
                        className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-medium hover:from-teal-600 hover:to-teal-700 transition-all"
                    >
                        Browse Properties
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {reservations.map((reservation) => {
                        const statusConfig = reservationStatusConfig[reservation.status] || reservationStatusConfig.pending;
                        const StatusIcon = statusConfig.icon;
                        const isApproved = ['approved', 'confirmed'].includes(reservation.status);
                        
                        return (
                            <div 
                                key={reservation._id} 
                                className={cn(
                                    "bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-md",
                                    isApproved ? "border-green-200" : "border-gray-100"
                                )}
                            >
                                {/* Approved Banner */}
                                {isApproved && (
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-white text-sm font-medium flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Great news! Your reservation has been approved
                                    </div>
                                )}
                                
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Property Image */}
                                        <div className="w-full md:w-40 h-32 rounded-xl bg-gray-100 relative overflow-hidden flex-shrink-0">
                                            {reservation.property?.images?.[0] ? (
                                                <Image 
                                                    src={reservation.property.images[0]} 
                                                    alt={reservation.property.title || "Property"} 
                                                    fill 
                                                    className="object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Building className="w-10 h-10 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                        {reservation.property?.title || "Property"}
                                                    </h3>
                                                    {reservation.property?.location && (
                                                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                                                            <MapPin className="w-4 h-4" />
                                                            {reservation.property.location.area}, {reservation.property.location.city}
                                                        </p>
                                                    )}
                                                    
                                                    {/* Status Badge */}
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border",
                                                        statusConfig.bgColor,
                                                        statusConfig.color
                                                    )}>
                                                        <StatusIcon className="w-4 h-4" />
                                                        <span className="font-medium text-sm">{statusConfig.label}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1.5">{statusConfig.description}</p>
                                                </div>

                                                {/* View Property Link */}
                                                {reservation.property?._id && (
                                                    <Link 
                                                        href={`/listings/${reservation.property._id}`}
                                                        className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                                                    >
                                                        View Property <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                )}
                                            </div>

                                            {/* Booking Details Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Check-in</p>
                                                    <p className="font-medium text-gray-900">
                                                        {reservation.checkIn ? format(new Date(reservation.checkIn), 'MMM d, yyyy') : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Check-out</p>
                                                    <p className="font-medium text-gray-900">
                                                        {reservation.checkOut ? format(new Date(reservation.checkOut), 'MMM d, yyyy') : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Guests</p>
                                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                        {reservation.guests}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Requested</p>
                                                    <p className="font-medium text-gray-900">
                                                        {formatDistanceToNow(new Date(reservation.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {reservation.notes && (
                                                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Your Notes</p>
                                                    <p className="text-sm text-gray-600">{reservation.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer with reference */}
                                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                        Reference: {reservation._id.slice(-8).toUpperCase()}
                                    </span>
                                    {reservation.status === 'pending' && (
                                        <button 
                                            onClick={() => {
                                                if (confirm('Are you sure you want to cancel this reservation request?')) {
                                                    // Cancel logic would go here
                                                }
                                            }}
                                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Cancel Request
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // Bookings View
    const BookingsView = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                    <p className="text-gray-500 text-sm mt-1">Your confirmed and past stays</p>
                </div>
                <button 
                    onClick={() => mutateBookings()}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Refresh"
                >
                    <RefreshCcw className={cn("w-5 h-5 text-gray-500", bookingsLoading && "animate-spin")} />
                </button>
            </div>

            {bookingsLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                            <div className="flex gap-6">
                                <div className="w-48 h-32 bg-gray-200 rounded-xl" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                    <div className="h-6 bg-gray-200 rounded w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Once your reservations are approved and confirmed, they'll appear here as bookings.
                    </p>
                    {reservations.some(r => ['approved', 'confirmed'].includes(r.status)) && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-sm mx-auto">
                            <p className="text-sm text-green-700">
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                You have approved reservations! Check your reservations tab.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div 
                            key={booking._id} 
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                        >
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Property Image */}
                                    <div className="w-full md:w-48 h-32 rounded-xl bg-gray-100 relative overflow-hidden flex-shrink-0">
                                        {booking.property?.images?.[0] ? (
                                            <Image 
                                                src={booking.property.images[0]} 
                                                alt={booking.property.title} 
                                                fill 
                                                className="object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building className="w-10 h-10 text-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                    {booking.property?.title}
                                                </h3>
                                                {booking.property?.location && (
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {booking.property.location}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-semibold uppercase self-start",
                                                booking.status === 'confirmed' ? "bg-green-100 text-green-700" :
                                                booking.status === 'completed' ? "bg-purple-100 text-purple-700" :
                                                booking.status === 'cancelled' ? "bg-red-100 text-red-700" :
                                                "bg-amber-100 text-amber-700"
                                            )}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Check-in</p>
                                                <p className="font-medium text-gray-900">
                                                    {format(new Date(booking.checkIn), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Check-out</p>
                                                <p className="font-medium text-gray-900">
                                                    {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                            <div className="ml-auto text-right">
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Total</p>
                                                <p className="font-bold text-xl text-teal-600">
                                                    AED {booking.totalPrice?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                    Booking ID: {booking._id.slice(-8).toUpperCase()}
                                </span>
                                {booking.property?._id && (
                                    <Link 
                                        href={`/listings/${booking.property._id}`}
                                        className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                                    >
                                        View Property <ExternalLink className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
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
                        <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-gray-100">
                            <div className="relative w-20 h-20 mx-auto mb-4">
                                {session?.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        fill
                                        className="object-cover rounded-full ring-4 ring-teal-50"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-teal-500/20">
                                        {session?.user?.name?.[0] || "U"}
                                    </div>
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 mb-0.5">{session?.user?.name}</h2>
                            <p className="text-gray-500 text-sm mb-3">{session?.user?.email}</p>
                            <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                                {/* @ts-ignore */}
                                {session?.user?.role || "Guest"}
                            </span>
                        </div>

                        {/* Menu */}
                        <nav className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100">
                            <ul className="space-y-1">
                                {/* Dashboard */}
                                <li>
                                    <button
                                        onClick={() => setActiveTab("dashboard")}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                                            activeTab === "dashboard" 
                                                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20" 
                                                : "text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        Dashboard
                                    </button>
                                </li>

                                {/* Reservations - New Tab */}
                                <li>
                                    <button
                                        onClick={() => setActiveTab("reservations")}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all",
                                            activeTab === "reservations" 
                                                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20" 
                                                : "text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Clock className="w-5 h-5" />
                                            Reservations
                                        </span>
                                        {pendingReservations > 0 && (
                                            <span className={cn(
                                                "px-2 py-0.5 text-xs font-bold rounded-full",
                                                activeTab === "reservations" 
                                                    ? "bg-white/20 text-white" 
                                                    : "bg-amber-100 text-amber-700"
                                            )}>
                                                {pendingReservations}
                                            </span>
                                        )}
                                    </button>
                                </li>

                                {/* Bookings */}
                                <li>
                                    <button
                                        onClick={() => setActiveTab("bookings")}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all",
                                            activeTab === "bookings" 
                                                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20" 
                                                : "text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5" />
                                            My Bookings
                                        </span>
                                        {activeBookings > 0 && (
                                            <span className={cn(
                                                "px-2 py-0.5 text-xs font-bold rounded-full",
                                                activeTab === "bookings" 
                                                    ? "bg-white/20 text-white" 
                                                    : "bg-teal-100 text-teal-700"
                                            )}>
                                                {activeBookings}
                                            </span>
                                        )}
                                    </button>
                                </li>

                                {/* Favorites */}
                                <li>
                                    <button
                                        onClick={() => setActiveTab("favorites")}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                                            activeTab === "favorites" 
                                                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20" 
                                                : "text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <Heart className="w-5 h-5" />
                                        Favorites
                                    </button>
                                </li>

                                {/* Host-only options */}
                                {/* @ts-ignore */}
                                {session?.user?.role === "host" && (
                                    <>
                                        <div className="my-2 mx-4 border-t border-gray-100" />
                                        <li>
                                            <button
                                                onClick={() => setActiveTab("properties")}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                                                    activeTab === "properties" 
                                                        ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20" 
                                                        : "text-gray-600 hover:bg-gray-50"
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
                                                    activeTab === "add-property" ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20" : "text-gray-500 hover:bg-gray-50"
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
                                            activeTab === "settings" ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20" : "text-gray-500 hover:bg-gray-50"
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
                        {activeTab === "reservations" && <ReservationsView />}
                        {activeTab === "bookings" && <BookingsView />}
                        {activeTab === "favorites" && (
                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 animate-in fade-in">
                                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Heart className="w-8 h-8 text-red-300" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">My Favorites</h2>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                    Save properties you love and easily find them later.
                                </p>
                                <button 
                                    onClick={() => router.push('/')}
                                    className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-medium"
                                >
                                    Browse Properties
                                </button>
                            </div>
                        )}
                        {activeTab === "properties" && (
                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 animate-in fade-in">
                                <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 mb-2">My Properties</h2>
                                <p className="text-gray-500 mb-6">Manage your listed properties here.</p>
                                <button onClick={() => setActiveTab('add-property')} className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full">Add Property</button>
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
                                <div className="space-y-6 max-w-lg">
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-800">Personal Information</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1.5">Full Name</label>
                                            <input type="text" defaultValue={session.user?.name || ""} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50" disabled />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1.5">Email Address</label>
                                            <input type="email" defaultValue={session.user?.email || ""} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50" disabled />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h3 className="font-medium text-gray-800 mb-4">Account Type</h3>
                                        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {/* @ts-ignore */}
                                                    {(session.user?.role || 'guest').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    {/* @ts-ignore */}
                                                    <p className="font-semibold text-gray-900 capitalize">{session.user?.role || 'Guest'} Account</p>
                                                    <p className="text-sm text-gray-500">Member since {format(new Date(), 'MMMM yyyy')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
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
