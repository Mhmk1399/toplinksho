import mongoose, { type InferSchemaType, type Model } from "mongoose";
const { Schema, models } = mongoose;

const text = (maxlength: number) => ({ type: String, trim: true, default: "", maxlength });
const MediaSchema = new Schema({ id: { type: String, required: true }, alt: text(250), caption: text(1000), posterId: text(24), duration: { type: Number, default: 0, min: 0, max: 21600 }, captions: text(30000) }, { _id: false });
const SectionSchema = new Schema({ heading: { ...text(160), required: true }, body: text(10000), bullets: { type: [String], default: [] } }, { _id: false });
const FaqSchema = new Schema({ question: { ...text(250), required: true }, answer: { ...text(3000), required: true } }, { _id: false });
const ProjectSchema = new Schema({
  publicId: { type: String, required: true, unique: true, immutable: true },
  title: { ...text(140), required: true }, slug: { ...text(120), required: true, unique: true }, summary: text(600),
  client: text(140), industry: text(120), year: text(30), duration: text(80), website: text(500),
  services: { type: [String], default: [] }, tags: { type: [String], default: [] }, technologies: { type: [String], default: [] },
  challenge: text(8000), solution: text(12000), outcome: text(8000),
  sections: { type: [SectionSchema], default: [] }, faq: { type: [FaqSchema], default: [] },
  coverId: text(24), coverAlt: text(250), media: { type: [MediaSchema], default: [] },
  seoTitle: text(160), seoDescription: text(320),
  status: { type: String, enum: ["draft", "published", "archived"], required: true, default: "draft" },
  featured: { type: Boolean, default: false }, sortOrder: { type: Number, default: 0, min: 0, max: 9999 },
  version: { type: Number, required: true, default: 1, min: 1 }, publishedAt: { type: Date, default: null },
  uploadLockUntil: { type: Date, default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true, versionKey: false, bufferCommands: false });
ProjectSchema.index({ status: 1, featured: -1, sortOrder: 1, publishedAt: -1 });
ProjectSchema.index({ services: 1, status: 1, publishedAt: -1 });
ProjectSchema.index({ status: 1, coverId: 1 });
ProjectSchema.index({ status: 1, "media.id": 1 });
ProjectSchema.index({ status: 1, "media.posterId": 1 });
export type ProjectRecord = InferSchemaType<typeof ProjectSchema>;
export default (models.Project || mongoose.model<ProjectRecord>("Project", ProjectSchema)) as Model<ProjectRecord>;
