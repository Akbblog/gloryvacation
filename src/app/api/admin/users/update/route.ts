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

        const body = await req.json();
        const { userId, ...updates } = body;

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        await connectDB();

        // Validate role if being updated
        if (updates.role && !["guest", "host", "admin"].includes(updates.role)) {
            return NextResponse.json({ message: "Invalid role" }, { status: 400 });
        }

        // Get current user to check if they're trying to demote themselves
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Prevent admin from demoting themselves
        if (currentUser._id.toString() === session.user.id && updates.role && updates.role !== "admin") {
            return NextResponse.json({ message: "Cannot change your own admin role" }, { status: 403 });
        }

        // Build update object - only allow specific fields
        const allowedUpdates: any = {};
        if (updates.role) allowedUpdates.role = updates.role;
        if (typeof updates.isApproved === "boolean") allowedUpdates.isApproved = updates.isApproved;
        if (updates.name) allowedUpdates.name = updates.name;
        if (updates.phone !== undefined) allowedUpdates.phone = updates.phone;

        const user = await User.findByIdAndUpdate(
            userId,
            allowedUpdates,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User updated successfully", user });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
