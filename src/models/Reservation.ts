import mongoose, { Schema, Document, Model } from "mongoose";

export type ReservationStatus = "pending" | "contacted" | "approved" | "rejected";

export interface IReservation extends Document {
    property: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    checkIn: Date;
    checkOut?: Date; // optional if using duration
    durationNights?: number;
    guests: number;
    notes?: string;
    status: ReservationStatus;
    guestDetails: {
        name: string;
        email: string;
        phone?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

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
            enum: ["pending", "contacted", "approved", "rejected"],
            default: "pending",
        },
        guestDetails: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String },
        },
    },
    { timestamps: true }
);

ReservationSchema.index({ property: 1 });
ReservationSchema.index({ user: 1 });
ReservationSchema.index({ status: 1 });

export const Reservation: Model<IReservation> =
    mongoose.models.Reservation || mongoose.model<IReservation>("Reservation", ReservationSchema);
