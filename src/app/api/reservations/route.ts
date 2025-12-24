import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Reservation } from "@/models/Reservation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Please sign in to make a reservation" }, { status: 401 });
        }

        const body = await req.json();
        const { propertyId, checkIn, checkOut, durationNights, guests, notes, guestDetails } = body;

        if (!propertyId || !checkIn || !guests || !guestDetails || !guestDetails.email) {
            return NextResponse.json({ message: "Missing required reservation fields" }, { status: 400 });
        }

        await connectDB();

        const reservation = await Reservation.create({
            property: propertyId,
            user: session.user.id,
            checkIn: new Date(checkIn),
            checkOut: checkOut ? new Date(checkOut) : undefined,
            durationNights: durationNights || undefined,
            guests,
            notes: notes || "",
            status: "pending",
            guestDetails: {
                name: guestDetails.name || session.user.name || "",
                email: guestDetails.email || session.user.email || "",
                phone: guestDetails.phone || "",
            },
        });

        return NextResponse.json({ message: "Reservation created", reservation }, { status: 201 });
    } catch (error) {
        console.error("Error creating reservation:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const reservations = await Reservation.find({ user: session.user.id }).populate("property", "title images location").sort({ createdAt: -1 });

        return NextResponse.json(reservations);
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
