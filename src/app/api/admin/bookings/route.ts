import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Allow main admins or sub-admins with the canViewBookings permission
        const isAdmin = session?.user?.role === "admin";
        const canView = session?.user?.role === "sub-admin" && session?.user?.permissions?.canViewBookings;
        if (!session || !(isAdmin || canView)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let query: any = {};
        if (status && status !== "all") {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate("property", "title images")
            .populate("guest", "name email")
            .sort({ createdAt: -1 });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Allow main admins or sub-admins with the canViewBookings permission to update status
        const isAdminPatch = session?.user?.role === "admin";
        const canViewPatch = session?.user?.role === "sub-admin" && session?.user?.permissions?.canViewBookings;
        if (!session || !(isAdminPatch || canViewPatch)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { bookingId, status } = await req.json();

        if (!bookingId || !status) {
            return NextResponse.json({ message: "Booking ID and status required" }, { status: 400 });
        }

        await connectDB();

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true }
        );

        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Booking updated", booking });
    } catch (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
