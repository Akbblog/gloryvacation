import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        // Tuned options for serverless environments (Vercel)
        // Keep small pool sizes to avoid exhausting MongoDB connections
        const opts = {
            bufferCommands: false,
            // limit pool size for ephemeral serverless functions
            maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE) || 5,
            // fail fast if server is not selectable
            serverSelectionTimeoutMS: 5000,
            // use new URL parser / unified topology (defaults in mongoose >=6)
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
