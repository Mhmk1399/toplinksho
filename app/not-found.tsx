import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: false },
};
export default function NotFound() {
  return (
    <main id="main-content" className="pb-12 sm:pb-20">
      <PageHero
        eyebrow="خطای ۴۰۴ · صفحه پیدا نشد"
        title={<>این صفحه پیدا نشد.</>}
        description="ممکن است لینک قدیمی باشد یا آدرس تغییر کرده باشد. از صفحهٔ اصلی یا خدمات، مسیرتان را ادامه دهید."
        image="/images/hero-404.webp"
        imageAlt="مجسمهٔ سه‌بعدی عدد ۴۰۴ از شیشه و کروم، با نور آبی و صورتی و یک حلقهٔ مداری"
        note="مسیر پیدا نشد."
        detail="یک کلیک تا برگشت به خانه"
        coordinate="404 / LOST IN DIGITAL SPACE"
        primary={{ label: "بازگشت به صفحهٔ اصلی", href: "/" }}
        secondary={{ label: "مشاهدهٔ خدمات", href: "/services" }}
        capabilities={[]}
      />
    </main>
  );
}
