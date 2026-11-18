import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminInbox } from "@/components/admin/AdminInbox";
import { requireAdmin } from "@/lib/server/auth";
import { listConsultations } from "@/lib/server/consultations";
import { isRequestStatus } from "@/lib/consultation";

export const metadata: Metadata = { title: "درخواست‌های مشاوره" };
export const dynamic = "force-dynamic";
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const admin = await requireAdmin();
  const parameters = await searchParams;
  const status = isRequestStatus(parameters.status) ? parameters.status : "";
  const result = await listConsultations({ status, page: Number(parameters.page || 1) });
  return <AdminShell email={admin.email}><div className="mb-8"><p className="mb-3 text-xs text-accent">ارتباط با کسب‌وکارها</p><h1 className="text-3xl font-bold">درخواست‌های مشاوره</h1><p className="mt-3 text-sm leading-8 text-muted">درخواست‌ها را بررسی کنید، وضعیت پیگیری را تغییر دهید و یادداشت‌های تیم را یک‌جا نگه دارید.</p></div><AdminInbox key={`${status}:${result.page}`} initial={result} initialStatus={status} /></AdminShell>;
}
