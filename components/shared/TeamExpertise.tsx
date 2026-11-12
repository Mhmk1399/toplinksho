import { Compass, Palette, Clapperboard, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { SectionIntro } from "@/components/shared/SectionIntro";

const areas = [
  { icon: Compass, title: "استراتژی و دیجیتال مارکتینگ", subtitle: "از شناخت مسئله تا طراحی مسیر", text: "برنامه‌ریزی کمپین، تحلیل مخاطب و انتخاب کانال‌های مناسب برای رشد برند شما.", skills: ["استراتژی برند و کمپین", "تبلیغات آنلاین و گوگل ادز", "تحلیل و بهینه‌سازی عملکرد"] },
  { icon: Palette, title: "طراحی و تجربهٔ دیجیتال", subtitle: "از هویت بصری تا وب‌سایت", text: "هماهنگی میان چیزی که برند می‌گوید و تصویری که مخاطب در هر نقطهٔ تماس می‌بیند.", skills: ["هویت بصری و طراحی گرافیک", "طراحی سایت و تجربهٔ کاربری", "اقلام چاپی و دیجیتال"] },
  { icon: Clapperboard, title: "محتوا و شبکه‌های اجتماعی", subtitle: "از ایده تا ارتباط ماندگار", text: "تولید محتوای متن، عکس و ویدیو؛ با لحن و برنامه‌ای که با مخاطب شما ارتباط برقرار کند.", skills: ["تولید محتوای تخصصی", "تدوین و تیزر تبلیغاتی", "مدیریت شبکه‌های اجتماعی"] },
];

export function TeamExpertise() {
  return <section className="section-space" id="team"><Container>
    <SectionIntro eyebrow="تیم تاپ لینک شو" title={<>تخصص‌های متفاوت؛<br /><span className="gradient-text">یک هدف مشترک.</span></>} description="تیم‌های استراتژی، طراحی، تولید محتوا و تبلیغات کنار هم کار می‌کنند تا اجزای حضور دیجیتال برند شما هماهنگ پیش بروند." />
    <CardGrid label="تخصص‌های تیم" mobileScroll>{areas.map(({icon:Icon,title,subtitle,text,skills},index)=><FeatureCard key={title}
      title={title} description={text} category={subtitle} visual={(["growth","design","automation"] as const)[index]} icon={<Icon size={18} />}>
      <ul className="space-y-3">{skills.map(skill=><li key={skill} className="flex items-center gap-2 text-xs leading-7 text-muted"><Check size={14} className="shrink-0 text-accent" aria-hidden="true" />{skill}</li>)}</ul>
    </FeatureCard>)}</CardGrid>
  </Container></section>;
}
