import type { MetadataRoute } from "next";
import { absoluteUrl, indexable, publicPages } from "@/lib/seo";
import connect from "@/lib/server/db";
import Project from "@/models/Project";
import { projectPath } from "@/lib/projects";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Preview deployments never advertise production URLs for indexing.
  if (!indexable) return [];
  const pages: MetadataRoute.Sitemap = publicPages.map(page => ({ url: absoluteUrl(page.path) }));
  if (process.env.MONGODB_URI) {
    await connect();
    const projects = await Project.find({ status: "published" }).select("slug updatedAt coverId").sort({ updatedAt: -1 }).limit(49000).lean();
    pages.push(...projects.map(project => ({ url: absoluteUrl(projectPath(project.slug)), lastModified: project.updatedAt, images: [absoluteUrl(`/media/projects/${project.coverId}`)] })));
  }
  return pages;
}
