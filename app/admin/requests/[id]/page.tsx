import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Phone, Globe2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminRequestForm, InboxBackLink } from "@/components/admin/AdminRequestForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/server/auth";
import { getConsultation } from "@/lib/server/consultations";
import { formatDate } from "@/lib/consultation";

export const metadata: Metadata = { title: "بررسی درخواست" };
export const dynamic = "force-dynamic";
export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin(`/admin/requests/${id}`);
  const lead = await getConsultation(id);
  if (!lead) notFound();
  let website: string | null = null;
  try { const url = new URL(lead.website); if (["http:", "https:"].includes(url.protocol)) website = url.href; } catch { /* Social handles stay plain text. */ }
  return <AdminShell email={admin.email}><InboxBackLink /><div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-3 text-xs text-accent" dir="ltr">{lead.reference}</p><h1 className="max-w-2xl text-3xl leading-relaxed font-bold break-words">{lead.name}</h1><p className="mt-3 text-sm text-muted">ثبت‌شده در {formatDate(lead.created_at)}</p></div><StatusBadge status={lead.status} /></div>
    <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_.9fr]"><div className="space-y-6"><section className="rounded-3xl border border-white/10 bg-panel/70 p-6 sm:p-8"><h2 className="mb-6 text-lg font-semibold">اطلاعات درخواست</h2><dl className="space-y-6"><div><dt className="mb-2 text-xs text-muted">زمینهٔ مشاوره</dt><dd className="text-base">{lead.subject}</dd></div><div><dt className="mb-2 text-xs text-muted">شماره تماس</dt><dd><a href={`tel:${lead.phone}`} dir="ltr" className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-white/10 px-4 text-sm text-accent hover:border-accent/40"><Phone size={16} aria-hidden="true" />{lead.phone}</a></dd></div><div><dt className="mb-3 text-xs text-muted">توضیح موضوع مشاوره</dt><dd className="rounded-2xl bg-ink/70 p-5 text-sm leading-9 whitespace-pre-wrap break-words">{lead.description || "توضیحی نوشته نشده است."}</dd></div><div><dt className="mb-2 text-xs text-muted">سایت یا شبکهٔ اجتماعی</dt><dd className="text-sm break-all" dir="ltr">{website ? <a href={website} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-accent hover:underline"><Globe2 size={16} aria-hidden="true" />{lead.website}</a> : lead.website || "—"}</dd></div></dl></section><p className="text-xs leading-7 text-muted">آخرین تغییر: {formatDate(lead.updated_at)} · نسخهٔ {lead.version.toLocaleString("fa-IR")}</p></div><AdminRequestForm id={id} initial={{ status: lead.status, notes: lead.notes, version: lead.version }} emailStatus={lead.email_status} /></div>
  </AdminShell>;
}
