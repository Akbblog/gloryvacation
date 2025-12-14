import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const hostId = searchParams.get("hostId");

        let query = {};
        if (hostId) {
            query = { host: hostId };
        }

        const properties = await Property.find(query).sort({ createdAt: -1 });
        return NextResponse.json(properties);
    } catch (error) {
        console.error("Error fetching properties:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Basic validation
        if (!body.title || !body.description || !body.pricePerNight) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        // Create property with current user as host
        const property = await Property.create({
            ...body,
            host: session.user.id,
        });

        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        console.error("Error creating property:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
