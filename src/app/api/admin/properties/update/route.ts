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
        const updatePayload = { ...body };
        delete updatePayload._id;
        delete updatePayload.id;
        delete updatePayload.propertyId;

        // Convert explicit nulls into $unset operations so fields are removed when cleared
        const setOps: any = {};
        const unsetOps: any = {};
        for (const [k, v] of Object.entries(updatePayload)) {
            if (v === null) {
                unsetOps[k] = "";
            } else {
                setOps[k] = v;
            }
        }

        const mongoUpdate: any = {};
        if (Object.keys(setOps).length > 0) mongoUpdate.$set = setOps;
        if (Object.keys(unsetOps).length > 0) mongoUpdate.$unset = unsetOps;

        // Use validators and return the updated document
        let updated;
        try {
            updated = await Property.findByIdAndUpdate(propertyId, mongoUpdate, { new: true, runValidators: true });
        } catch (err: any) {
            // Handle duplicate key (e.g., slug) with a clear message
            if (err && err.code === 11000) {
                const field = Object.keys(err.keyValue || {}).join(', ');
                return NextResponse.json({ message: `Duplicate value for field(s): ${field}` }, { status: 409 });
            }
            console.error('Error during Property.findByIdAndUpdate', err);
            throw err;
        }

        if (!updated) {
            return NextResponse.json({ message: 'Property not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Property updated', property: updated });
    } catch (error) {
        console.error('Error updating property', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
