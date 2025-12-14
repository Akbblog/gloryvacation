"use client";

import { Button } from "@/components/ui/Button";
import { Star, Calendar } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BookingFormProps {
    price: number;
    propertyId: string;
    maxGuests?: number;
}

export function BookingForm({ price, propertyId, maxGuests = 4 }: BookingFormProps) {
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

    const cleaningFee = 150;
    const serviceFee = Math.round(price * nights * 0.05);
    const total = (price * nights) + cleaningFee + serviceFee;

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
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyId,
                    checkIn,
                    checkOut,
                    guests,
                    totalPrice: total,
                    guestDetails: {
                        name: guestDetails.name || session.user?.name,
                        email: guestDetails.email || session.user?.email,
                        phone: guestDetails.phone || "",
                    },
                }),
            });

            if (res.ok) {
                alert("Booking request submitted! We'll confirm shortly.");
                router.push("/profile");
            } else {
                const error = await res.json();
                alert(error.message || "Failed to create booking");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border border-gray-200 rounded-2xl shadow-xl p-6 bg-white sticky top-24">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <span className="text-2xl font-bold text-[#1C1C1C]">AED {price.toLocaleString()}</span>
                    <span className="text-[#7E7E7E]"> / night</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-current text-[#F5A623]" />
                    <span className="font-semibold text-[#1C1C1C]">4.9</span>
                </div>
            </div>

            <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
                <div className="grid grid-cols-2 border-b border-gray-200 relative">
                    <div className="p-3 border-r border-gray-200 relative">
                        <label className="text-[10px] font-bold text-[#1C1C1C] uppercase tracking-wider block mb-0.5">Check In</label>
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full text-sm outline-none text-[#7E7E7E] bg-transparent p-0 placeholder:text-gray-400"
                        />
                        {!checkIn && <div className="text-[10px] text-gray-400 mt-0.5">Add Date</div>}
                    </div>
                    <div className="p-3 relative">
                        <label className="text-[10px] font-bold text-[#1C1C1C] uppercase tracking-wider block mb-0.5">Check Out</label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || new Date().toISOString().split("T")[0]}
                            className="w-full text-sm outline-none text-[#7E7E7E] bg-transparent p-0 placeholder:text-gray-400"
                        />
                        {!checkOut && <div className="text-[10px] text-gray-400 mt-0.5">Add Date</div>}
                    </div>
                </div>
                <div className="p-3 relative">
                    <label className="text-[10px] font-bold text-[#1C1C1C] uppercase tracking-wider block mb-0.5">Guests</label>
                    <select
                        className="w-full text-sm outline-none bg-transparent text-[#1C1C1C] py-1"
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                    >
                        {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                            <option key={num} value={num}>{num} Guest{num > 1 ? "s" : ""}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Button
                onClick={handleReserve}
                disabled={loading || nights <= 0}
                className="w-full bg-[#FCD5A3] hover:bg-[#FDBF75] text-white text-lg py-6 mb-4 rounded-xl font-bold disabled:opacity-50 shadow-sm transition-colors"
                style={{ color: 'white' }}
            >
                {loading ? "Processing..." : session ? "Reserve" : "Sign in to Reserve"}
            </Button>

            {nights > 0 && (
                <>
                    <p className="text-center text-sm text-[#7E7E7E] mb-4">You won't be charged yet</p>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#7E7E7E]">AED {price.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}</span>
                            <span className="text-[#1C1C1C]">AED {(price * nights).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#7E7E7E]">Cleaning fee</span>
                            <span className="text-[#1C1C1C]">AED {cleaningFee}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#7E7E7E]">Service fee</span>
                            <span className="text-[#1C1C1C]">AED {serviceFee}</span>
                        </div>

                        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                            <span className="text-[#1C1C1C]">Total</span>
                            <span className="text-[#1C1C1C]">AED {total.toLocaleString()}</span>
                        </div>
                    </div>
                </>
            )}

            {nights <= 0 && (
                <div className="text-center py-4">
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-[#7E7E7E]">Select dates to see pricing</p>
                </div>
            )}
        </div>
    );
}
