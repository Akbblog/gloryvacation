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
    console.error("Refusing to run delete-unapproved-listings: set DELETE_CONFIRM=true to confirm.");
    process.exit(1);
}

if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_DELETES !== 'true') {
    console.error("Refusing to run in production: set ALLOW_PRODUCTION_DELETES=true to override.");
    process.exit(1);
}

const deleteUnapproved = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");

        // Exempt properties owned by admin users from deletion.
        const adminUsers = await User.find({ role: 'admin' }).select('_id').lean();
        const adminIds = adminUsers.map(u => u._id);

        // Delete properties that are not approved by admin and NOT owned by admins
        const query = {
            $and: [
                { $or: [{ isApprovedByAdmin: false }, { isApprovedByAdmin: { $exists: false } }] },
                { host: { $nin: adminIds } }
            ]
        };

        const result = await Property.deleteMany(query);

        console.log(`Deleted ${result.deletedCount} unapproved listings (admin-owned properties were exempt).`);
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
