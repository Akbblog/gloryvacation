import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { Booking } from "@/models/Booking";
import { Review } from "@/models/Review";
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
        const propertyId = body.propertyId || body.id;
        if (!propertyId) {
            return NextResponse.json({ message: 'propertyId is required' }, { status: 400 });
        }

        await connectDB();

        // Remove bookings and reviews for the property, then delete the property
        await Booking.deleteMany({ property: propertyId });
        await Review.deleteMany({ property: propertyId });
        const deleted = await Property.findByIdAndDelete(propertyId);
        if (!deleted) {
            return NextResponse.json({ message: 'Property not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Property and related data deleted' });
    } catch (error) {
        console.error('Error deleting property', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
