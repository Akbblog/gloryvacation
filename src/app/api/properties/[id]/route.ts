import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";

export async function GET(req: Request, context: any) {
    try {
        const params = await context?.params;
        const { id: slug } = params ?? {};
        if (!slug) return NextResponse.json({ message: 'Missing slug' }, { status: 400 });

        await connectDB();

        // Always fetch by slug (all listings now publish slug-based URLs)
        const property = await Property.findOne({ 
            slug,
            isActive: true, 
            $or: [
                { isApprovedByAdmin: true },
                { isApprovedByAdmin: { $exists: false } }
            ]
        }).populate({ path: 'host', select: 'name image' }).lean();

        if (!property) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        return NextResponse.json(property);
    } catch (error) {
        console.error('Error fetching property by id', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
