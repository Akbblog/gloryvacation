import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, context: any) {
    try {
        const session = await getServerSession(authOptions as any) as any;
        const userRole = session?.user?.role;
        if (!session || (userRole !== 'admin' && userRole !== 'sub-admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        // `context.params` may be a plain object or a Promise depending on Next.js internals.
        const rawParams = context?.params;
        const params = rawParams && typeof rawParams.then === 'function' ? await rawParams : rawParams;
        const id = params?.id;
        const property = await Property.findById(id).lean();
        if (!property) {
            return NextResponse.json({ message: 'Property not found' }, { status: 404 });
        }

        return NextResponse.json(property);
    } catch (error) {
        console.error('Error fetching property', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
