import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { isRead } = body;

        await connectDB();

        const notification = await Notification.findOne({
            _id: id,
            userId: session.user.id,
        });

        if (!notification) {
            return NextResponse.json(
                { message: "Notification not found" },
                { status: 404 }
            );
        }

        if (typeof isRead === "boolean") {
            notification.isRead = isRead;
            await notification.save();
        }

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await connectDB();

        const notification = await Notification.findOneAndDelete({
            _id: id,
            userId: session.user.id,
        });

        if (!notification) {
            return NextResponse.json(
                { message: "Notification not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}