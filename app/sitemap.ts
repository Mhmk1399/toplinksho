import type { MetadataRoute } from "next";
import { absoluteUrl, indexable, publicPages } from "@/lib/seo";
import { sitemapProjects } from "@/lib/server/projects";
import { mediaPath, projectPath } from "@/lib/projects";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Preview deployments never advertise production URLs for indexing.
  if (!indexable) return [];
  const projects = await sitemapProjects();
  const pages: MetadataRoute.Sitemap = publicPages
    .filter(page => page.indexable !== false && (page.path !== "/portfolio" || projects.length > 0))
    .map(page => ({ url: absoluteUrl(page.path) }));
  pages.push(...projects.map(project => ({ url: absoluteUrl(projectPath(project.slug)), lastModified: project.updatedAt, images: [absoluteUrl(mediaPath(project.coverId))] })));
  return pages;
}
