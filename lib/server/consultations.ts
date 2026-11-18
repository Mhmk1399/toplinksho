import "server-only";
import { randomUUID, randomBytes } from "node:crypto";
import connect from "@/lib/server/db";
import Lead, { type LeadRecord } from "@/models/Lead";
import type { ConsultationValues, EmailStatus, RequestStatus } from "@/lib/consultation";

export type Consultation = ConsultationValues & {
  id: string; reference: string; submission_key: string;
  status: RequestStatus; notes: string; version: number;
  email_status: EmailStatus; email_attempts: number; email_updated_at: number;
  created_at: number; updated_at: number;
};
export type ConsultationSummary = Pick<Consultation, "id" | "reference" | "name" | "phone" | "subject" | "status" | "email_status" | "created_at" | "updated_at">;

async function ready() { await connect(); await Lead.init(); }
function serialize(lead: LeadRecord): Consultation {
  return {
    id: lead.publicId, reference: lead.reference, submission_key: lead.submissionKey,
    name: lead.name, phone: lead.phone, subject: lead.subject, description: lead.description, website: lead.website,
    status: lead.status as RequestStatus, notes: lead.notes, version: lead.version,
    email_status: lead.notification!.status as EmailStatus, email_attempts: lead.notification!.attempts,
    email_updated_at: lead.notification!.updatedAt.getTime(), created_at: lead.createdAt.getTime(), updated_at: lead.updatedAt.getTime(),
  };
}
export async function getConsultation(id: string) {
  await ready();
  const lead = await Lead.findOne({ publicId: id }).select("+submissionKey").lean();
  return lead ? serialize(lead) : undefined;
}
export async function findSubmission(key: string) {
  await ready();
  const lead = await Lead.findOne({ submissionKey: key }).select("+submissionKey").lean();
  return lead ? serialize(lead) : undefined;
}
export async function createConsultation(values: ConsultationValues, key: string) {
  await ready();
  try {
    const lead = await Lead.create({ ...values, subject: values.subject as LeadRecord["subject"], publicId: randomUUID(), reference: `TLS-${randomBytes(5).toString("hex").toUpperCase()}`, submissionKey: key });
    return { request: serialize(lead.toObject()), created: true };
  } catch (error) {
    // The unique index is the arbiter for simultaneous retries, across all instances.
    if ((error as { code?: number }).code !== 11000) throw error;
    const existing = await findSubmission(key);
    if (!existing) throw error;
    return { request: existing, created: false };
  }
}
export async function listConsultations({ query = "", status = "", page = 1 }: { query?: string; status?: string; page?: number }) {
  await ready();
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = { ...(status ? { status } : {}), ...(query ? { $or: ["name", "phone", "reference"].map(field => ({ [field]: { $regex: escaped, $options: "i" } })) } : {}) };
  const total = await Lead.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / 20));
  const currentPage = Math.max(1, Math.min(pages, Number.isFinite(page) ? Math.floor(page) : 1));
  const [leads, grouped] = await Promise.all([
    Lead.find(filter).select("publicId reference name phone subject status notification.status createdAt updatedAt").sort({ createdAt: -1, publicId: -1 }).skip((currentPage - 1) * 20).limit(20).lean(),
    Lead.aggregate<{ _id: RequestStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  const rows: ConsultationSummary[] = leads.map(lead => ({ id: lead.publicId, reference: lead.reference, name: lead.name, phone: lead.phone, subject: lead.subject, status: lead.status as RequestStatus, email_status: lead.notification!.status as EmailStatus, created_at: lead.createdAt.getTime(), updated_at: lead.updatedAt.getTime() }));
  return { rows, total, pages, page: currentPage, counts: grouped.map(row => ({ status: row._id, count: row.count })) };
}
export type InboxResult = Awaited<ReturnType<typeof listConsultations>>;

export async function updateConsultation(id: string, status: RequestStatus, notes: string, version: number) {
  await ready();
  const lead = await Lead.findOneAndUpdate({ publicId: id, version }, { $set: { status, notes, ...(status === "contacted" ? { lastContactedAt: new Date() } : {}) }, $inc: { version: 1 } }, { returnDocument: "after", runValidators: true }).select("+submissionKey").lean();
  return lead ? serialize(lead) : undefined;
}
