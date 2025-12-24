"use client";

import { useEffect, useState } from "react";
import useSWR from 'swr';
import { format } from "date-fns";
import { Calendar, Search, Filter, Download, Eye, CheckCircle, XCircle, Trash } from "lucide-react";

interface Booking {
    _id: string;
    property: {
        _id: string;
        title: string;
        images: string[];
    };
    guest: {
        _id: string;
        name: string;
        email: string;
    };
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: string;
    guestDetails: {
        name: string;
        email: string;
        phone: string;
    };
    createdAt: string;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const fetcher = (url: string) => fetch(url).then((res) => res.json());

    const apiKey = statusFilter === 'all' ? '/api/admin/bookings' : `/api/admin/bookings?status=${statusFilter}`;
    const { data: bookingsData, mutate } = useSWR<Booking[]>(apiKey, fetcher, { shouldRetryOnError: false });
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => setLoading(false), [statusFilter]);

    const updateBookingStatus = async (bookingId: string, status: string) => {
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, status }),
            });
            if (res.ok) {
                await mutate();
            }
        } catch (error) {
            console.error("Failed to update booking", error);
        }
    };

    const handleDeleteBooking = async (bookingId: string) => {
        if (!confirm('Delete this booking?')) return;
        try {
            const res = await fetch('/api/admin/bookings/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId }),
            });
            if (res.ok) {
                await mutate();
            } else {
                const data = await res.json();
                console.error('Delete booking failed', data);
                alert('Failed to delete booking: ' + (data?.message || res.status));
            }
        } catch (error) {
            console.error('Failed to delete booking', error);
        }
    };

    const filteredBookings = (bookingsData || []).filter((booking) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            booking.property?.title?.toLowerCase().includes(query) ||
            booking.guest?.name?.toLowerCase().includes(query) ||
            booking.guestDetails?.name?.toLowerCase().includes(query) ||
            booking.guestDetails?.email?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h1 className="text-2xl font-bold text-[#1C1C1C]">Bookings Management</h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by property or guest..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary bg-white"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-[#7E7E7E]">Loading bookings...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Property</th>
                                    <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Guest</th>
                                    <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Dates</th>
                                    <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Total</th>
                                    <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Status</th>
                                    <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-[#7E7E7E]">No bookings found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-[#1C1C1C]">{booking.property?.title || "Property"}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-[#1C1C1C]">{booking.guest?.name || booking.guestDetails?.name}</p>
                                                    <p className="text-xs text-[#7E7E7E]">{booking.guest?.email || booking.guestDetails?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#7E7E7E]">
                                                <p>{format(new Date(booking.checkIn), "MMM d, yyyy")}</p>
                                                <p className="text-xs">to {format(new Date(booking.checkOut), "MMM d, yyyy")}</p>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-[#1C1C1C]">
                                                AED {booking.totalPrice?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                            booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}>
                                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {booking.status === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => updateBookingStatus(booking._id, "confirmed")}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Confirm"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => updateBookingStatus(booking._id, "cancelled")}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-colors" title="View">
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBooking(booking._id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
