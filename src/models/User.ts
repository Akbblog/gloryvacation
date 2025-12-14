import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    phone?: string;
    image?: string;
    role: "guest" | "host" | "admin";
    isApproved: boolean;
    emailVerified?: Date;
    favorites: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String },
        name: { type: String, required: true },
        phone: { type: String },
        image: { type: String },
        role: {
            type: String,
            enum: ["guest", "host", "admin"],
            default: "guest",
        },
        isApproved: { type: Boolean, default: false },
        emailVerified: { type: Date },
        favorites: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    },
    { timestamps: true }
);

// UserSchema.index({ email: 1 }); // Already indexed by unique: true

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
