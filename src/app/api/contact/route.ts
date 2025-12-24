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
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const messages = await ContactMessage.find().populate("property", "title").sort({ createdAt: -1 });
        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { message: "Name, email, subject, and message are required" },
                { status: 400 }
            );
        }

        await connectDB();

        const contactMessage = await ContactMessage.create({
            name,
            email,
            phone,
            subject,
            message,
        });

        return NextResponse.json(
            { message: "Message sent successfully", id: contactMessage._id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error saving contact message:", error);
        return NextResponse.json(
            { message: "Failed to send message" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { message: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}
