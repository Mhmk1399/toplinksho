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
    <section className="relative py-32 max-md:py-20" id="about"><Container className="grid grid-cols-2 items-center gap-20 max-lg:gap-10 max-md:grid-cols-1">
      <div className="relative min-h-[500px] overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_65%_25%,rgba(240,43,120,.24),transparent_35%),linear-gradient(145deg,#151236,#080d22)] shadow-2xl max-md:min-h-[380px]">
        <div className="absolute inset-[13%] rounded-[50%] border border-violet-400/20"><span className="absolute inset-[12%] rounded-3xl border border-white/15 bg-[#0d1537]/80 shadow-[0_25px_70px_rgba(0,0,0,.4)] before:absolute before:inset-x-[12%] before:top-[18%] before:h-2 before:rounded-full before:bg-gradient-to-l before:from-pink-500 before:to-blue-500"><i className="absolute left-[16%] top-[34%] h-[38%] w-[12%] rounded-t-lg bg-violet-500/70" /><i className="absolute left-[35%] top-[45%] h-[27%] w-[12%] rounded-t-lg bg-blue-500/70" /><i className="absolute left-[54%] top-[27%] h-[45%] w-[12%] rounded-t-lg bg-pink-500/70" /><b className="absolute bottom-[12%] right-[12%] h-px w-[70%] bg-white/20" /></span><span className="absolute bottom-[-10%] left-[20%] h-[18%] w-[60%] rounded-[50%] bg-violet-500/20 blur-xl" /></div>
        <button className="absolute left-1/2 top-1/2 z-10 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-white/10 text-white shadow-xl backdrop-blur-md transition hover:scale-105" aria-label="پخش ویدیوی معرفی تاپ لینک شو"><CirclePlay size={58} strokeWidth={1.4} /></button>
        <span className="absolute bottom-6 right-6 rounded-full border border-white/10 bg-[#050817]/60 px-4 py-2 text-sm text-white/65 backdrop-blur-md">فضای خلاقیت و همکاری</span>
      </div>
      <div><SectionHeader eyebrow="تفاوت ما" title="چرا تاپ لینک شو؟" description="ما فقط یک تیم تبلیغاتی نیستیم؛ شریک رشد کسب‌وکار شما هستیم." />
        <div className="mt-9 grid gap-5">{benefits.map(({ icon: Icon, title, description }) => <div className="flex items-start gap-4" key={title}><span className="grid size-11 shrink-0 place-items-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-violet-300"><Icon size={21} /></span><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-7 text-white/50">{description}</p></div></div>)}</div>
        <a className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-pink-300 transition hover:gap-3" href="#contact">درباره ما بیشتر بدانید <ArrowLeft size={17} /></a>
      </div>
    </Container></section>
  );
}
