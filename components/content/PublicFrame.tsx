import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageHero } from "@/components/shared/PageHero";
import { PageStructuredData } from "@/components/shared/PageStructuredData";
type FramePage = { path: string; title: string; description: string; heroDescription?: string; image: string; eyebrow?: string };
export function PublicFrame({ page, children, secondary = { label: "جزئیات این صفحه", href: "#overview" }, schema = true }: { page: FramePage; children: ReactNode; secondary?: { label: string; href: string }; schema?: boolean }) {
 return <main id="main-content" className="public-page">
  {schema && <PageStructuredData path={page.path} />}
  <Breadcrumbs path={page.path} />
  <PageHero eyebrow={page.eyebrow || "خدمات تاپ لینک شو"} title={page.title} description={page.heroDescription || page.description} image={page.image}
   imageAlt={page.image.includes("about") ? "حلقه‌های شیشه‌ای و کروم با هستهٔ آبی؛ نماد همکاری تیمی" : page.image.includes("contact") ? "المان سه‌بعدی گفت‌وگو و ارتباط با نور آبی و صورتی" : "المان‌های دیجیتال و پنل‌های شیشه‌ای با رنگ‌های لوگوی تاپ لینک شو"}
   note="از نیاز شما شروع کنیم." detail="دامنهٔ روشن، اجرای هماهنگ" coordinate="TOPLINKSHO / A CLEAR PATH"
   primary={{ label: "مشاوره رایگان", href: page.path === "/contact" || page.path === "/pricing" ? "#consultation" : "/contact#consultation" }} secondary={secondary} capabilities={[]} />
  {children}
 </main>;
}
