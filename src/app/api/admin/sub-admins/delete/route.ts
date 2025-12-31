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

        const { subAdminId } = await req.json();

        if (!subAdminId) {
            return NextResponse.json({ message: "Sub-admin ID is required" }, { status: 400 });
        }

        await connectDB();

        const deletedSubAdmin = await User.findByIdAndDelete(subAdminId);

        if (!deletedSubAdmin) {
            return NextResponse.json({ message: "Sub-admin not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Sub-admin deleted successfully" });
    } catch (error) {
        console.error("Error deleting sub-admin:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}