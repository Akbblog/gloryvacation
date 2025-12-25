import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Force dynamic to prevent Next.js from caching API responses
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const hostId = searchParams.get("hostId");
        const all = searchParams.get("all");

        // If client requests a host's properties, require the requester to be the host or an admin.
        const session = await getServerSession(authOptions);

        let query: any = {};
        if (hostId) {
            if (!session || !session.user) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }
            const isAdmin = session.user.role === "admin";
            const isSelf = session.user.id === hostId;
            if (!isAdmin && !isSelf) {
                return NextResponse.json({ message: "Forbidden" }, { status: 403 });
            }
            query = { host: hostId };
        } else if (all === "1") {
            // Admin-only path to fetch all listings (active + inactive)
            if (!session || session.user?.role !== "admin") {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }
            query = {}; // no isActive filter
        } else {
            // Public listing endpoint - return active properties
            query = { isActive: true };
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

        // Basic validation (price is optional — platform hides pricing until contact)
        if (!body.title || !body.description) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        // Create property with current user as host
        // Properties are active immediately for testing
        // Only include pricePerNight if provided (avoid forcing 0 when empty)
        const toCreate: any = { ...body, host: session.user.id, isActive: true, isApprovedByAdmin: true };
        if (typeof body.pricePerNight !== 'undefined' && body.pricePerNight !== null) {
            toCreate.pricePerNight = body.pricePerNight;
        }

        const property = await Property.create(toCreate);

        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        console.error("Error creating property:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
