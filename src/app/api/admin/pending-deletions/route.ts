import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { PendingUserDeletion } from "@/models/PendingUserDeletion";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { Booking } from "@/models/Booking";
import { Review } from "@/models/Review";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - List pending deletions (for main admin)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.email !== "akb@tool.com") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const pendingDeletions = await PendingUserDeletion.find({ status: "pending" })
            .populate("requestedBy", "name email")
            .sort({ createdAt: -1 });

        return NextResponse.json(pendingDeletions);
    } catch (error) {
        console.error("Error fetching pending deletions:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// POST - Request deletion (for sub-admins) or process deletion (for main admin)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId, action, reason } = await req.json();

        await connectDB();

        if (action === "request") {
            // Sub-admin requesting deletion
            if (session.user.role !== "sub-admin" || !session.user.permissions?.canDeleteUsers) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }

            const userToDelete = await User.findById(userId);
            if (!userToDelete) {
                return NextResponse.json({ message: "User not found" }, { status: 404 });
            }

            // Check if already pending
            const existing = await PendingUserDeletion.findOne({
                userId,
                status: "pending"
            });
            if (existing) {
                return NextResponse.json({ message: "Deletion already pending" }, { status: 400 });
            }

            const pendingDeletion = new PendingUserDeletion({
                userId,
                userEmail: userToDelete.email,
                userName: userToDelete.name,
                requestedBy: session.user.id,
                requestedByEmail: session.user.email,
                reason,
            });

            await pendingDeletion.save();
            return NextResponse.json({ message: "Deletion request submitted" });

        } else if (action === "approve" || action === "reject") {
            // Main admin processing deletion
            if (session.user.email !== "akb@tool.com") {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }

            const pendingDeletion = await PendingUserDeletion.findById(userId);
            if (!pendingDeletion || pendingDeletion.status !== "pending") {
                return NextResponse.json({ message: "Pending deletion not found" }, { status: 404 });
            }

            if (action === "approve") {
                // Perform actual deletion
                const userToDelete = await User.findById(pendingDeletion.userId);
                if (userToDelete) {
                    // Delete properties hosted by user and related bookings/reviews
                    const props = await Property.find({ host: pendingDeletion.userId }).select('_id');
                    const propIds = props.map(p => p._id);

                    if (propIds.length > 0) {
                        await Booking.deleteMany({ property: { $in: propIds } });
                        await Review.deleteMany({ property: { $in: propIds } });
                        await Property.deleteMany({ _id: { $in: propIds } });
                    }

                    // Delete bookings and reviews made by user
                    await Booking.deleteMany({ guest: pendingDeletion.userId });
                    await Review.deleteMany({ guest: pendingDeletion.userId });

                    // Finally delete the user
                    await User.findByIdAndDelete(pendingDeletion.userId);
                }
            }

            // Update pending deletion status
            pendingDeletion.status = action === "approve" ? "approved" : "rejected";
            pendingDeletion.processedAt = new Date();
            pendingDeletion.processedBy = session.user.id as any; // Convert to ObjectId
            await pendingDeletion.save();

            return NextResponse.json({
                message: `Deletion ${action}d successfully`
            });

        } else {
            return NextResponse.json({ message: "Invalid action" }, { status: 400 });
        }

    } catch (error) {
        console.error("Error processing pending deletion:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}