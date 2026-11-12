import "server-only";
import type { Metadata } from "next";
import { publicEntries } from "@/lib/page-registry";
import { site } from "@/lib/site";

const configured = new URL(process.env.APP_URL || "https://toplinksho.com");
if (!["https:", "http:"].includes(configured.protocol) || configured.username || configured.password) throw new Error("APP_URL must be a public HTTP(S) origin");
export const siteOrigin = configured.origin;
export const absoluteUrl = (path = "/") => new URL(path, siteOrigin).href;
export const indexable = process.env.SITE_INDEXABLE === "true" && configured.protocol === "https:" && !/^(localhost|127\.|\[::1\])/.test(configured.hostname) && process.env.VERCEL_ENV !== "preview";

export type SeoPage = (typeof publicEntries)[number];
export const publicPages = publicEntries;
export function getSeoPage(path: string) {
  const page = publicPages.find(page => page.path === path);
  if (!page) throw new Error(`Missing SEO content: ${path}`);
  return page;
}
export function pageMetadata(path: string): Metadata {
  const page = getSeoPage(path);
  const title = page.kind === "home" ? page.title : `${page.title} | ${site.name}`;
  const socialImage = { url: absoluteUrl(`/social/${page.socialId}.png`), width: 1200, height: 630, alt: title };
  return {
    title: { absolute: title }, description: page.description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { type: "website", siteName: site.name, locale: "fa_IR", url: absoluteUrl(path), title, description: page.description, images: [socialImage] },
    twitter: { card: "summary_large_image", title, description: page.description, images: [socialImage.url] },
    robots: { index: indexable, follow: indexable, ...(indexable ? { googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } } : {}) },
  };
}
