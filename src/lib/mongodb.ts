import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

console.log('[mongodb.ts] MONGODB_URI loaded:', MONGODB_URI ? 'YES' : 'NO');
console.log('[mongodb.ts] MONGODB_URI starts with:', MONGODB_URI?.substring(0, 20));

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
        console.log('[connectDB] Using cached connection');
        return cached.conn;
    }

    if (!cached.promise) {
        console.log('[connectDB] Creating new connection...');
        // Tuned options for serverless environments (Vercel)
        // Keep small pool sizes to avoid exhausting MongoDB connections
        const opts = {
            bufferCommands: false,
            // limit pool size for ephemeral serverless functions
            maxPoolSize: process.env.NODE_ENV === 'production' ? 20 : 10,
            minPoolSize: 2,
            // fail fast if server is not selectable
            serverSelectionTimeoutMS: 5000,
            // use new URL parser / unified topology (defaults in mongoose >=6)
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        console.log('[connectDB] MONGODB_URI present:', !!process.env.MONGODB_URI);
        console.log('[connectDB] Connecting with options:', opts);
        
        cached.promise = mongoose.connect(process.env.MONGODB_URI!, opts).then((mongoose) => {
            console.log('[connectDB] Connection successful');
            return mongoose;
        }).catch((error) => {
            console.error('[connectDB] Connection failed:', error);
            throw error;
        });
    }

    try {
        console.log('[connectDB] Waiting for connection...');
        cached.conn = await cached.promise;
        console.log('[connectDB] Connection established');
    } catch (e) {
        console.error('[connectDB] Connection error:', e);
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}
        throw e;
    }

    return cached.conn;
}

export default connectDB;
