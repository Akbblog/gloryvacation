import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";

// Temporary diagnostic route. Protect with DEBUG_TOOL_KEY env var.
export async function GET(req: Request) {
    const key = req.headers.get("x-debug-key");
    const expected = process.env.DEBUG_TOOL_KEY;
    if (!expected || !key || key !== expected) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ message: "id query param required" }, { status: 400 });

        await connectDB();

        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        let property: any = null;
        if (isObjectId) property = await Property.findById(id).lean();
        if (!property) property = await Property.findOne({ slug: id }).lean();

        if (!property) return NextResponse.json({ message: "not found" }, { status: 404 });

        return NextResponse.json({ property }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "internal error" }, { status: 500 });
    }
}
