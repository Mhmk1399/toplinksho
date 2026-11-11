import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionIntro } from "@/components/shared/SectionIntro";

const projects = [
  { title: "طراحی لوگو آرین سیما", category: "دیجیتال مارکتینگ · شبکه‌های اجتماعی", image: "/images/portfolio-aryan.webp" },
  { title: "کارت ویزیت سفید", category: "طراحی وب‌سایت", image: "/images/portfolio-card.webp" },
  { title: "کار سریع پروژه‌ها", category: "تولید محتوا · دیجیتال مارکتینگ", image: "/images/portfolio-creative.webp" },
  { title: "نمایش پوسترها", category: "برندینگ · تولید محتوا", image: "/images/portfolio-posters.webp" },
];

export function Portfolio() {
  return <section className="section-space" id="portfolio"><Container>
    <SectionIntro eyebrow="آخرین پروژه‌ها" title={<>از ایده تا تصویری<br /><span className="gradient-text">که دیده می‌شود.</span></>} description="نمونه‌هایی از پروژه‌های معرفی‌شدهٔ تاپ لینک شو؛ از هویت بصری و اقلام چاپی تا حضور دیجیتال برند." />
    <div className="grid gap-5 sm:grid-cols-2">{projects.map(project => <article key={project.title} className="group overflow-hidden rounded-3xl border border-white/10 bg-panel">
      <div className="relative aspect-[1.35] overflow-hidden bg-white/3"><Image src={project.image} alt={project.title} fill sizes="(max-width: 639px) 95vw, (max-width: 1440px) 46vw, 640px" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /></div>
      <div className="p-6"><p className="text-xs text-muted">{project.category}</p><h3 className="mt-3 text-xl font-semibold">{project.title}</h3></div>
    </article>)}</div>
    <div className="mt-8 flex justify-end"><Link className="text-link" href="/contact#consultation">برای پروژهٔ شما از کجا شروع کنیم؟<ArrowUpLeft size={18} aria-hidden="true" /></Link></div>
  </Container></section>;
}
