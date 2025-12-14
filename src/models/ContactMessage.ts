import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContactMessage extends Document {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: "new" | "read" | "replied" | "closed";
    assignedTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ["new", "read", "replied", "closed"],
            default: "new",
        },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ createdAt: -1 });

export const ContactMessage: Model<IContactMessage> =
    mongoose.models.ContactMessage || mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);
