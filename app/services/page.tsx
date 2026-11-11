import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/shared/PageStructuredData";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { ServiceCatalog } from "@/components/shared/ServiceCatalog";
import { ConsultationSection } from "@/components/shared/ConsultationSection";
import { buttonClasses } from "@/components/ui/Button";

const quality = [
  { title: "طراحی سایت", text: "واکنش‌گرایی، تجربهٔ کاربری و عملکرد فنی" },
  { title: "بهینه‌سازی سئو", text: "ساختار، کیفیت محتوا و مسیر دیده‌شدن در جست‌وجو" },
  { title: "تبلیغات آنلاین", text: "تناسب مخاطب، پیام و کانال تبلیغاتی" },
  { title: "طراحی گرافیکی", text: "هماهنگی با هویت برند و وضوح پیام" },
  { title: "تولید محتوا", text: "مفیدبودن محتوا و تناسب با نیاز مخاطب" },
  { title: "شبکه‌های اجتماعی", text: "انسجام انتشار و کیفیت ارتباط با مخاطب" },
];

export const metadata = pageMetadata("/services");

export default function ServicesPage() {
  return <main id="main-content">
    <PageStructuredData path="/services" />
    <PageHero eyebrow="خدمات تاپ لینک شو" title={<>یک تیم.<br />همهٔ مسیرهای<br /><span className="gradient-text">رشد برند.</span></>} description={<>از طراحی و تولید محتوا تا تبلیغات و سئو؛<br />راهکارهایی هماهنگ برای نیاز امروز کسب‌وکار شما.</>} image="/images/hero-services.webp" imageAlt="کره، پنل‌های شیشه‌ای بازاریابی و نمادهای تبلیغات با نور صورتی و آبی" note="از استراتژی تا اجرا." detail="راهکار مناسب. در زمان مناسب." coordinate="CONNECTED IDEAS. REAL EXECUTION." secondary={{ label: "کشف خدمات", href: "#service-catalog" }} footnote="لازم نیست از همه‌جا شروع کنید؛ از نیاز اصلی برندتان شروع کنیم." />
    <section className="section-space" id="service-catalog"><Container><SectionIntro eyebrow="راهکارهای ما" title={<>برای هر چالش،<br /><span className="gradient-text">یک نقطهٔ شروع.</span></>} description="هر خدمت را می‌توانید به‌صورت مستقل یا در کنار راهکارهای مکمل انتخاب کنید. دامنهٔ دقیق همکاری پس از شناخت نیاز شما مشخص می‌شود." /><ServiceCatalog /></Container></section>
    <section className="section-space border-y border-white/5 bg-panel/30"><Container><SectionIntro eyebrow="معیارهای کیفیت" title={<>کیفیت را با هدف پروژه<br /><span className="gradient-text">می‌سنجیم.</span></>} description="پیش از شروع، مشخص می‌کنیم خروجی مناسب برای پروژهٔ شما چه ویژگی‌هایی دارد؛ سپس بر اساس همان معیارها، نتیجه را بررسی می‌کنیم." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{quality.map(item => <article key={item.title} className="rounded-2xl border border-white/10 bg-ink/60 p-6"><div className="flex items-center gap-3"><Check size={18} aria-hidden="true" className="text-accent" /><h3 className="text-base font-semibold">{item.title}</h3></div><p className="mt-3 text-sm leading-8 text-muted">{item.text}</p></article>)}</div><div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-3xl border border-accent/15 bg-accent/3 p-7 sm:flex-row sm:items-center"><p className="text-base leading-8">هنوز نمی‌دانید کدام راهکار برای شما مناسب است؟</p><Link href="#consultation" className={buttonClasses()}>از یک مشاوره شروع کنیم<ArrowLeft size={17} aria-hidden="true" /></Link></div></Container></section>
    <ConsultationSection />
  </main>;
}
