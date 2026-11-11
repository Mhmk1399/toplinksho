import "server-only";
import nodemailer from "nodemailer";
import connect from "@/lib/server/db";
import Lead from "@/models/Lead";
import { getConsultation } from "@/lib/server/consultations";
import { site } from "@/lib/site";

export function mailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM && process.env.LEADS_EMAIL);
}

function transport() {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST, port, secure, requireTLS: !secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 7000, greetingTimeout: 7000, socketTimeout: 12000,
  });
}

export async function verifyMail() {
  if (!mailConfigured()) return false;
  const smtp = transport();
  try { return await smtp.verify(); } finally { smtp.close(); }
}

export async function sendConsultationNotification(id: string) {
  await connect();
  if (!mailConfigured()) {
    await Lead.updateOne({ publicId: id, "notification.status": { $in: ["pending", "failed", "unconfigured"] } }, { $set: { "notification.status": "unconfigured", "notification.updatedAt": new Date() } });
    return;
  }
  const claimed = await Lead.updateOne({ publicId: id, "notification.status": { $in: ["pending", "failed", "unconfigured"] } }, { $set: { "notification.status": "sending", "notification.updatedAt": new Date() }, $inc: { "notification.attempts": 1 } });
  if (!claimed.modifiedCount) return;
  const lead = (await getConsultation(id))!;
  const smtp = transport();
  try {
    const adminLink = process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, "")}/admin/requests/${lead.id}` : "";
    await smtp.sendMail({
      from: process.env.SMTP_FROM, to: process.env.LEADS_EMAIL,
      messageId: `<consultation-${lead.id}@toplinksho.local>`,
      subject: `درخواست مشاوره ${site.name} — ${lead.reference}`,
      text: [`درخواست مشاوره جدید — ${lead.reference}`, `نام: ${lead.name}`, `تلفن: ${lead.phone}`, `زمینه: ${lead.subject}`, `توضیحات: ${lead.description || "—"}`, `سایت یا شبکه اجتماعی: ${lead.website || "—"}`, adminLink ? `مشاهده در پنل: ${adminLink}` : ""].filter(Boolean).join("\n\n"),
    });
    await Lead.updateOne({ publicId: id }, { $set: { "notification.status": "sent", "notification.updatedAt": new Date(), "notification.sentAt": new Date() } });
  } catch {
    await Lead.updateOne({ publicId: id }, { $set: { "notification.status": "failed", "notification.updatedAt": new Date() } });
  } finally { smtp.close(); }
}
