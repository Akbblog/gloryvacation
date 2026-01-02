import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Reservation } from "@/models/Reservation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";
import { NotificationService } from "@/lib/notifications/NotificationService";

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

        // attempt to notify team via webhook, fallback to SMTP email if configured
        // also create in-app notifications for web admins
        try {
            void NotificationService.notifyAdmins({
                title: "New Reservation Request",
                message: `${reservation.guestDetails?.name || 'Guest'} requested a reservation for property ${propertyId}. Reservation ID: ${reservation._id}`,
                type: "info",
                relatedType: "reservation",
                relatedId: reservation._id.toString(),
            });
        } catch (err) {
            console.error("Error creating in-app admin notification:", err);
        }

        const notifyTeam = async () => {
            const webhookUrl = process.env.RESERVATION_WEBHOOK_URL;
            const sendEmailIfConfigured = async (reason?: string) => {
                const smtpHost = process.env.SMTP_HOST;
                const smtpPort = process.env.SMTP_PORT;
                const smtpUser = process.env.SMTP_USER;
                const smtpPass = process.env.SMTP_PASS;
                const notifyTo = process.env.RESERVATION_NOTIFY_TO || process.env.ADMIN_EMAIL;
                const fromEmail = process.env.FROM_EMAIL || smtpUser;
                if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !notifyTo) return;

                try {
                    const transporter = nodemailer.createTransport({
                        host: smtpHost,
                        port: Number(smtpPort),
                        secure: Number(smtpPort) === 465, // true for 465, false for other ports
                        auth: { user: smtpUser, pass: smtpPass },
                    });

                    const subject = `New reservation request: ${reservation._id}` + (reason ? ` (${reason})` : "");
                    const text = `A new reservation was created.\n\nProperty: ${propertyId}\nUser: ${session.user.id}\nGuest: ${reservation.guestDetails?.name} <${reservation.guestDetails?.email}>\nCheck-in: ${reservation.checkIn?.toISOString?.()}\nCheck-out: ${reservation.checkOut?.toISOString?.()}\nGuests: ${reservation.guests}\nStatus: ${reservation.status}\n\nView in admin panel: /admin/reservations`;

                    await transporter.sendMail({
                        from: fromEmail,
                        to: notifyTo,
                        subject,
                        text,
                    });
                } catch (err) {
                    console.error("Failed to send reservation email:", err);
                }
            };

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

                    const res = await fetch(webhookUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    if (!res.ok) {
                        // webhook failed; try email fallback
                        await sendEmailIfConfigured("webhook_failed");
                    }
                } catch (err) {
                    console.error("Failed to send reservation webhook:", err);
                    await sendEmailIfConfigured("webhook_error");
                }
            } else {
                // no webhook configured — try email
                await sendEmailIfConfigured("no_webhook");
            }
        };

        // fire-and-forget notification
        void notifyTeam();

        return NextResponse.json({ message: "Reservation created", reservation }, { status: 201 });
    } catch (error) {
        console.error("Error creating reservation:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const reservations = await Reservation.find({ user: session.user.id }).populate("property", "title images location").sort({ createdAt: -1 });

        return NextResponse.json(reservations);
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
