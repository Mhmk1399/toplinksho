import Link from "next/link";
import { ArrowUpLeft, Megaphone, Shapes, Share2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionIntro } from "@/components/shared/SectionIntro";

const cards = [
  { icon: Megaphone, title: "مشاوره و کمپین‌های تبلیغاتی", text: "مشاوره و برنامه‌ریزی تبلیغاتی برای شرکت‌ها و کلینیک‌ها؛ با شناخت مخاطب، تعیین پیام و طراحی مسیر اجرای کمپین.", href: "/services/campaigns" },
  { icon: Shapes, title: "تبلیغات و برندینگ", text: "برندینگ و تبلیغات در شبکه‌های اجتماعی، سایت، گوگل ادز و رسانه‌های محیطی؛ در چارچوب یک هویت و پیام هماهنگ.", href: "/services/branding" },
  { icon: Share2, title: "شبکه‌های اجتماعی", text: "از استراتژی و تولید محتوا تا مدیریت حضور برند، تبلیغات و طراحی کمپین در اینستاگرام، تلگرام و شبکه‌های مناسب مخاطب شما.", href: "/services/social-media" },
];

export function Services() {
  return <section className="section-space" id="services"><Container>
    <SectionIntro eyebrow="برند شدن سخت نیست!" title={<>ایده‌تان را به یک<br /><span className="gradient-text">برند دیدنی تبدیل کنیم.</span></>} description="حضور مؤثر دیجیتال، ترکیبی از شناخت مخاطب، محتوای درست و اجرای هماهنگ است. از راهکاری شروع کنید که به مسئلهٔ امروزتان نزدیک‌تر است." />
    <div className="grid gap-5 md:grid-cols-3">{cards.map(({ icon: Icon, title, text, href }, index) => <Link href={href} key={href} className={`group flex flex-col rounded-3xl border p-7 transition-[transform,border-color] hover:-translate-y-1 hover:border-accent/50 ${index === 0 ? "border-brand-pink/20 bg-linear-to-br from-brand-pink/10 to-panel" : "border-white/10 bg-panel"}`}>
      <Icon size={30} strokeWidth={1.4} className="mb-8 text-accent" aria-hidden="true" /><h3 className="text-xl font-semibold">{title}</h3><p className="mt-4 mb-7 text-sm leading-8 text-muted">{text}</p><span className="mt-auto flex min-h-11 items-center justify-between border-t border-white/5 pt-4 text-xs text-accent">بیشتر بدانید<ArrowUpLeft size={19} aria-hidden="true" /></span>
    </Link>)}</div>
  </Container></section>;
}
