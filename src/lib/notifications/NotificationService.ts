import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { User } from "@/models/User";

export interface NotificationData {
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    userId: string;
    relatedId?: string;
    relatedType?: string;
    data?: any;
}

export class NotificationService {
    static async createNotification(notificationData: NotificationData) {
        try {
            await connectDB();

            const notification = new Notification(notificationData);
            await notification.save();

            return notification;
        } catch (error) {
            console.error("Error creating notification:", error);
            throw error;
        }
    }

    static async createBulkNotifications(notifications: NotificationData[]) {
        try {
            await connectDB();

            const createdNotifications = await Notification.insertMany(notifications);
            return createdNotifications;
        } catch (error) {
            console.error("Error creating bulk notifications:", error);
            throw error;
        }
    }

    // Send an in-app notification to all admin/sub-admin users
    static async notifyAdmins(notificationPartial: Omit<NotificationData, "userId">) {
        try {
            await connectDB();

            const admins = await User.find({ role: { $in: ["admin", "sub-admin"] } }).select("_id");
            if (!admins || admins.length === 0) return [];

            const notifications = admins.map((a) => ({
                ...notificationPartial,
                userId: a._id.toString(),
            } as NotificationData));

            return this.createBulkNotifications(notifications);
        } catch (error) {
            console.error("Error notifying admins:", error);
            // swallow so callers can continue (fire-and-forget)
            return [];
        }
    }

    // Predefined notification templates
    static async notifyNewUserRegistration(userId: string, userName: string) {
        return this.createNotification({
            title: "New User Registration",
            message: `${userName} has registered and is waiting for approval.`,
            type: "info",
            userId,
            relatedType: "user",
        });
    }

    static async notifyUserApproved(userId: string, userName: string) {
        return this.createNotification({
            title: "Account Approved",
            message: `Welcome ${userName}! Your account has been approved and you can now access all features.`,
            type: "success",
            userId,
            relatedType: "user",
        });
    }

    static async notifyNewPropertyListing(userId: string, propertyTitle: string, hostName: string) {
        return this.createNotification({
            title: "New Property Listing",
            message: `${hostName} has listed "${propertyTitle}" and is waiting for approval.`,
            type: "info",
            userId,
            relatedType: "property",
        });
    }

    static async notifyPropertyApproved(userId: string, propertyTitle: string) {
        return this.createNotification({
            title: "Property Approved",
            message: `Your property "${propertyTitle}" has been approved and is now live!`,
            type: "success",
            userId,
            relatedType: "property",
        });
    }

    static async notifyNewBooking(userId: string, propertyTitle: string, guestName: string) {
        return this.createNotification({
            title: "New Booking Request",
            message: `${guestName} has requested to book "${propertyTitle}".`,
            type: "info",
            userId,
            relatedType: "booking",
        });
    }

    static async notifyBookingConfirmed(userId: string, propertyTitle: string) {
        return this.createNotification({
            title: "Booking Confirmed",
            message: `Your booking for "${propertyTitle}" has been confirmed!`,
            type: "success",
            userId,
            relatedType: "booking",
        });
    }

    static async notifyBookingCancelled(userId: string, propertyTitle: string) {
        return this.createNotification({
            title: "Booking Cancelled",
            message: `Your booking for "${propertyTitle}" has been cancelled.`,
            type: "warning",
            userId,
            relatedType: "booking",
        });
    }

    static async notifyNewInquiry(userId: string, propertyTitle: string, inquirerName: string) {
        return this.createNotification({
            title: "New Property Inquiry",
            message: `${inquirerName} has inquired about "${propertyTitle}".`,
            type: "info",
            userId,
            relatedType: "inquiry",
        });
    }

    static async notifyPaymentReceived(userId: string, amount: number, propertyTitle: string) {
        return this.createNotification({
            title: "Payment Received",
            message: `Payment of $${amount} received for "${propertyTitle}".`,
            type: "success",
            userId,
            relatedType: "payment",
        });
    }

    static async notifySystemAlert(userId: string, title: string, message: string) {
        return this.createNotification({
            title,
            message,
            type: "warning",
            userId,
            relatedType: "system",
        });
    }

    static async notifyError(userId: string, title: string, message: string) {
        return this.createNotification({
            title,
            message,
            type: "error",
            userId,
            relatedType: "error",
        });
    }
}