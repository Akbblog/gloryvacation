import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
    property: mongoose.Types.ObjectId;
    guest: mongoose.Types.ObjectId;
    booking: mongoose.Types.ObjectId;
    rating: number;
    title: string;
    content: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
        guest: { type: Schema.Types.ObjectId, ref: "User", required: true },
        booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, required: true },
        content: { type: String, required: true },
        isPublished: { type: Boolean, default: true },
    },
    { timestamps: true }
);

ReviewSchema.index({ property: 1 });
ReviewSchema.index({ guest: 1 });

export const Review: Model<IReview> =
    mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
