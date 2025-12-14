import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPropertyInquiry extends Document {
    ownerName: string;
    email: string;
    phone: string;
    propertyType: string;
    bedrooms: string;
    location: string;
    message?: string;
    status: "new" | "contacted" | "in_progress" | "converted" | "rejected";
    assignedTo?: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PropertyInquirySchema = new Schema<IPropertyInquiry>(
    {
        ownerName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        propertyType: { type: String, required: true },
        bedrooms: { type: String, required: true },
        location: { type: String, required: true },
        message: { type: String },
        status: {
            type: String,
            enum: ["new", "contacted", "in_progress", "converted", "rejected"],
            default: "new",
        },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
        notes: { type: String },
    },
    { timestamps: true }
);

PropertyInquirySchema.index({ status: 1 });
PropertyInquirySchema.index({ createdAt: -1 });

export const PropertyInquiry: Model<IPropertyInquiry> =
    mongoose.models.PropertyInquiry || mongoose.model<IPropertyInquiry>("PropertyInquiry", PropertyInquirySchema);
