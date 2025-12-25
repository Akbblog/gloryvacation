import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
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
        const propertyId = body.propertyId || body._id || body.id;
        if (!propertyId) {
            return NextResponse.json({ message: 'propertyId is required' }, { status: 400 });
        }

        await connectDB();

        // Remove any immutable keys
        const update = { ...body };
        delete update._id;
        delete update.id;
        delete update.propertyId;

        const updated = await Property.findByIdAndUpdate(propertyId, update, { new: true });
        if (!updated) {
            return NextResponse.json({ message: 'Property not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Property updated', property: updated });
    } catch (error) {
        console.error('Error updating property', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
