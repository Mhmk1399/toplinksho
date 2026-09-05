import { ArrowLeft, BarChart4, CirclePlay, Gauge, Lightbulb, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

const benefits = [
  { icon: BarChart4, title: "استراتژی داده‌محور", description: "تصمیم‌گیری بر اساس داده و تحلیل بازار" },
  { icon: Users, title: "تیم متخصص و خلاق", description: "ترکیب تجربه، طراحی، مارکتینگ و تکنولوژی" },
  { icon: Lightbulb, title: "گزارش‌دهی شفاف", description: "گزارش‌های دقیق و شفاف از عملکرد کمپین‌ها" },
  { icon: Gauge, title: "نتایج قابل اندازه‌گیری", description: "تمرکز بر بازگشت سرمایه و رشد کسب‌وکار" },
];

export function WhyUs() {
  return (
    <section className="section why-section" id="about"><Container className="why-grid">
      <div className="studio-visual">
        <div className="studio-stage"><span className="studio-orbit" /><span className="studio-screen"><i /><i /><i /><b /></span><span className="studio-desk" /></div>
        <button className="play-button" aria-label="پخش ویدیوی معرفی تاپ لینک شو"><CirclePlay size={58} strokeWidth={1.4} /></button>
        <span className="visual-label">فضای خلاقیت و همکاری</span>
      </div>
      <div className="why-content"><SectionHeader eyebrow="تفاوت ما" title="چرا تاپ لینک شو؟" description="ما فقط یک تیم تبلیغاتی نیستیم؛ شریک رشد کسب‌وکار شما هستیم." />
        <div className="benefit-list">{benefits.map(({ icon: Icon, title, description }) => <div className="benefit" key={title}><span><Icon size={21} /></span><div><h3>{title}</h3><p>{description}</p></div></div>)}</div>
        <a className="text-link" href="#contact">درباره ما بیشتر بدانید <ArrowLeft size={17} /></a>
      </div>
    </Container></section>
  );
}
