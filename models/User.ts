import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { Schema, models } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  // Only scrypt hashes are accepted. Never persist a plain password.
  password: { type: String, required: true, select: false, match: /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/ },
  companyName: { type: String, trim: true, maxlength: 200 },
  phone: { type: String, trim: true, maxlength: 20 },
  role: { type: String, enum: ["user", "admin"], default: "user", required: true },
  status: { type: String, enum: ["active", "suspended"], default: "active", required: true },
  sessionVersion: { type: Number, default: 1, min: 1, required: true },
  lastLoginAt: { type: Date },
  loginCount: { type: Number, default: 0, min: 0 },
  managedByEnvironment: { type: Boolean, default: false, select: false },
}, {
  timestamps: true, bufferCommands: false,
  
});

UserSchema.set("toJSON", { transform(_doc, result) {
  const safe: Record<string, unknown> = result;
  delete safe.password; delete safe.managedByEnvironment;
  return safe;
} });

export type UserRecord = InferSchemaType<typeof UserSchema>;
export default (models.User || mongoose.model<UserRecord>("User", UserSchema)) as Model<UserRecord>;
