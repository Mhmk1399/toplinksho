import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/shared/PageStructuredData";
import { Mail, MapPin, Phone, ArrowUpLeft } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/ui/Container";
import { ConsultationSection } from "@/components/shared/ConsultationSection";
import { ContactMap } from "@/components/shared/ContactMap";
import { site } from "@/lib/site";


export const metadata = pageMetadata("/contact");

export default function ContactPage() {
  return <main id="main-content">
    <PageStructuredData path="/contact" />
    <PageHero eyebrow="با ما تماس بگیرید" title={<>از یک<br />گفت‌وگو<br /><span className="gradient-text">شروع کنیم.</span></>} description={<>کارشناسان ما آمادهٔ پاسخ‌گویی به شما هستند.<br />دربارهٔ ایده، هدف و مسئلهٔ کسب‌وکارتان بگویید.</>} image="/images/hero-contact.webp" imageAlt="حباب گفت‌وگو، پاکت نامه و گوشی تلفن سه‌بعدی با جنس کروم و شیشه" note="مسیر بعدی، با یک گفت‌وگو." detail="شنیدن نیاز شما، اولین قدم ماست." coordinate="LET’S TALK ABOUT YOUR NEXT CHAPTER" primary={{ label: "مشاوره رایگان", href: "#consultation" }} secondary={{ label: "راه‌های ارتباطی", href: "#contact-details" }} footnote="فرم را تکمیل کنید یا از راه‌های زیر مستقیم با ما در تماس باشید." capabilities={["مشاوره و انتخاب مسیر", "بررسی نیاز پروژه", "طراحی و محتوا", "تبلیغات و رشد"]} />
    <section className="section-space pb-0!" id="contact-details"><Container><div className="grid gap-4 md:grid-cols-3">
      <a href={`tel:${site.phone}`} className="group rounded-3xl border border-white/10 bg-panel/70 p-7 transition-colors hover:border-accent/40"><Phone className="mb-6 text-accent" size={25} aria-hidden="true" /><span className="block text-xs text-muted">ارتباط با کارشناسان</span><span className="mt-3 block text-xl font-semibold" dir="ltr">{site.phoneDisplay}</span><span className="mt-5 flex items-center gap-2 text-xs text-accent">تماس بگیرید<ArrowUpLeft size={16} aria-hidden="true" /></span></a>
      <a href={`mailto:${site.email}`} className="group rounded-3xl border border-white/10 bg-panel/70 p-7 transition-colors hover:border-accent/40"><Mail className="mb-6 text-accent" size={25} aria-hidden="true" /><span className="block text-xs text-muted">راه ارتباطی ایمیل</span><span className="mt-3 block break-all text-lg font-medium" dir="ltr">{site.email}</span><span className="mt-5 flex items-center gap-2 text-xs text-accent">برای ما بنویسید<ArrowUpLeft size={16} aria-hidden="true" /></span></a>
      <div className="rounded-3xl border border-white/10 bg-panel/70 p-7"><MapPin className="mb-6 text-accent" size={25} aria-hidden="true" /><span className="block text-xs text-muted">دفتر اصلی شرکت</span><address className="mt-3 text-sm leading-8 not-italic">{site.address}</address><p className="mt-3 text-xs leading-7 text-muted">برای مراجعهٔ حضوری، پیش از مراجعه با ما هماهنگ کنید.</p></div>
    </div></Container></section>
    <ConsultationSection /><section className="pb-20 md:pb-28"><Container><ContactMap /></Container></section>
  </main>;
}
