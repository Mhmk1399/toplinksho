import "server-only";
import mongoose from "mongoose";
import RateLimit from "@/models/RateLimit";

const shared = globalThis as typeof globalThis & { toplinkshoMongo?: Promise<typeof mongoose> };

/** Server-only connection. Reuses both an open connection and concurrent connection attempts. */
export default async function connect() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if (!shared.toplinkshoMongo) {
    shared.toplinkshoMongo = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || undefined,
      bufferCommands: false, maxPoolSize: 10, minPoolSize: 0,
      serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000,
    });
  }
  try { return await shared.toplinkshoMongo; }
  finally { shared.toplinkshoMongo = undefined; }
}

export async function rateLimit(key: string, limit: number, interval: number) {
  await connect();
  await RateLimit.init();
  const now = new Date();
  // A single atomic pipeline also handles concurrent requests on multiple Node instances.
  const pipeline = [{
    $set: {
      key,
      hits: { $cond: [{ $gt: ["$resetAt", now] }, { $add: ["$hits", 1] }, 1] },
      resetAt: { $cond: [{ $gt: ["$resetAt", now] }, "$resetAt", new Date(now.getTime() + interval)] },
    },
  }];
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const row = await RateLimit.findOneAndUpdate({ key }, pipeline, { upsert: true, returnDocument: "after", updatePipeline: true });
      return { allowed: row!.hits <= limit, retryAfter: Math.max(1, Math.ceil((row!.resetAt.getTime() - now.getTime()) / 1000)) };
    } catch (error) {
      if ((error as { code?: number }).code !== 11000 || attempt === 2) throw error;
    }
  }
  throw new Error("Unable to acquire rate limit");
}
