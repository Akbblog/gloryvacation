import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userRole = session.user.role;
        const userPermissions = session.user.permissions;

        // Check permissions
        if (userRole !== "admin" && userRole !== "sub-admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Sub-admins need specific permission
        if (userRole === "sub-admin" && !userPermissions?.canApproveUsers) {
            return NextResponse.json({ message: "Insufficient permissions" }, { status: 403 });
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
