import mongoose, { Schema, Document, Model } from "mongoose";

export type ReservationStatus = "pending" | "contacted" | "approved" | "rejected" | "confirmed" | "cancelled";
export type ReservationPriority = "low" | "normal" | "high" | "urgent";

export interface IStatusHistory {
    status: ReservationStatus;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    note?: string;
}

export interface IReservation extends Document {
    property: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    checkIn: Date;
    checkOut?: Date; // optional if using duration
    durationNights?: number;
    guests: number;
    notes?: string;
    status: ReservationStatus;
    priority: ReservationPriority;
    adminNotes?: string;
    internalTags?: string[];
    statusHistory: IStatusHistory[];
    lastEmailSent?: Date;
    emailCount: number;
    guestDetails: {
        name: string;
        email: string;
        phone?: string;
        nationality?: string;
        specialRequests?: string;
    };
    totalAmount?: number;
    currency: string;
    source?: string;
    assignedTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistory>(
    {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
    },
    { _id: false }
);

const ReservationSchema = new Schema<IReservation>(
    {
        property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date },
        durationNights: { type: Number },
        guests: { type: Number, required: true, min: 1 },
        notes: { type: String },
        status: {
            type: String,
            enum: ["pending", "contacted", "approved", "rejected", "confirmed", "cancelled"],
            default: "pending",
        },
        priority: {
            type: String,
            enum: ["low", "normal", "high", "urgent"],
            default: "normal",
        },
        adminNotes: { type: String },
        internalTags: [{ type: String }],
        statusHistory: [StatusHistorySchema],
        lastEmailSent: { type: Date },
        emailCount: { type: Number, default: 0 },
        guestDetails: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String },
            nationality: { type: String },
            specialRequests: { type: String },
        },
        totalAmount: { type: Number },
        currency: { type: String, default: "AED" },
        source: { type: String, default: "website" },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

ReservationSchema.index({ property: 1 });
ReservationSchema.index({ user: 1 });
ReservationSchema.index({ status: 1 });
ReservationSchema.index({ priority: 1 });
ReservationSchema.index({ checkIn: 1 });
ReservationSchema.index({ createdAt: -1 });
ReservationSchema.index({ assignedTo: 1 });

export const Reservation: Model<IReservation> =
    mongoose.models.Reservation || mongoose.model<IReservation>("Reservation", ReservationSchema);
