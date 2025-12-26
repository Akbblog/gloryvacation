import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Reservation } from "@/models/Reservation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendReservationStatusEmail } from "@/lib/email";
import { format } from "date-fns";

// GET - Fetch reservations with advanced filtering
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const priority = searchParams.get("priority");
        const search = searchParams.get("search");
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const stats = searchParams.get("stats") === "true";

        // Build query
        const query: Record<string, unknown> = {};
        
        if (status && status !== "all") {
            query.status = status;
        }
        
        if (priority && priority !== "all") {
            query.priority = priority;
        }

        if (dateFrom || dateTo) {
            query.checkIn = {};
            if (dateFrom) (query.checkIn as Record<string, unknown>).$gte = new Date(dateFrom);
            if (dateTo) (query.checkIn as Record<string, unknown>).$lte = new Date(dateTo);
        }

        // If stats requested, return statistics
        if (stats) {
            const [statusStats, priorityStats, total, recentCount] = await Promise.all([
                Reservation.aggregate([
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ]),
                Reservation.aggregate([
                    { $group: { _id: "$priority", count: { $sum: 1 } } }
                ]),
                Reservation.countDocuments(),
                Reservation.countDocuments({
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }),
            ]);

            const statusMap: Record<string, number> = {};
            statusStats.forEach((s: { _id: string; count: number }) => {
                statusMap[s._id] = s.count;
            });

            const priorityMap: Record<string, number> = {};
            priorityStats.forEach((p: { _id: string; count: number }) => {
                priorityMap[p._id] = p.count;
            });

            return NextResponse.json({
                total,
                recentCount,
                byStatus: statusMap,
                byPriority: priorityMap,
            });
        }

        // Build sort
        const sort: Record<string, 1 | -1> = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        // Execute query with pagination
        let queryBuilder = Reservation.find(query)
            .populate("property", "title images location pricePerNight")
            .populate("user", "name email phone")
            .populate("assignedTo", "name email")
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        // Search across fields
        if (search) {
            const searchRegex = new RegExp(search, "i");
            queryBuilder = Reservation.find({
                ...query,
                $or: [
                    { "guestDetails.name": searchRegex },
                    { "guestDetails.email": searchRegex },
                    { "guestDetails.phone": searchRegex },
                    { adminNotes: searchRegex },
                    { notes: searchRegex },
                ],
            })
                .populate("property", "title images location pricePerNight")
                .populate("user", "name email phone")
                .populate("assignedTo", "name email")
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);
        }

        const [reservations, totalCount] = await Promise.all([
            queryBuilder,
            Reservation.countDocuments(query),
        ]);

        return NextResponse.json({
            reservations,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// PATCH - Update reservation status/details with email notification
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { 
            reservationId, 
            status, 
            priority, 
            adminNotes,
            sendEmailNotification = true,
            customEmailMessage,
            internalTags,
            totalAmount,
        } = body;

        if (!reservationId) {
            return NextResponse.json({ message: "reservationId required" }, { status: 400 });
        }

        await connectDB();

        const reservation = await Reservation.findById(reservationId)
            .populate("property", "title images location");

        if (!reservation) {
            return NextResponse.json({ message: "Reservation not found" }, { status: 404 });
        }

        const updates: Record<string, unknown> = {};
        const previousStatus = reservation.status;

        // Update status
        if (status && status !== reservation.status) {
            updates.status = status;
            
            // Add to status history
            const historyEntry = {
                status,
                changedBy: session.user.id,
                changedAt: new Date(),
                note: customEmailMessage || undefined,
            };
            
            updates.$push = { statusHistory: historyEntry };
        }

        // Update priority
        if (priority && priority !== reservation.priority) {
            updates.priority = priority;
        }

        // Update admin notes
        if (adminNotes !== undefined) {
            updates.adminNotes = adminNotes;
        }

        // Update tags
        if (internalTags !== undefined) {
            updates.internalTags = internalTags;
        }

        // Update total amount
        if (totalAmount !== undefined) {
            updates.totalAmount = totalAmount;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ message: "No changes to apply" }, { status: 400 });
        }

        // Apply updates
        const updatedReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            updates,
            { new: true }
        )
            .populate("property", "title images location")
            .populate("user", "name email");

        // Send email notification if status changed
        let emailSent = false;
        if (status && status !== previousStatus && sendEmailNotification) {
            const property = updatedReservation?.property as { _id: string; title?: string } | undefined;
            
            emailSent = await sendReservationStatusEmail({
                guestName: updatedReservation?.guestDetails?.name || "Guest",
                guestEmail: updatedReservation?.guestDetails?.email || "",
                propertyTitle: property?.title || "Property",
                propertyId: property?._id?.toString() || "",
                checkIn: updatedReservation?.checkIn 
                    ? format(new Date(updatedReservation.checkIn), "MMMM d, yyyy") 
                    : "",
                checkOut: updatedReservation?.checkOut 
                    ? format(new Date(updatedReservation.checkOut), "MMMM d, yyyy") 
                    : undefined,
                guests: updatedReservation?.guests || 1,
                reservationId: reservationId,
                status,
                adminNote: customEmailMessage,
                totalAmount: updatedReservation?.totalAmount,
                currency: updatedReservation?.currency,
            });

            if (emailSent) {
                await Reservation.findByIdAndUpdate(reservationId, {
                    lastEmailSent: new Date(),
                    $inc: { emailCount: 1 },
                });
            }
        }

        return NextResponse.json({ 
            message: "Reservation updated", 
            reservation: updatedReservation,
            emailSent,
        });
    } catch (error) {
        console.error("Error updating reservation:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// POST - Bulk operations
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { action, reservationIds, status, sendEmails = false } = body;

        if (!action || !reservationIds || !Array.isArray(reservationIds)) {
            return NextResponse.json({ 
                message: "action and reservationIds array required" 
            }, { status: 400 });
        }

        await connectDB();

        let result: { modifiedCount: number; emailsSent?: number } = { modifiedCount: 0 };

        switch (action) {
            case "bulk_status_update":
                if (!status) {
                    return NextResponse.json({ message: "status required for bulk update" }, { status: 400 });
                }

                const reservations = await Reservation.find({ _id: { $in: reservationIds } })
                    .populate("property", "title");

                // Update all
                const updateResult = await Reservation.updateMany(
                    { _id: { $in: reservationIds } },
                    { 
                        status,
                        $push: {
                            statusHistory: {
                                status,
                                changedBy: session.user.id,
                                changedAt: new Date(),
                                note: "Bulk status update",
                            }
                        }
                    }
                );

                result.modifiedCount = updateResult.modifiedCount;

                // Send emails if requested
                if (sendEmails) {
                    let emailsSent = 0;
                    for (const res of reservations) {
                        const property = res.property as unknown as { _id: { toString: () => string }; title?: string } | undefined;
                        const sent = await sendReservationStatusEmail({
                            guestName: res.guestDetails?.name || "Guest",
                            guestEmail: res.guestDetails?.email || "",
                            propertyTitle: property?.title || "Property",
                            propertyId: property?._id?.toString?.() || "",
                            checkIn: res.checkIn ? format(new Date(res.checkIn), "MMMM d, yyyy") : "",
                            checkOut: res.checkOut ? format(new Date(res.checkOut), "MMMM d, yyyy") : undefined,
                            guests: res.guests || 1,
                            reservationId: res._id.toString(),
                            status,
                        });
                        if (sent) emailsSent++;
                    }
                    result.emailsSent = emailsSent;
                }
                break;

            case "bulk_delete":
                const deleteResult = await Reservation.deleteMany({ _id: { $in: reservationIds } });
                result.modifiedCount = deleteResult.deletedCount;
                break;

            case "export":
                const exportData = await Reservation.find({ _id: { $in: reservationIds } })
                    .populate("property", "title location")
                    .populate("user", "name email")
                    .lean();

                return NextResponse.json({ 
                    message: "Export data ready", 
                    data: exportData,
                    count: exportData.length,
                });

            default:
                return NextResponse.json({ message: "Unknown action" }, { status: 400 });
        }

        return NextResponse.json({ 
            message: `${action} completed`, 
            result,
        });
    } catch (error) {
        console.error("Error in bulk operation:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// DELETE - Delete single reservation
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const reservationId = searchParams.get("id");

        if (!reservationId) {
            return NextResponse.json({ message: "Reservation ID required" }, { status: 400 });
        }

        await connectDB();

        const deleted = await Reservation.findByIdAndDelete(reservationId);
        
        if (!deleted) {
            return NextResponse.json({ message: "Reservation not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Reservation deleted" });
    } catch (error) {
        console.error("Error deleting reservation:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
