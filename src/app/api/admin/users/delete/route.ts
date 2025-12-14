import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
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
        const userId = body.userId || body.id;
        if (!userId) {
            return NextResponse.json({ message: 'userId is required' }, { status: 400 });
        }

        await connectDB();

        // Delete properties hosted by user and related bookings/reviews
        const props = await Property.find({ host: userId }).select('_id');
        const propIds = props.map(p => p._id);

        if (propIds.length > 0) {
            await Booking.deleteMany({ property: { $in: propIds } });
            await Review.deleteMany({ property: { $in: propIds } });
            await Property.deleteMany({ _id: { $in: propIds } });
        }

        // Delete bookings and reviews made by user
        await Booking.deleteMany({ guest: userId });
        await Review.deleteMany({ guest: userId });

        // Finally delete the user
        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User and related data deleted' });
    } catch (error) {
        console.error('Error deleting user', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
