import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NotificationService } from "@/lib/notifications/NotificationService";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { sendNewBookingNotification } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Please sign in to make a booking" }, { status: 401 });
        }

        const body = await req.json();
        const { propertyId, checkIn, checkOut, guests, totalPrice, guestDetails } = body;

        if (!propertyId || !checkIn || !checkOut || !guests || !totalPrice || !guestDetails) {
            return NextResponse.json({ message: "Missing required booking fields" }, { status: 400 });
        }

        await connectDB();

        const booking = await Booking.create({
            property: propertyId,
            guest: session.user.id,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests,
            totalPrice,
            guestDetails,
            status: "pending",
            paymentStatus: "pending",
        });

        // Notify the property owner about the new booking
        try {
            const property = await Property.findById(propertyId);
            const guest = await User.findById(session.user.id);

            if (property && guest) {
                await NotificationService.notifyNewBooking(
                    property.host.toString(),
                    property.title,
                    guest.name || "Guest"
                );
                // Also notify web admins in-app
                try {
                    void NotificationService.notifyAdmins({
                        title: "New Booking Request",
                        message: `${guest.name || "Guest"} requested to book \"${property.title}\" (property ID: ${propertyId}).`,
                        type: "info",
                        relatedType: "booking",
                        relatedId: booking._id.toString(),
                    });
                } catch (e) {
                    console.error("Error sending admin booking notification:", e);
                }

                const bookingMailSent = await sendNewBookingNotification({
                    bookingId: booking._id.toString(),
                    guestName: guestDetails.name || guest.name || "Guest",
                    guestEmail: guestDetails.email || guest.email || "",
                    guestPhone: guestDetails.phone || "",
                    propertyTitle: property.title || "Property",
                    propertyId,
                    checkIn: booking.checkIn ? new Date(booking.checkIn).toISOString().slice(0, 10) : String(checkIn),
                    checkOut: booking.checkOut ? new Date(booking.checkOut).toISOString().slice(0, 10) : String(checkOut),
                    guests: booking.guests || guests,
                    totalPrice: booking.totalPrice || totalPrice,
                    status: booking.status || "pending",
                });

                if (!bookingMailSent) {
                    console.warn(`Booking email notification was not sent for booking ${booking._id}`);
                }
            }
        } catch (notificationError) {
            console.error("Error sending new booking notification:", notificationError);
            // Don't fail booking creation if notification fails
        }

        return NextResponse.json({ message: "Booking created successfully", booking }, { status: 201 });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json({ message: "Failed to create booking" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Get bookings for the current user
        const bookings = await Booking.find({ guest: session.user.id })
            .populate("property", "title images location pricePerNight")
            .sort({ createdAt: -1 });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 });
    }
}
