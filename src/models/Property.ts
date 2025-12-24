import mongoose, { Schema, Document, Model } from "mongoose";

// Property/Listing Interface
export interface IProperty extends Document {
    title: string;
    slug: string;
    description: string;
    propertyType: "studio" | "apartment" | "villa" | "townhouse" | "penthouse";
    bedrooms: number;
    bathrooms: number;
    guests: number;
    pricePerNight?: number;
    images: string[];
    amenities: string[];
    location: {
        address: string;
        area: string;
        city: string;
        country: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    host: mongoose.Types.ObjectId;
    isActive: boolean;
    isApprovedByAdmin: boolean;
    isFeatured: boolean;
    dtcmPermitNumber?: string;
    rating?: number;
    reviewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        propertyType: {
            type: String,
            enum: ["studio", "apartment", "villa", "townhouse", "penthouse"],
            required: true,
        },
        bedrooms: { type: Number, required: true, default: 0 },
        bathrooms: { type: Number, required: true, default: 1 },
        guests: { type: Number, required: true, default: 2 },
        pricePerNight: { type: Number },
        images: [{ type: String }],
        amenities: [{ type: String }],
        location: {
            address: { type: String, required: true },
            area: { type: String, required: true },
            city: { type: String, default: "Dubai" },
            country: { type: String, default: "UAE" },
            coordinates: {
                lat: { type: Number },
                lng: { type: Number },
            },
        },
        host: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isActive: { type: Boolean, default: false },
        isApprovedByAdmin: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        dtcmPermitNumber: { type: String },
        rating: { type: Number, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// PropertySchema.index({ slug: 1 }); // Already indexed by unique: true
PropertySchema.index({ "location.area": 1 });
PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ pricePerNight: 1 });

export const Property: Model<IProperty> =
    mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);
