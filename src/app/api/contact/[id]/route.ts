import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET single message
export async function GET(req: Request, { params }: any) {
    try {
        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === "admin";
        const isSubAdmin = session?.user?.role === "sub-admin";
        if (!session || !(isAdmin || isSubAdmin)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

        await connectDB();
        const message = await ContactMessage.findById(id).populate("property", "title images location");

        if (!message) {
            return NextResponse.json({ message: "Message not found" }, { status: 404 });
        }

        return NextResponse.json(message);
    } catch (error) {
        console.error("Error fetching contact message:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// PATCH - update message status
export async function PATCH(req: Request, { params }: any) {
    try {
        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === "admin";
        const isSubAdmin = session?.user?.role === "sub-admin";
        if (!session || !(isAdmin || isSubAdmin)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

        const body = await req.json();
        const { status, assignedTo } = body;

        await connectDB();

        const updateData: any = {};
        if (status) updateData.status = status;
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

        const message = await ContactMessage.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).populate("property", "title images location");

        if (!message) {
            return NextResponse.json({ message: "Message not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Updated successfully", data: message });
    } catch (error) {
        console.error("Error updating contact message:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: any) {
    try {
        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === "admin";
        const isSubAdmin = session?.user?.role === "sub-admin";
        if (!session || !(isAdmin || isSubAdmin)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

        await connectDB();
        await ContactMessage.findByIdAndDelete(id);

        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        console.error("Error deleting contact message:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
