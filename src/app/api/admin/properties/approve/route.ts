import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NotificationService } from "@/lib/notifications/NotificationService";

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

        const updated = await Property.findByIdAndUpdate(propertyId, { isActive: true, isApprovedByAdmin: true }, { new: true });
        if (!updated) {
            return NextResponse.json({ message: 'Property not found' }, { status: 404 });
        }

        // Send notification to the property owner
        try {
            await NotificationService.notifyPropertyApproved(
                updated.host.toString(),
                updated.title || "Property"
            );
        } catch (notificationError) {
            console.error("Error sending property approval notification:", notificationError);
            // Don't fail the approval if notification fails
        }

        return NextResponse.json({ message: 'Property approved', property: updated });
    } catch (error) {
        console.error('Error approving property', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
