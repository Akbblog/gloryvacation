import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

export async function GET() {
    try {
        // Test MongoDB connection
        await connectDB();

        // Test basic property count
        const Property = (await import("@/models/Property")).Property;
        const count = await Property.countDocuments({ isActive: true });

        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            mongodb: "connected",
            properties: count,
            environment: process.env.NODE_ENV,
            nextauth_url: process.env.NEXTAUTH_URL ? "set" : "not set"
        });
    } catch (error) {
        console.error("Health check failed:", error);
        return NextResponse.json({
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}