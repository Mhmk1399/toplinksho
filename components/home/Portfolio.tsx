import { ArrowLeft, ArrowRight } from "lucide-react";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { PortfolioCard } from "@/components/shared/ContentCards";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

const projects = [
  { name: "برند آرایشی آریانا", category: "کمپین اینستاگرام", result: "۲.۳ برابر رشد تعامل", visual: "cosmetic", size: "wide" },
  { name: "Snapp Food", category: "کمپین تبلیغاتی", result: "افزایش ۴۱٪ نرخ تبدیل", visual: "food", size: "tall" },
  { name: "فروشگاه آنلاین", category: "طراحی و توسعه وب", result: "تجربه خرید سریع‌تر", visual: "commerce", size: "standard" },
  { name: "برند پوشاک نو", category: "مدیریت شبکه‌های اجتماعی", result: "۱۲۸٪ رشد دسترسی", visual: "fashion", size: "standard" },
];

export function Portfolio() {
  return (
    <section className="relative py-32 max-md:py-20" id="portfolio"><AmbientBackground variant="portfolio" /><Container>
      <div className="flex items-end justify-between gap-8 max-sm:items-start"><SectionHeader eyebrow="کارهایی که نتیجه ساختند" title="نمونه کارهای ما" description="نتایجی که برای مشتریان خود خلق کرده‌ایم" /><div className="flex gap-2 max-sm:hidden"><button className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10" aria-label="پروژه قبلی"><ArrowRight /></button><button className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10" aria-label="پروژه بعدی"><ArrowLeft /></button></div></div>
      <div className="mt-14 grid auto-rows-[minmax(140px,auto)] grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">{projects.map((project) => <PortfolioCard key={project.name} {...project} />)}</div>
      <div className="mt-10 text-center"><Button href="#contact" variant="secondary" icon={<ArrowLeft size={18} />}>مشاهده همه نمونه کارها</Button></div>
    </Container></section>
  );
}
