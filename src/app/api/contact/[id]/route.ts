import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: Request, { params }: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

        await connectDB();
        await ContactMessage.findByIdAndDelete(id);

        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        console.error("Error deleting contact message:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
