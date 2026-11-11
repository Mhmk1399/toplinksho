import Link from "next/link";
import { ArrowUpLeft, Clapperboard, Globe2, Megaphone, Palette, Share2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionIntro } from "@/components/shared/SectionIntro";

const specialties = [
  { icon: Globe2, title: "طراحی وب", text: "سایت‌های فروشگاهی، شرکتی و خدماتی با طراحی واکنش‌گرا و تجربهٔ کاربری روشن.", slug: "web-design" },
  { icon: Share2, title: "شبکه‌های اجتماعی", text: "استراتژی محتوا، مدیریت حضور برند و ارتباط با مخاطب در شبکه‌های مناسب.", slug: "social-media" },
  { icon: Megaphone, title: "تبلیغات آنلاین", text: "تبلیغات شبکه‌های اجتماعی، گوگل ادز و رسانه‌های آنلاین با برنامهٔ مشخص.", slug: "online-advertising" },
  { icon: Palette, title: "طراحی گرافیکی", text: "از بنر و پست تبلیغاتی تا کاتالوگ و بیلبورد؛ با زبان بصری هماهنگ.", slug: "graphic-design" },
  { icon: Clapperboard, title: "تدوین ویدیو", text: "تدوین و ساخت ویدیو، انیمیشن و تیزر تبلیغاتی برای روایت بهتر برند شما.", slug: "content-production" },
];

export function Expertise() {
  return <section className="section-space"><Container>
    <SectionIntro eyebrow="حوزه‌های تخصصی" title={<>هر چیزی که برندتان<br /><span className="gradient-text">برای دیده‌شدن نیاز دارد.</span></>} description="تخصص‌ها کنار هم قرار می‌گیرند تا طراحی، محتوا و تبلیغات، یک داستان مشترک دربارهٔ برند شما تعریف کنند." />
    <div className="divide-y divide-white/10 border-y border-white/10">{specialties.map(({ icon: Icon, title, text, slug }) => <Link key={slug} href={`/services/${slug}`} className="group grid gap-4 py-6 transition-colors hover:bg-white/2 sm:grid-cols-[48px_1fr_auto] sm:items-center sm:gap-6 md:py-7">
      <Icon size={25} strokeWidth={1.4} className="text-accent" aria-hidden="true" /><div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-8 text-muted">{text}</p></div><ArrowUpLeft className="hidden text-accent transition-transform group-hover:-translate-x-1 sm:block" size={23} aria-hidden="true" />
    </Link>)}</div>
  </Container></section>;
}
