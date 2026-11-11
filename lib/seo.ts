import "server-only";
import type { Metadata } from "next";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

const configured = new URL(process.env.APP_URL || "https://toplinksho.com");
if (!["https:", "http:"].includes(configured.protocol) || configured.username || configured.password) throw new Error("APP_URL must be a public HTTP(S) origin");
export const siteOrigin = configured.origin;
export const absoluteUrl = (path = "/") => new URL(path, siteOrigin).href;
export const indexable = process.env.SITE_INDEXABLE === "true" && configured.protocol === "https:" && !/^(localhost|127\.|\[::1\])/.test(configured.hostname) && process.env.VERCEL_ENV !== "preview";

export type SeoPage = { path: string; title: string; description: string; image: string; kind: "home" | "about" | "contact" | "services" | "service"; slug?: string };
export const publicPages: SeoPage[] = [
  { path: "/", title: "تاپ لینک شو | آژانس دیجیتال مارکتینگ، طراحی سایت و برندینگ", description: "راهکارهای یکپارچهٔ تاپ لینک شو برای طراحی سایت، برندینگ، تولید محتوا، شبکه‌های اجتماعی، سئو و تبلیغات آنلاین. برای بررسی مسیر رشد کسب‌وکارتان مشاوره بگیرید.", image: "/images/hero-home.webp", kind: "home" },
  { path: "/about-us", title: "درباره ما", description: "با تاپ لینک شو و رویکرد یکپارچهٔ تیم ما در استراتژی، طراحی، تولید محتوا و دیجیتال مارکتینگ آشنا شوید.", image: "/images/hero-about.webp", kind: "about" },
  { path: "/services", title: "خدمات دیجیتال مارکتینگ", description: "خدمات تاپ لینک شو؛ طراحی سایت، برندینگ، طراحی کمپین، شبکه‌های اجتماعی، گوگل ادز، گرافیک، تولید محتوا، سئو و تبلیغات آنلاین. جزئیات همکاری را ببینید.", image: "/images/hero-services.webp", kind: "services" },
  { path: "/contact", title: "تماس با ما و مشاوره رایگان", description: `برای مشاوره با تاپ لینک شو در تماس باشید؛ ${site.phoneDisplay}، ${site.email}. دفتر ما: ${site.address}.`, image: "/images/hero-contact.webp", kind: "contact" },
  ...services.map(service => ({ path: `/services/${service.slug}`, title: service.title, description: service.description, image: "/images/hero-services.webp", kind: "service" as const, slug: service.slug })),
];
export function getSeoPage(path: string) {
  const page = publicPages.find(page => page.path === path);
  if (!page) throw new Error(`Missing SEO content: ${path}`);
  return page;
}
export function pageMetadata(path: string): Metadata {
  const page = getSeoPage(path);
  const title = page.kind === "home" ? page.title : `${page.title} | ${site.name}`;
  const socialImage = { url: absoluteUrl(`/social/${page.slug || page.kind}.png`), width: 1200, height: 630, alt: title };
  return {
    title: { absolute: title }, description: page.description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { type: "website", siteName: site.name, locale: "fa_IR", url: absoluteUrl(path), title, description: page.description, images: [socialImage] },
    twitter: { card: "summary_large_image", title, description: page.description, images: [socialImage.url] },
    robots: { index: indexable, follow: indexable, ...(indexable ? { googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } } : {}) },
  };
}
