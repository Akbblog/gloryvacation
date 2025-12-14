import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Force rebuild comment

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let query = {};
        if (status === "pending") {
            query = { isApproved: false };
        } else if (status === "approved") {
            query = { isApproved: true };
        }

        const users = await User.find(query).select("-password").sort({ createdAt: -1 });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
