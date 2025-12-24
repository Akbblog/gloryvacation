import { config } from 'dotenv';
import mongoose from 'mongoose';
import { Property } from '../src/models/Property';
import { User } from '../src/models/User';
import path from 'path';

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
}

const cleanUpListings = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");

        const adminEmail = process.env.ADMIN_EMAIL || "akb@tool.com";
        console.log(`Looking for admin user with email: ${adminEmail}`);

        const adminUser = await User.findOne({ email: adminEmail });

        if (!adminUser) {
            console.log("Admin user not found. No listings to delete associated with admin.");
            process.exit(0);
        }

        console.log(`Admin user found with ID: ${adminUser._id}`);
        console.log("Deleting properties owned by admin...");

        const result = await Property.deleteMany({ host: adminUser._id });

        console.log(`Cleanup complete. Deleted ${result.deletedCount} temporary listings.`);

    } catch (error) {
        console.error("Error during cleanup:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
        process.exit(0);
    }
};

cleanUpListings();
