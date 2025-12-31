import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { Booking } from "@/models/Booking";
import { Review } from "@/models/Review";
import { PendingUserDeletion } from "@/models/PendingUserDeletion";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions as any) as any;
        const userRole = session?.user?.role;
        const userPermissions = session?.user?.permissions;

        if (!session || (userRole !== 'admin' && userRole !== 'sub-admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Sub-admins cannot permanently delete
        if (userRole === 'sub-admin' && !userPermissions?.canPermanentDelete) {
            return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
        }

        const body = await req.json();
        const userId = body.userId || body.id;
        if (!userId) {
            return NextResponse.json({ message: 'userId is required' }, { status: 400 });
        }

        await connectDB();

        // If sub-admin, create pending deletion request
        if (userRole === 'sub-admin') {
            const userToDelete = await User.findById(userId);
            if (!userToDelete) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }

            // Check if already pending
            const existing = await PendingUserDeletion.findOne({
                userId,
                status: "pending"
            });
            if (existing) {
                return NextResponse.json({ message: 'Deletion already pending approval' }, { status: 400 });
            }

            const pendingDeletion = new PendingUserDeletion({
                userId,
                userEmail: userToDelete.email,
                userName: userToDelete.name,
                requestedBy: session.user.id,
                requestedByEmail: session.user.email,
                reason: body.reason,
            });

            await pendingDeletion.save();
            return NextResponse.json({ message: 'Deletion request submitted for approval' });
        }

        // Main admin can delete directly
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
