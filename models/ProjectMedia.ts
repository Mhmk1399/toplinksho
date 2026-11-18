import mongoose, { type InferSchemaType, type Model } from "mongoose";
const { Schema, models } = mongoose;

// Binary content lives in private S3. Only trusted server code can set object keys.
const ProjectMediaSchema = new Schema({
  projectId: { type: String, required: true, immutable: true, maxlength: 36 },
  bucket: { type: String, required: true, immutable: true, select: false, maxlength: 255 },
  key: { type: String, required: true, immutable: true, unique: true, select: false, maxlength: 512 },
  name: { type: String, required: true, trim: true, maxlength: 180 },
  kind: { type: String, enum: ["image", "video"], required: true },
  mime: { type: String, enum: ["image/webp", "video/mp4", "video/webm"], required: true },
  bytes: { type: Number, required: true, min: 1, max: 80 * 1024 * 1024 },
  width: { type: Number, required: true, min: 0, max: 2000 },
  height: { type: Number, required: true, min: 0, max: 2000 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
}, { timestamps: true, bufferCommands: false, versionKey: false });
ProjectMediaSchema.index({ projectId: 1, createdAt: 1 });
export type ProjectMediaRecord = InferSchemaType<typeof ProjectMediaSchema>;
export default (models.ProjectMedia || mongoose.model<ProjectMediaRecord>("ProjectMedia", ProjectMediaSchema)) as Model<ProjectMediaRecord>;
