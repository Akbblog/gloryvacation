import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Please sign in to make a booking" }, { status: 401 });
        }

        const body = await req.json();
        const { propertyId, checkIn, checkOut, guests, totalPrice, guestDetails } = body;

        if (!propertyId || !checkIn || !checkOut || !guests || !totalPrice || !guestDetails) {
            return NextResponse.json({ message: "Missing required booking fields" }, { status: 400 });
        }

        await connectDB();

        const booking = await Booking.create({
            property: propertyId,
            guest: session.user.id,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests,
            totalPrice,
            guestDetails,
            status: "pending",
            paymentStatus: "pending",
        });

        return NextResponse.json({ message: "Booking created successfully", booking }, { status: 201 });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json({ message: "Failed to create booking" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Get bookings for the current user
        const bookings = await Booking.find({ guest: session.user.id })
            .populate("property", "title images location pricePerNight")
            .sort({ createdAt: -1 });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 });
    }
}
