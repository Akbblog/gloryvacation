import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
    property: mongoose.Types.ObjectId;
    guest: mongoose.Types.ObjectId;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalPrice: number;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    paymentStatus: "pending" | "paid" | "refunded" | "failed";
    paymentId?: string;
    specialRequests?: string;
    guestDetails: {
        name: string;
        email: string;
        phone: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
        guest: { type: Schema.Types.ObjectId, ref: "User", required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        guests: { type: Number, required: true, min: 1 },
        totalPrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "refunded", "failed"],
            default: "pending",
        },
        paymentId: { type: String },
        specialRequests: { type: String },
        guestDetails: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },
    },
    { timestamps: true }
);

BookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });
BookingSchema.index({ guest: 1 });
BookingSchema.index({ status: 1 });

export const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
