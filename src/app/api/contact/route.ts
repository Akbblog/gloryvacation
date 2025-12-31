import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, message, subject, propertyId } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        const doc = await ContactMessage.create({
            name,
            email,
            phone: phone || "",
            subject: subject || `Property Inquiry`,
            message,
            property: propertyId || undefined,
            status: "new",
        });

        return NextResponse.json({ message: "Message received", doc }, { status: 201 });
    } catch (error) {
        console.error("Error creating contact message:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        // Allow main admins or any sub-admin (web-admin) to access messages
        const isAdmin = session?.user?.role === "admin";
        const isSubAdmin = session?.user?.role === "sub-admin";
        if (!session || !(isAdmin || isSubAdmin)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const hasProperty = searchParams.get("hasProperty");
        const stats = searchParams.get("stats");

        // Return stats only
        if (stats === "true") {
            const [total, newCount, readCount, repliedCount, closedCount, withProperty] = await Promise.all([
                ContactMessage.countDocuments(),
                ContactMessage.countDocuments({ status: "new" }),
                ContactMessage.countDocuments({ status: "read" }),
                ContactMessage.countDocuments({ status: "replied" }),
                ContactMessage.countDocuments({ status: "closed" }),
                ContactMessage.countDocuments({ property: { $exists: true, $ne: null } }),
            ]);

            return NextResponse.json({
                total,
                new: newCount,
                read: readCount,
                replied: repliedCount,
                closed: closedCount,
                withProperty,
            });
        }

        // Build filter
        const filter: any = {};

        if (status && status !== "all") {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } },
            ];
        }

        if (hasProperty === "true") {
            filter.property = { $exists: true, $ne: null };
        } else if (hasProperty === "false") {
            filter.$or = [{ property: { $exists: false } }, { property: null }];
        }

        const messages = await ContactMessage.find(filter)
            .populate("property", "title images location")
            .sort({ createdAt: -1 });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// Bulk operations
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { ids, status, action } = body;

        await connectDB();

        if (action === "bulkDelete" && ids?.length > 0) {
            await ContactMessage.deleteMany({ _id: { $in: ids } });
            return NextResponse.json({ message: `Deleted ${ids.length} messages` });
        }

        if (action === "bulkStatus" && ids?.length > 0 && status) {
            await ContactMessage.updateMany(
                { _id: { $in: ids } },
                { $set: { status } }
            );
            return NextResponse.json({ message: `Updated ${ids.length} messages to ${status}` });
        }

        return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error in bulk operation:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
