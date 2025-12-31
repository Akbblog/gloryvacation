import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPendingUserDeletion extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    userName: string;
    requestedBy: mongoose.Types.ObjectId; // sub-admin who requested
    requestedByEmail: string;
    reason?: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
    processedAt?: Date;
    processedBy?: mongoose.Types.ObjectId;
}

const PendingUserDeletionSchema = new Schema<IPendingUserDeletion>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        userEmail: { type: String, required: true },
        userName: { type: String, required: true },
        requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        requestedByEmail: { type: String, required: true },
        reason: { type: String },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        processedAt: { type: Date },
        processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const PendingUserDeletion: Model<IPendingUserDeletion> =
    mongoose.models.PendingUserDeletion || mongoose.model<IPendingUserDeletion>("PendingUserDeletion", PendingUserDeletionSchema);