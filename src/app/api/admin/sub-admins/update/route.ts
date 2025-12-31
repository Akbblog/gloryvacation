import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.email !== "akb@tool.com") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { subAdminId, permissions, name, phone } = await req.json();

        if (!subAdminId) {
            return NextResponse.json({ message: "Sub-admin ID is required" }, { status: 400 });
        }

        await connectDB();

        const updateData: any = {};
        if (permissions) {
            updateData.permissions = {
                canApproveUsers: permissions.canApproveUsers || false,
                canDeleteUsers: permissions.canDeleteUsers || false,
                canManageListings: permissions.canManageListings || false,
                canViewBookings: permissions.canViewBookings || false,
                canManageSettings: permissions.canManageSettings || false,
                canAccessMaintenance: false, // Never allow
                canPermanentDelete: false, // Never allow
            };
        }

        if (name) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;

        const updatedSubAdmin = await User.findByIdAndUpdate(
            subAdminId,
            updateData,
            { new: true }
        ).select("-password");

        if (!updatedSubAdmin) {
            return NextResponse.json({ message: "Sub-admin not found" }, { status: 404 });
        }

        return NextResponse.json(updatedSubAdmin);
    } catch (error) {
        console.error("Error updating sub-admin:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}