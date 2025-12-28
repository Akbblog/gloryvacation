import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const unreadOnly = searchParams.get("unreadOnly") === "true";

        const skip = (page - 1) * limit;

        let query: any = { userId: session.user.id };
        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            userId: session.user.id,
            isRead: false
        });

        return NextResponse.json({
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            unreadCount,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.role || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, message, type, userId, relatedId, relatedType, data } = body;

        if (!title || !message || !userId) {
            return NextResponse.json(
                { message: "Title, message, and userId are required" },
                { status: 400 }
            );
        }

        await connectDB();

        const notification = new Notification({
            title,
            message,
            type: type || "info",
            userId,
            relatedId,
            relatedType,
            data,
        });

        await notification.save();

        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        console.error("Error creating notification:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}