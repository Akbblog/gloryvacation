import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions as any) as any;
        const userRole = session?.user?.role;
        if (!session || userRole !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const bookingId = body.bookingId || body.id;
        if (!bookingId) {
            return NextResponse.json({ message: 'bookingId is required' }, { status: 400 });
        }

        await connectDB();

        const deleted = await Booking.findByIdAndDelete(bookingId);
        if (!deleted) {
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Booking deleted' });
    } catch (error) {
        console.error('Error deleting booking', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
