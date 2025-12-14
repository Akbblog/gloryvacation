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
