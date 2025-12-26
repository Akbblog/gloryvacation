import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId, revoke } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        await connectDB();

        // If revoke is true, set isApproved to false, otherwise set to true
        const isApproved = !revoke;
        const user = await User.findByIdAndUpdate(
            userId, 
            { isApproved }, 
            { new: true }
        ).select("-password");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const action = isApproved ? "approved" : "revoked";
        return NextResponse.json({ message: `User ${action} successfully`, user });
    } catch (error) {
        console.error("Error updating user approval:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
