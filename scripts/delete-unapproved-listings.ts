import { config } from 'dotenv';
import mongoose from 'mongoose';
import { Property } from '../src/models/Property';
import path from 'path';

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
}

const deleteUnapproved = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");

        // Delete properties that are not approved/active
        // This will remove any listing where isActive is false or missing.
        const result = await Property.deleteMany({ $or: [{ isActive: false }, { isActive: { $exists: false } }] });

        console.log(`Deleted ${result.deletedCount} unapproved listings.`);
    } catch (error) {
        console.error("Error during deletion:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
        process.exit(0);
    }
};

deleteUnapproved();
