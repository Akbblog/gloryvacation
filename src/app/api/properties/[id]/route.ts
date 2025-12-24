import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";

export async function GET(req: Request, context: any) {
    try {
        const params = await context?.params;
        const { id } = params ?? {};
        if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 });

        await connectDB();

        // Try ObjectId lookup first when id looks like a 24-hex string, otherwise fall back to slug
        let property: any = null;
        const isObjectId = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

        if (isObjectId) {
            property = await Property.findById(id).populate({ path: 'host', select: 'name image' }).lean();
        }

        if (!property) {
            property = await Property.findOne({ slug: id }).populate({ path: 'host', select: 'name image' }).lean();
        }

        if (!property) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        return NextResponse.json(property);
    } catch (error) {
        console.error('Error fetching property by id', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
