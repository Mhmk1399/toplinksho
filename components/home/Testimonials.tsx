import { Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { SectionIntro } from "@/components/shared/SectionIntro";

const testimonials = [
  { name: "دکتر زارع", role: "متخصص پوست و مو", quote: "به درآمد مطلوبی از فضای دیجیتال رسیدم.", work: "تبلیغات و شبکه‌های اجتماعی" },
  { name: "دکتر طهرانی", role: "مدیریت کلینیک", quote: "از اعتمادم به تیم حرفه‌ای شما واقعاً خوشحالم.", work: "تبلیغات آنلاین و گوگل ادز" },
  { name: "دکتر هادی کاظمی", role: "مدیریت کلینیک", quote: "به تیم حرفه‌ای مثل شما ... خرسندیم.", work: "تولید محتوا، برندینگ و طراحی سایت" },
];

export function Testimonials() {
  return <section className="section-space border-y border-white/5 bg-panel/30"><Container>
    <SectionIntro eyebrow="نظرات مشتریان" title={<>همکاری که از اعتماد<br /><span className="gradient-text">شروع می‌شود.</span></>} description="گزیده‌ای کوتاه از دیدگاه‌های منتشرشدهٔ مشتریان دربارهٔ همکاری با تاپ لینک شو." />
    <CardGrid label="دیدگاه مشتریان" mobileScroll>{testimonials.map(item=><FeatureCard key={item.name} title={item.name} description={<q>{item.quote}</q>} category={item.role} visual="design" icon={<Quote size={18} />} footer={<p className="text-xs leading-7 text-muted">{item.work}</p>} />)}</CardGrid>
  </Container></section>;
}
