import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Reservation } from "@/models/Reservation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let query: any = {};
        if (status && status !== "all") query.status = status;

        const reservations = await Reservation.find(query).populate("property", "title images").populate("user", "name email").sort({ createdAt: -1 });

        return NextResponse.json(reservations);
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { reservationId, status } = await req.json();
        if (!reservationId || !status) {
            return NextResponse.json({ message: "reservationId and status required" }, { status: 400 });
        }

        await connectDB();

        const reservation = await Reservation.findByIdAndUpdate(reservationId, { status }, { new: true });
        if (!reservation) return NextResponse.json({ message: "Reservation not found" }, { status: 404 });

        return NextResponse.json({ message: "Reservation updated", reservation });
    } catch (error) {
        console.error("Error updating reservation:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
