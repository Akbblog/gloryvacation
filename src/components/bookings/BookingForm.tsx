"use client";

import { Button } from "@/components/ui/Button";
import { Star, Calendar } from "lucide-react";
import { useState } from "react";
import { mutate } from 'swr';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BookingFormProps {
    propertyId: string;
    maxGuests?: number;
}

export function BookingForm({ propertyId, maxGuests = 4 }: BookingFormProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [guests, setGuests] = useState(1);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [loading, setLoading] = useState(false);
    const [guestDetails, setGuestDetails] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const nights = checkIn && checkOut
        ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Pricing is intentionally hidden. Reservations do not include price/payment.

    const handleReserve = async () => {
        if (!session) {
            router.push("/auth/signin");
            return;
        }

        if (!checkIn || !checkOut || nights <= 0) {
            alert("Please select valid check-in and check-out dates");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyId,
                    checkIn,
                    checkOut,
                    durationNights: nights,
                    guests,
                    notes: "",
                    guestDetails: {
                        name: guestDetails.name || session.user?.name,
                        email: guestDetails.email || session.user?.email,
                        phone: guestDetails.phone || "",
                    },
                }),
            });

            if (res.ok) {
                // revalidate reservations list
                await mutate('/api/reservations');
                alert("Reservation request submitted! Our team will contact you shortly.");
                router.push("/profile");
            } else {
                const error = await res.json();
                alert(error.message || "Failed to create reservation");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl shadow-xl p-4 bg-white sticky top-24 w-full max-w-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="text-sm text-gray-600">Request a reservation — pricing will be provided after contact</div>
                </div>
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <div className="text-sm font-semibold">4.9</div>
                </div>
            </div>

            <div className="border border-gray-100 rounded-lg mb-4 bg-white overflow-hidden">
                <div className="grid grid-cols-2 gap-0 border-b border-gray-100">
                    <div className="p-3">
                        <label className="block text-[11px] font-semibold text-gray-600">Check In</label>
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full text-sm outline-none text-gray-800 bg-transparent mt-1"
                        />
                        {!checkIn && <div className="text-[11px] text-gray-400 mt-1">Add Date</div>}
                    </div>
                    <div className="p-3">
                        <label className="block text-[11px] font-semibold text-gray-600">Check Out</label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || new Date().toISOString().split("T")[0]}
                            className="w-full text-sm outline-none text-gray-800 bg-transparent mt-1"
                        />
                        {!checkOut && <div className="text-[11px] text-gray-400 mt-1">Add Date</div>}
                    </div>
                </div>
                <div className="p-3">
                    <label className="block text-[11px] font-semibold text-gray-600">Guests</label>
                    <select
                        className="w-full text-sm outline-none bg-transparent text-gray-800 py-1 mt-1"
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                    >
                        {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                            <option key={num} value={num}>{num} Guest{num > 1 ? "s" : ""}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={handleReserve}
                disabled={loading || nights <= 0}
                className={`w-full py-3 rounded-lg font-semibold text-white mb-4 transition ${session ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-100 text-white/80 cursor-pointer'}`}
            >
                {loading ? "Processing..." : session ? "Request Reservation" : "Sign in to Request"}
            </button>

            {nights > 0 ? (
                    <div className="text-sm text-gray-700">
                        <div className="text-gray-500 text-xs mb-3">Our team will contact you with availability and pricing.</div>
                    </div>
            ) : (
                <div className="text-center py-6 text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-sm">Select dates to request a reservation</div>
                </div>
            )}
        </div>
    );
}
