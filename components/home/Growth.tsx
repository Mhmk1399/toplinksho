import { ChartNoAxesCombined, Globe2, Waypoints } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { SectionIntro } from "@/components/shared/SectionIntro";

const benefits = [
  { icon: Globe2, title: "بازاری فراتر از مرزها", text: "دیجیتال مارکتینگ فرصت دیده‌شدن در بازارهای تازه را فراهم می‌کند؛ با انتخاب کانال مناسب، می‌توانید به مخاطبانی برسید که پیش از این دسترسی به آن‌ها آسان نبود." },
  { icon: ChartNoAxesCombined, title: "هزینهٔ هدفمند، تصمیم دقیق‌تر", text: "یک برنامهٔ هدفمند کمک می‌کند منابع بازاریابی را به مخاطب مناسب اختصاص دهید. داده‌ها و تحلیل عملکرد نشان می‌دهند کجا ادامه بدهیم و کجا مسیر را تغییر دهیم." },
  { icon: Waypoints, title: "محتوایی که دست‌به‌دست می‌شود", text: "ترکیب متن، عکس، ویدیو و ایدهٔ درست، کمپینی می‌سازد که مخاطب بخواهد آن را ببیند و به اشتراک بگذارد؛ فرصتی برای ارتباط بیشتر با برند شما." },
];

export function Growth() {
  return <section className="section-space border-y border-white/5 bg-panel/30"><Container>
    <SectionIntro eyebrow="رشد کسب‌وکار" title={<>برند شدن سخت نیست؛<br /><span className="gradient-text">مسیر درست می‌خواهد.</span></>} description="چگونه با دیجیتال مارکتینگ کسب‌وکار خود را رونق دهیم؟ از شناخت بازار و مخاطب شروع می‌کنیم و با محتوا، طراحی و تبلیغات ادامه می‌دهیم." />
    <CardGrid label="مزیت‌های دیجیتال مارکتینگ" mobileScroll>{benefits.map(({icon:Icon,title,text})=><FeatureCard key={title} title={title} description={text} visual="growth" category="دیجیتال مارکتینگ" icon={<Icon size={18} />} />)}</CardGrid>
  </Container></section>;
}
