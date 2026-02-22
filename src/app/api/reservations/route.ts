import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Reservation } from "@/models/Reservation";
import { Property } from "@/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NotificationService } from "@/lib/notifications/NotificationService";
import { sendNewReservationNotification } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Please sign in to make a reservation" }, { status: 401 });
        }

        const body = await req.json();
        const { propertyId, checkIn, checkOut, durationNights, guests, notes, guestDetails } = body;

        if (!propertyId || !checkIn || !guests || !guestDetails || !guestDetails.email) {
            return NextResponse.json({ message: "Missing required reservation fields" }, { status: 400 });
        }

        await connectDB();

        const property = await Property.findById(propertyId).select("title").lean<{ title?: string }>();
        const propertyTitle = property?.title || "Property";

        const reservation = await Reservation.create({
            property: propertyId,
            user: session.user.id,
            checkIn: new Date(checkIn),
            checkOut: checkOut ? new Date(checkOut) : undefined,
            durationNights: durationNights || undefined,
            guests,
            notes: notes || "",
            status: "pending",
            guestDetails: {
                name: guestDetails.name || session.user.name || "",
                email: guestDetails.email || session.user.email || "",
                phone: guestDetails.phone || "",
            },
        });

        // Create in-app notifications for web admins.
        try {
            void NotificationService.notifyAdmins({
                title: "New Reservation Request",
                message: `${reservation.guestDetails?.name || "Guest"} requested a reservation for "${propertyTitle}". Reservation ID: ${reservation._id}`,
                type: "info",
                relatedType: "reservation",
                relatedId: reservation._id.toString(),
            });
        } catch (err) {
            console.error("Error creating in-app admin notification:", err);
        }

        const notifyTeam = async () => {
            const webhookUrl = process.env.RESERVATION_WEBHOOK_URL;

            if (webhookUrl) {
                try {
                    const payload = {
                        text: `New reservation request (${reservation._id})`,
                        reservation: {
                            id: reservation._id,
                            property: propertyId,
                            user: session.user.id,
                            checkIn: reservation.checkIn?.toISOString?.() || String(checkIn),
                            checkOut: reservation.checkOut?.toISOString?.() || String(checkOut),
                            guests: reservation.guests,
                            status: reservation.status,
                            guestEmail: reservation.guestDetails?.email,
                            guestName: reservation.guestDetails?.name,
                        },
                    };

                    const webhookResponse = await fetch(webhookUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    if (!webhookResponse.ok) {
                        console.error("Reservation webhook responded with non-OK status", webhookResponse.status);
                    }
                } catch (err) {
                    console.error("Failed to send reservation webhook:", err);
                }
            }

            const emailSent = await sendNewReservationNotification({
                guestName: reservation.guestDetails?.name || session.user.name || "Guest",
                guestEmail: reservation.guestDetails?.email || session.user.email || "",
                propertyTitle,
                propertyId,
                checkIn: reservation.checkIn ? new Date(reservation.checkIn).toISOString().slice(0, 10) : String(checkIn),
                checkOut: reservation.checkOut ? new Date(reservation.checkOut).toISOString().slice(0, 10) : undefined,
                guests: reservation.guests || guests,
                reservationId: reservation._id.toString(),
                status: "pending",
            });

            if (!emailSent) {
                console.warn(`Reservation email notification was not sent for reservation ${reservation._id}`);
            }
        };

        // Await notification tasks so SMTP/webhook work is completed reliably.
        await notifyTeam();

        return NextResponse.json({ message: "Reservation created", reservation }, { status: 201 });
    } catch (error) {
        console.error("Error creating reservation:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const reservations = await Reservation.find({ user: session.user.id })
            .populate("property", "title images location")
            .sort({ createdAt: -1 });

        return NextResponse.json(reservations);
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
