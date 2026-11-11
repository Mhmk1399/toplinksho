import type { MetadataRoute } from "next";
import { absoluteUrl, indexable, publicPages } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Preview deployments never advertise production URLs for indexing.
  return indexable ? publicPages.map(page => ({ url: absoluteUrl(page.path) })) : [];
}
