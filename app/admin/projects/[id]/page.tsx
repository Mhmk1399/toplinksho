import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { requireAdmin } from "@/lib/server/auth";
import { adminProject, projectServices } from "@/lib/server/projects";
import { assetList } from "@/lib/server/project-media";
export const metadata: Metadata = { title: "ویرایش پروژه" };
export const dynamic = "force-dynamic";
export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params, admin = await requireAdmin(`/admin/projects/${id}`), project = await adminProject(id);
  if (!project) notFound();
  return <AdminShell active="projects" email={admin.email}><h1 className="mb-3 break-words text-3xl font-bold">ویرایش {project.title}</h1><p className="mb-8 text-sm leading-8 text-muted">تغییرات را ذخیره کنید تا در نسخهٔ پیش‌نمایش یا سایت اعمال شوند.</p><ProjectEditor key={id} id={id} initial={project} assets={await assetList(id)} services={projectServices} /></AdminShell>;
}
