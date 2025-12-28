import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    userId: mongoose.Types.ObjectId;
    isRead: boolean;
    relatedId?: mongoose.Types.ObjectId;
    relatedType?: string;
    data?: any;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["info", "success", "warning", "error"],
            default: "info",
        },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isRead: { type: Boolean, default: false },
        relatedId: { type: Schema.Types.ObjectId },
        relatedType: { type: String },
        data: { type: Schema.Types.Mixed },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;