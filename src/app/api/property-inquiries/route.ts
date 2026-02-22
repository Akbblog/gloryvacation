import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { PropertyInquiry } from "@/models/PropertyInquiry";
import { NotificationService } from "@/lib/notifications/NotificationService";
import { sendPropertySubmissionNotification } from "@/lib/email";

interface PropertyInquiryPayload {
    ownerName?: unknown;
    email?: unknown;
    phone?: unknown;
    propertyType?: unknown;
    bedrooms?: unknown;
    location?: unknown;
    message?: unknown;
}

function normalizeString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as PropertyInquiryPayload;

        const ownerName = normalizeString(body.ownerName);
        const email = normalizeString(body.email);
        const phone = normalizeString(body.phone);
        const propertyType = normalizeString(body.propertyType);
        const bedrooms = normalizeString(body.bedrooms);
        const location = normalizeString(body.location);
        const message = normalizeString(body.message);

        if (!ownerName || !email || !phone || !propertyType || !bedrooms || !location) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        if (!EMAIL_PATTERN.test(email)) {
            return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
        }

        await connectDB();

        const inquiry = await PropertyInquiry.create({
            ownerName,
            email,
            phone,
            propertyType,
            bedrooms,
            location,
            message: message || undefined,
            status: "new",
        });

        try {
            void NotificationService.notifyAdmins({
                title: "New Property Submission",
                message: `${ownerName} submitted a property inquiry (${propertyType}, ${bedrooms} bedroom, ${location}).`,
                type: "info",
                relatedType: "inquiry",
                relatedId: inquiry._id.toString(),
            });
        } catch (notificationError) {
            console.error("Error creating in-app property inquiry notification:", notificationError);
        }

        void sendPropertySubmissionNotification({
            inquiryId: inquiry._id.toString(),
            ownerName,
            email,
            phone,
            propertyType,
            bedrooms,
            location,
            message: message || undefined,
        });

        return NextResponse.json(
            { message: "Property inquiry submitted successfully", inquiryId: inquiry._id.toString() },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating property inquiry:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
