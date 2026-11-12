import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { getVisual } from "@/lib/visuals";

const projects = [
  { title: "طراحی لوگو آرین سیما", category: "دیجیتال مارکتینگ · شبکه‌های اجتماعی", image: getVisual("design").src },
  { title: "کارت ویزیت سفید", category: "طراحی وب‌سایت", image: getVisual("development").src },
  { title: "کار سریع پروژه‌ها", category: "تولید محتوا · دیجیتال مارکتینگ", image: getVisual("automation").src },
  { title: "نمایش پوسترها", category: "برندینگ · تولید محتوا", image: getVisual("design").src },
];

export function Portfolio() {
  return <section className="section-space" id="portfolio"><Container>
    <SectionIntro eyebrow="آخرین پروژه‌ها" title={<>از ایده تا تصویری<br /><span className="gradient-text">که دیده می‌شود.</span></>} description="نمونه‌هایی از پروژه‌های معرفی‌شدهٔ تاپ لینک شو؛ از هویت بصری و اقلام چاپی تا حضور دیجیتال برند." />
    <CardGrid label="نمونه‌های پروژه" mobileScroll>{projects.map(project=><FeatureCard key={project.title} title={project.title} category={project.category} image={project.image} imageAlt={project.title} />)}</CardGrid>
    <div className="mt-8 flex justify-end"><Link className="text-link" href="/contact#consultation">برای پروژهٔ شما از کجا شروع کنیم؟<ArrowUpLeft size={18} aria-hidden="true" /></Link></div>
  </Container></section>;
}
