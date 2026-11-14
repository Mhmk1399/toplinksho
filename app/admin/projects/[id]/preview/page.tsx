import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/server/auth";
import { adminProject } from "@/lib/server/projects";
import { assetList } from "@/lib/server/project-media";
import { ProjectDetail } from "@/components/portfolio/ProjectDetail";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
export const metadata: Metadata = { title: "پیش‌نمایش خصوصی پروژه", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function ProjectPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; await requireAdmin(`/admin/projects/${id}/preview`);
  const project = await adminProject(id); if (!project) notFound();
  return <><header className="site-header"><Container><nav className="nav-shell" aria-label="ناوبری پیش‌نمایش"><Link href={`/admin/projects/${id}`} className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm text-accent">بازگشت به ویرایش پروژه</Link><span className="text-xs text-muted">پیش‌نمایش خصوصی</span></nav></Container></header><ProjectDetail project={{ ...project, assets: await assetList(id) }} preview /></>;
}
