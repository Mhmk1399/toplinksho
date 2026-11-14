import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { requireAdmin } from "@/lib/server/auth";
import { projectServices } from "@/lib/server/projects";
export const metadata: Metadata = { title: "ساخت پروژه" };
export const dynamic = "force-dynamic";
export default async function NewProject() {
  const admin = await requireAdmin("/admin/projects/new");
  return <AdminShell active="projects" email={admin.email}><h1 className="mb-3 text-3xl font-bold">پروژهٔ جدید</h1><p className="mb-8 text-sm leading-8 text-muted">عنوان و خدمات مرتبط را مشخص کنید و پیش‌نویس را ذخیره کنید؛ سپس رسانه‌ها و جزئیات را تکمیل کنید.</p><ProjectEditor id={randomUUID()} initial={null} assets={[]} services={projectServices} /></AdminShell>;
}
