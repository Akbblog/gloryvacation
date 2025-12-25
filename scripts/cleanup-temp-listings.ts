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

// Safety: require explicit confirmation before running deletion scripts.
if (process.env.DELETE_CONFIRM !== 'true') {
    console.error("Refusing to run cleanup-temp-listings: set DELETE_CONFIRM=true to confirm.");
    process.exit(1);
}

if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_DELETES !== 'true') {
    console.error("Refusing to run in production: set ALLOW_PRODUCTION_DELETES=true to override.");
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
        console.log("Found properties owned by admin (no automatic deletion will be performed by this script).");

        const props = await Property.find({ host: adminUser._id }).select('_id title slug createdAt isActive isApprovedByAdmin').lean();

        console.log(`Admin owns ${props.length} properties:`);
        props.forEach(p => console.log(`- ${p._id} | ${p.title || '(no title)'} | slug=${p.slug} | active=${p.isActive} approved=${p.isApprovedByAdmin}`));

        console.log("To delete these properties manually, run an explicit delete command or re-enable deletion in this script with a deliberate change.");

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
