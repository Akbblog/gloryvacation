import mongoose from "mongoose";
// Import all models to ensure they're registered
import '../models';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    lastError: Error | null;
    retryCount: number;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || {
    conn: null,
    promise: null,
    lastError: null,
    retryCount: 0
};

if (!global.mongoose) {
    global.mongoose = cached;
}

// Configuration constants
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const NON_RETRYABLE_PATTERNS = [
    /authentication/i,
    /invalid/i,
    /bad uri/i,
    /enotfound/i,
    /econnrefused/i,
];

function normalizeError(error: unknown): Error {
    if (error instanceof Error) {
        return error;
    }
    return new Error(String(error));
}

function isRetryableError(error: Error): boolean {
    return !NON_RETRYABLE_PATTERNS.some((pattern) => pattern.test(error.message));
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validates if the current connection is healthy
 */
function isConnectionHealthy(): boolean {
    if (!cached.conn) return false;
    const state = mongoose.connection.readyState;
    // 1 = connected, 2 = connecting
    return state === 1;
}

/**
 * Connect to MongoDB with retry logic and optimized settings for serverless
 * @param forceNew - Force a new connection even if one exists
 */
async function connectDB(forceNew = false): Promise<typeof mongoose> {
    // Return existing healthy connection
    if (!forceNew && cached.conn && isConnectionHealthy()) {
        return cached.conn;
    }

    // If there's an ongoing connection attempt, wait for it
    if (cached.promise && !forceNew) {
        try {
            cached.conn = await cached.promise;
            if (isConnectionHealthy()) {
                cached.retryCount = 0; // Reset retry count on success
                return cached.conn;
            }
        } catch (e) {
            // Connection attempt failed, will retry below
            cached.promise = null;
            cached.conn = null;
        }
    }

    // Optimized settings for serverless environments (Vercel, Lambda, etc.)
    const opts: mongoose.ConnectOptions = {
        bufferCommands: false, // Fail fast instead of buffering

        // Connection pool settings - smaller for serverless to prevent exhaustion
        maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
        minPoolSize: 0, // Allow full cleanup in serverless (no minimum)

        // Timeouts - balanced for cold starts vs responsiveness
        serverSelectionTimeoutMS: 10000, // 10s for server selection (cold starts need more time)
        connectTimeoutMS: 10000, // 10s for initial connection
        socketTimeoutMS: 45000, // 45s for socket operations

        // Idle connection cleanup
        maxIdleTimeMS: 30000, // Close idle connections after 30s

        // Retry settings (mongoose level)
        retryWrites: true,
        retryReads: true,
    };

    // Implement connection with exponential backoff retry
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            if (attempt > 0) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
                console.log(`[MongoDB] Retry attempt ${attempt}/${MAX_RETRIES} after ${delay}ms...`);
                await sleep(delay);
            }

            // Clear any stale state before attempting connection
            if (cached.conn) {
                try {
                    await mongoose.disconnect();
                } catch {
                    // Ignore disconnect errors
                }
                cached.conn = null;
            }
            cached.promise = null;

            // Attempt connection
            cached.promise = mongoose.connect(MONGODB_URI, opts);
            cached.conn = await cached.promise;

            // Verify connection is actually established
            if (isConnectionHealthy()) {
                cached.retryCount = 0;
                cached.lastError = null;

                if (attempt > 0) {
                    console.log(`[MongoDB] Connection established after ${attempt} retries`);
                }

                return cached.conn;
            } else {
                throw new Error('Connection established but not in healthy state');
            }

        } catch (error) {
            lastError = normalizeError(error);
            cached.lastError = lastError;
            cached.promise = null;
            cached.conn = null;
            cached.retryCount = attempt + 1;

            console.error(`[MongoDB] Connection attempt ${attempt + 1} failed:`, lastError.message);

            if (!isRetryableError(lastError)) {
                console.error('[MongoDB] Detected a non-retryable error, aborting retries');
                break;
            }
        }
    }

    // All retries exhausted
    const finalError = new Error(
        `Failed to connect to MongoDB after ${MAX_RETRIES + 1} attempts. Last error: ${lastError?.message || 'Unknown error'}`
    );
    console.error('[MongoDB]', finalError.message);
    throw finalError;
}

// Set up connection event handlers (only once)
if (typeof global !== 'undefined' && !global.mongoose?.conn) {
    mongoose.connection.on('connected', () => {
        console.log('[MongoDB] Connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
        console.error('[MongoDB] Connection error:', err.message);
        // Reset cached state on error to allow reconnection
        if (cached) {
            cached.lastError = err;
        }
    });

    mongoose.connection.on('disconnected', () => {
        console.log('[MongoDB] Connection disconnected');
        // Reset cached connection to trigger reconnection on next request
        if (cached) {
            cached.conn = null;
            cached.promise = null;
        }
    });

    // Graceful shutdown handling
    if (typeof process !== 'undefined') {
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('[MongoDB] Connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('[MongoDB] Error during graceful shutdown:', err);
                process.exit(1);
            }
        });
    }
}

export default connectDB;

// Export utility for health checks
export function getConnectionStatus() {
    return {
        isConnected: isConnectionHealthy(),
        readyState: mongoose.connection.readyState,
        retryCount: cached.retryCount,
        lastError: cached.lastError?.message || null,
    };
}
