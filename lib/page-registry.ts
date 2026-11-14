import data from "@/content/services.fa.json";
import main from "@/content/pages.fa.json";
import home from "@/content/home.fa.json";
import portfolio from "@/content/portfolio.fa.json";
import { services as legacy } from "@/lib/services";
import type { EditorialCopy } from "@/lib/page-copy";

export type FAQ = { question: string; answer: string };
export type ServicePageData = EditorialCopy & {
 path: string; kind: string; title: string; description: string; parent?: string; group?: string; image: string;
 intro?: string; fit?: string; deliverables?: string[]; inputs?: string[]; process?: string[]; faq?: FAQ[];
};
export const legacyRedirects: Record<string,string> = {
 "/services/web-design": "/services/design/web-design", "/services/branding": "/services/design/brand-identity",
 "/services/seo": "/services/growth/seo", "/services/social-media": "/services/growth/social-media-marketing",
};
export const servicePages: ServicePageData[] = [
 ...data.pages,
 ...legacy.filter(item => !legacyRedirects[`/services/${item.slug}`]).map(item => ({
 path: `/services/${item.slug}`, kind: "service", title: item.title, description: item.description, image: "/images/hero-services.png",
 parent: "/services", group: "growth", intro: item.intro, fit: item.fit, deliverables: item.deliverables,
 inputs: [item.consideration], process: item.process, faq: item.faq,
 ...((data as { legacyEditorial?: Record<string,EditorialCopy> }).legacyEditorial?.[`/services/${item.slug}`] || {}),
 })),
];
export const serviceGroups = data.groups;
export const mainPages = main.pages;
export const findServicePage = (path: string) => servicePages.find(page => page.path === path);
export const findMainPage = (path: string) => mainPages.find(page => page.path === path);
export const childrenOf = (path: string) => servicePages.filter(page => page.parent === path);
export function breadcrumbItems(path: string): { title: string; path: string }[] {
 if (path === "/") return [{ title: "صفحه اصلی", path: "/" }];
 const page = findServicePage(path);
 const parent = page?.parent || (path.startsWith("/live-case-studies/") ? "/live-case-studies" : "/");
 const own = page || findMainPage(path) || (path === "/portfolio" ? portfolio : undefined);
 return [...breadcrumbItems(parent), { title: own?.title || "صفحه", path }];
}
export type PublicEntry = { path: string; kind: string; title: string; description: string; image: string; socialId: string; slug?: string };
const socialId = (path: string) => path === "/" ? "home" : path === "/about-us" ? "about" : path.slice(1).replaceAll("/", "-");
export const publicEntries: PublicEntry[] = [
 { path: "/", kind: "home", title: home.seo.title, description: home.seo.description, image: home.hero.image, socialId: "home" },
 { path: "/portfolio", kind: "portfolio", title: portfolio.title, description: portfolio.description, image: portfolio.image, socialId: "portfolio" },
 ...mainPages.map(page => ({ path: page.path, kind: page.kind, title: page.title, description: page.description, image: page.image, socialId: socialId(page.path) })),
 ...servicePages.map(page => ({ ...page, kind: page.kind === "catalog" || page.kind === "group" ? "services" : "service", socialId: socialId(page.path) })),
];
