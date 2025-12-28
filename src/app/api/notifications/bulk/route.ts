import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { action, notificationIds } = body;

        if (!action || !notificationIds || !Array.isArray(notificationIds)) {
            return NextResponse.json(
                { message: "Action and notificationIds array are required" },
                { status: 400 }
            );
        }

        await connectDB();

        let result;
        switch (action) {
            case "markAsRead":
                result = await Notification.updateMany(
                    {
                        _id: { $in: notificationIds },
                        userId: session.user.id,
                    },
                    { isRead: true }
                );
                break;

            case "markAsUnread":
                result = await Notification.updateMany(
                    {
                        _id: { $in: notificationIds },
                        userId: session.user.id,
                    },
                    { isRead: false }
                );
                break;

            case "delete":
                result = await Notification.deleteMany({
                    _id: { $in: notificationIds },
                    userId: session.user.id,
                });
                break;

            default:
                return NextResponse.json(
                    { message: "Invalid action" },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            message: `${action} completed`,
            modifiedCount: 'modifiedCount' in result ? result.modifiedCount : ('deletedCount' in result ? result.deletedCount : 0),
        });
    } catch (error) {
        console.error("Error in bulk notification operation:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}