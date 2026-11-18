import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { Schema, models } = mongoose;

const RateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  hits: { type: Number, required: true, min: 1 },
  resetAt: { type: Date, required: true, expires: 0 },
}, { versionKey: false, bufferCommands: false });

export type RateLimitRecord = InferSchemaType<typeof RateLimitSchema>;
export default (models.RateLimit || mongoose.model<RateLimitRecord>("RateLimit", RateLimitSchema)) as Model<RateLimitRecord>;
