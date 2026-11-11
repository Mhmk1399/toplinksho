import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { Schema, models } = mongoose;
import { consultationSubjects, requestStatuses } from "@/lib/consultation";

const NotificationSchema = new Schema({
  status: { type: String, enum: ["pending", "sending", "sent", "failed", "unconfigured"], default: "pending", required: true },
  attempts: { type: Number, min: 0, default: 0, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
  sentAt: { type: Date },
}, { _id: false });

const LeadSchema = new Schema({
  publicId: { type: String, required: true, unique: true, immutable: true },
  reference: { type: String, required: true, unique: true, immutable: true },
  submissionKey: { type: String, required: true, unique: true, immutable: true, select: false },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 20, match: /^(?:0[0-9]{10,14}|\+[1-9][0-9]{7,14})$/ },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  companyName: { type: String, trim: true, maxlength: 200 },
  subject: { type: String, required: true, enum: consultationSubjects },
  description: { type: String, default: "", maxlength: 3000 },
  website: { type: String, default: "", trim: true, maxlength: 250 },
  status: { type: String, enum: Object.keys(requestStatuses), default: "new", required: true },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium", required: true },
  source: { type: String, enum: ["website", "homepage", "contact-page", "referral", "social-media", "other"], default: "website", required: true },
  businessSize: { type: String, enum: ["startup", "small", "medium", "enterprise"] },
  employees: { type: Number, min: 0, validate: Number.isInteger },
  budget: { type: String, trim: true, maxlength: 200 },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  tags: { type: [{ type: String, trim: true, maxlength: 50 }], default: [], validate: (values: string[]) => values.length <= 30 },
  followUpAt: { type: Date },
  lastContactedAt: { type: Date },
  notes: { type: String, default: "", maxlength: 5000 },
  version: { type: Number, default: 1, min: 1, required: true },
  notification: { type: NotificationSchema, default: () => ({}) },
}, { timestamps: true, versionKey: false, bufferCommands: false });

LeadSchema.index({ status: 1, createdAt: -1, publicId: -1 });
LeadSchema.index({ createdAt: -1, publicId: -1 });
LeadSchema.index({ assignedTo: 1, status: 1 });
LeadSchema.index({ followUpAt: 1 }, { sparse: true });

export type LeadRecord = InferSchemaType<typeof LeadSchema>;
export default (models.Lead || mongoose.model<LeadRecord>("Lead", LeadSchema)) as Model<LeadRecord>;
