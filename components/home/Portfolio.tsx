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
    <section className="section portfolio-section" id="portfolio"><AmbientBackground variant="portfolio" /><Container>
      <div className="portfolio-heading"><SectionHeader eyebrow="کارهایی که نتیجه ساختند" title="نمونه کارهای ما" description="نتایجی که برای مشتریان خود خلق کرده‌ایم" /><div className="portfolio-controls"><button aria-label="پروژه قبلی"><ArrowRight /></button><button aria-label="پروژه بعدی"><ArrowLeft /></button></div></div>
      <div className="portfolio-grid">{projects.map((project) => <PortfolioCard key={project.name} {...project} />)}</div>
      <div className="section-action"><Button href="#contact" variant="secondary" icon={<ArrowLeft size={18} />}>مشاهده همه نمونه کارها</Button></div>
    </Container></section>
  );
}
