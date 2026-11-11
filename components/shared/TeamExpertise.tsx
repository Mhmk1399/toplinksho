import { Compass, Palette, Clapperboard, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionIntro } from "@/components/shared/SectionIntro";

const areas = [
  { icon: Compass, title: "استراتژی و دیجیتال مارکتینگ", subtitle: "از شناخت مسئله تا طراحی مسیر", text: "برنامه‌ریزی کمپین، تحلیل مخاطب و انتخاب کانال‌های مناسب برای رشد برند شما.", skills: ["استراتژی برند و کمپین", "تبلیغات آنلاین و گوگل ادز", "تحلیل و بهینه‌سازی عملکرد"] },
  { icon: Palette, title: "طراحی و تجربهٔ دیجیتال", subtitle: "از هویت بصری تا وب‌سایت", text: "هماهنگی میان چیزی که برند می‌گوید و تصویری که مخاطب در هر نقطهٔ تماس می‌بیند.", skills: ["هویت بصری و طراحی گرافیک", "طراحی سایت و تجربهٔ کاربری", "اقلام چاپی و دیجیتال"] },
  { icon: Clapperboard, title: "محتوا و شبکه‌های اجتماعی", subtitle: "از ایده تا ارتباط ماندگار", text: "تولید محتوای متن، عکس و ویدیو؛ با لحن و برنامه‌ای که با مخاطب شما ارتباط برقرار کند.", skills: ["تولید محتوای تخصصی", "تدوین و تیزر تبلیغاتی", "مدیریت شبکه‌های اجتماعی"] },
];

export function TeamExpertise() {
  return <section className="section-space" id="team"><Container>
    <SectionIntro eyebrow="تیم تاپ لینک شو" title={<>تخصص‌های متفاوت؛<br /><span className="gradient-text">یک هدف مشترک.</span></>} description="تیم‌های استراتژی، طراحی، تولید محتوا و تبلیغات کنار هم کار می‌کنند تا اجزای حضور دیجیتال برند شما هماهنگ پیش بروند." />
    <div className="grid gap-5 md:grid-cols-3">{areas.map(({ icon: Icon, title, subtitle, text, skills }) => <article key={title} className="overflow-hidden rounded-3xl border border-white/10 bg-panel">
      <div className="relative grid h-40 place-items-center overflow-hidden border-b border-white/5 bg-linear-to-br from-brand-blue/20 via-transparent to-brand-pink/10"><span aria-hidden="true" className="absolute size-44 rounded-full border border-accent/15" /><span aria-hidden="true" className="absolute size-28 rotate-45 rounded-3xl border border-accent/20" /><Icon size={52} strokeWidth={1.1} aria-hidden="true" className="text-accent" /></div>
      <div className="p-6"><p className="mb-2 text-xs text-accent">{subtitle}</p><h3 className="text-lg font-semibold">{title}</h3><p className="mt-4 text-sm leading-8 text-muted">{text}</p><ul className="mt-5 space-y-3 border-t border-white/5 pt-5">{skills.map(skill => <li className="flex items-center gap-2 text-xs text-muted" key={skill}><Check size={14} className="text-accent" aria-hidden="true" />{skill}</li>)}</ul></div>
    </article>)}</div>
  </Container></section>;
}
