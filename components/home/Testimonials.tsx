import { Quote, UserRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionIntro } from "@/components/shared/SectionIntro";

const testimonials = [
  { name: "دکتر زارع", role: "متخصص پوست و مو", quote: "به درآمد مطلوبی از فضای دیجیتال رسیدم.", work: "تبلیغات و شبکه‌های اجتماعی" },
  { name: "دکتر طهرانی", role: "مدیریت کلینیک", quote: "از اعتمادم به تیم حرفه‌ای شما واقعاً خوشحالم.", work: "تبلیغات آنلاین و گوگل ادز" },
  { name: "دکتر هادی کاظمی", role: "مدیریت کلینیک", quote: "به تیم حرفه‌ای مثل شما ... خرسندیم.", work: "تولید محتوا، برندینگ و طراحی سایت" },
];

export function Testimonials() {
  return <section className="section-space border-y border-white/5 bg-panel/30"><Container>
    <SectionIntro eyebrow="نظرات مشتریان" title={<>همکاری که از اعتماد<br /><span className="gradient-text">شروع می‌شود.</span></>} description="گزیده‌ای کوتاه از دیدگاه‌های منتشرشدهٔ مشتریان دربارهٔ همکاری با تاپ لینک شو." />
    <div className="grid gap-4 md:grid-cols-3">{testimonials.map(item => <figure className="flex flex-col rounded-3xl border border-white/10 bg-ink/60 p-6 md:p-7" key={item.name}>
      <Quote className="mb-6 text-brand-pink/70" size={27} aria-hidden="true" /><blockquote className="mb-7 flex-1 text-base leading-9 text-white/90">«{item.quote}»</blockquote>
      <figcaption><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-white/5 text-accent"><UserRound size={19} aria-hidden="true" /></span><div><span className="block text-sm font-medium">{item.name}</span><span className="mt-1 block text-[11px] text-muted">{item.role}</span></div></div><p className="mt-5 border-t border-white/5 pt-4 text-[11px] text-muted">{item.work}</p></figcaption>
    </figure>)}</div>
  </Container></section>;
}
