import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { Schema, models } = mongoose;

const AdminSessionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  credentialVersion: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true, versionKey: false, bufferCommands: false });

export type AdminSessionRecord = InferSchemaType<typeof AdminSessionSchema>;
export default (models.AdminSession || mongoose.model<AdminSessionRecord>("AdminSession", AdminSessionSchema)) as Model<AdminSessionRecord>;
