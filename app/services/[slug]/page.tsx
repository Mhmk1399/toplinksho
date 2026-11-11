import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/shared/PageStructuredData";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpLeft, Check, ChevronLeft, Plus } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getService, services } from "@/lib/services";
import { PageHero } from "@/components/shared/PageHero";

const heroTitles: Record<string, [string, string, string]> = {
  "web-design": ["طراحی سایت،", "تجربهٔ بهتر،", "مسیر رشد."],
  "social-media": ["محتوای درست،", "ارتباط واقعی،", "برند ماندگار."],
  branding: ["هویت روشن،", "تصویر منسجم،", "برند شما."],
  "google-ads": ["در لحظهٔ", "جست‌وجو،", "دیده شوید."],
  campaigns: ["یک ایده،", "یک کمپین،", "یک مسیر روشن."],
  "graphic-design": ["تصویر برند،", "زبان خلاق،", "طراحی ماندگار."],
  "content-production": ["روایت شما،", "محتوای تازه،", "ارتباط بیشتر."],
  seo: ["جست‌وجوی بهتر،", "مسیر روشن‌تر،", "حضور مؤثر."],
  "online-advertising": ["مخاطب درست،", "پیام مناسب،", "تبلیغ هدفمند."],
};

type ServicePageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  return pageMetadata(`/services/${slug}`);
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <main id="main-content" className="pb-16">
      <PageStructuredData path={`/services/${slug}`} />
      <PageHero eyebrow={service.title} title={<>{heroTitles[slug][0]}<br />{heroTitles[slug][1]}<br /><span className="gradient-text">{heroTitles[slug][2]}</span></>} description={service.description} image="/images/hero-services.webp" imageAlt="المان سه‌بعدی خدمات دیجیتال مارکتینگ با رنگ‌های لوگوی تاپ لینک شو" note="از نیاز واقعی شروع کنیم." detail="طراحی. اجرا. بهبود." coordinate="A CLEAR PATH FOR YOUR BRAND" secondary={{ label: "جزئیات همکاری", href: "#scope" }} footnote="دامنهٔ روشن، اجرای هماهنگ و ارزیابی نتیجه" />
      <Container>
        <nav aria-label="مسیر صفحه" className="mt-10 mb-12 flex flex-wrap items-center gap-2 text-xs text-slate-400 sm:text-sm">
          <Link href="/" className="transition hover:text-white">خانه</Link>
          <ChevronLeft aria-hidden="true" size={14} />
          <Link href="/services" className="transition hover:text-white">خدمات</Link>
          <ChevronLeft aria-hidden="true" size={14} />
          <span aria-current="page" className="text-slate-200">{service.title}</span>
        </nav>
        <section className="mb-12 grid gap-5 rounded-3xl border border-white/10 bg-panel/70 p-6 md:grid-cols-[.6fr_1.4fr] md:p-8"><h2 className="text-xl font-semibold">این خدمت برای چه کسب‌وکاری مناسب است؟</h2><p className="text-sm leading-9 text-muted">{service.fit}</p></section>

        <section id="scope" aria-labelledby="scope-title" className="scroll-mt-32 border-t border-white/10 py-16 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div><p className="mb-3 text-sm text-pink-300">نگاه ما به این خدمت</p><h2 id="scope-title" className="text-2xl font-bold leading-relaxed sm:text-3xl">از نیاز واقعی،<br />تا خروجی قابل استفاده.</h2></div>
            <p className="text-base leading-9 text-slate-300 sm:text-lg">{service.intro}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-6 sm:p-8"><h3 className="mb-6 text-xl font-semibold">حوزه‌های همکاری</h3><ul className="space-y-5">{service.capabilities.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-300 sm:text-base"><Check aria-hidden="true" size={18} className="mt-1 shrink-0 text-violet-300" />{item}</li>)}</ul></div>
            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-6 sm:p-8"><h3 className="mb-6 text-xl font-semibold">خروجی‌های قابل تعریف</h3><ul className="space-y-5">{service.deliverables.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-300 sm:text-base"><span aria-hidden="true" className="mt-3 size-1.5 shrink-0 rounded-full bg-pink-300" />{item}</li>)}</ul></div>
          </div>
          <p className="mt-6 rounded-2xl border-r-2 border-violet-400/60 bg-violet-400/[.04] px-5 py-4 text-sm leading-7 text-slate-400">دامنه دقیق همکاری: {service.consideration}</p>
        </section>

        <section aria-labelledby="process-title" className="border-t border-white/10 py-16 sm:py-20">
          <p className="mb-3 text-sm text-violet-300">مسیر همکاری</p>
          <h2 id="process-title" className="text-2xl font-bold sm:text-3xl">شفاف، از اولین گفت‌وگو تا تحویل.</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{service.process.map((step, index) => <li key={step} className="border-t border-white/15 pt-6"><span className="text-sm text-pink-300">{String(index + 1).padStart(2, "0").replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])}</span><p className="mt-5 text-sm leading-8 text-slate-300">{step}</p></li>)}</ol>
        </section>

        <section aria-labelledby="faq-title" className="grid gap-8 border-t border-white/10 py-16 lg:grid-cols-[.7fr_1.3fr] lg:gap-20 sm:py-20">
          <div><p className="mb-3 text-sm text-violet-300">پیش از شروع</p><h2 id="faq-title" className="text-2xl font-bold sm:text-3xl">پرسش‌های رایج</h2></div>
          <div className="divide-y divide-white/10">{service.faq.map(({ question, answer }) => <details key={question} className="group py-5 first:pt-0"><summary className="flex cursor-pointer list-none items-start justify-between gap-5 rounded-md py-2 text-base font-medium leading-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 [&::-webkit-details-marker]:hidden">{question}<Plus aria-hidden="true" size={20} className="mt-1 shrink-0 text-violet-300 transition-transform group-open:rotate-45" /></summary><p className="mt-3 pl-8 text-sm leading-8 text-slate-400">{answer}</p></details>)}</div>
        </section>

        <section aria-labelledby="start-title" className="rounded-[28px] border border-violet-400/20 bg-[linear-gradient(120deg,rgba(139,92,246,.12),rgba(236,72,153,.04))] p-7 sm:p-12">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center"><div><p className="mb-3 text-sm text-pink-300">قدم بعدی</p><h2 id="start-title" className="text-2xl font-bold leading-relaxed sm:text-3xl">از مسئله شما شروع کنیم.</h2><p className="mt-4 max-w-xl text-sm leading-8 text-slate-300">درباره کسب‌وکار، هدف و نیازتان بگویید تا مسیر و دامنه مناسب همکاری را بررسی کنیم.</p></div><Link href="/contact#consultation" className={buttonClasses({ size: "lg" })}>شروع گفت‌وگو<ArrowLeft aria-hidden="true" size={18} /></Link></div>
        </section>

        <nav aria-label="سایر خدمات" className="mt-16"><h2 className="mb-6 text-lg font-semibold">مسیرهای دیگر همکاری</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{services.filter((item) => item.slug !== service.slug).map((item) => <Link key={item.slug} href={`/services/${item.slug}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-5 text-sm leading-7 text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-400/5 hover:text-white">{item.title}<ArrowUpLeft aria-hidden="true" size={18} className="shrink-0 text-violet-300" /></Link>)}</div></nav>
      </Container>
    </main>
  );
}
