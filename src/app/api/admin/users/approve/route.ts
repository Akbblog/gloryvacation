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

        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findByIdAndUpdate(userId, { isApproved: true }, { new: true });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User approved successfully", user });
    } catch (error) {
        console.error("Error approving user:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
