import { ArrowLeft, Crosshair, MoveUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";

export function CTASection() {
  return (
    <section className="relative py-12"><Container><GlassCard className="grid min-h-[390px] grid-cols-2 items-center overflow-hidden bg-[radial-gradient(circle_at_20%_30%,rgba(240,43,120,.18),transparent_35%),linear-gradient(125deg,rgba(49,87,255,.12),rgba(15,23,55,.65))] px-16 max-md:grid-cols-1 max-md:px-7 max-md:py-12" padding="none" radius="xl" glow>
      <div className="relative z-10"><span className="mb-4 inline-flex text-sm font-semibold text-pink-300">قدم بعدی</span><h2 className="text-[clamp(30px,3.6vw,48px)] leading-[1.4] font-extrabold">بیایید رشد برند شما را شروع کنیم</h2><p className="mb-7 mt-4 text-lg text-white/65">در تاپ لینک شو، تخصص ما رشد کسب‌وکار شماست.</p><Button href="#contact" size="lg" icon={<ArrowLeft size={18} />}>مشاوره رایگان دریافت کنید</Button></div>
      <div className="relative mx-auto size-72 max-md:hidden" aria-label="جایگاه تصویر سه‌بعدی هدف و پیکان"><span className="absolute inset-0 rounded-full border-[3px] border-pink-400/25 shadow-[0_0_70px_rgba(240,43,120,.2)]" /><span className="absolute inset-10 rounded-full border-[3px] border-violet-400/35" /><span className="absolute inset-20 grid place-items-center rounded-full border-[3px] border-blue-400/50 bg-blue-500/10"><Crosshair className="size-16 text-pink-300" /></span><MoveUpRight className="absolute -right-5 top-5 size-32 rotate-[-12deg] text-white drop-shadow-[0_10px_20px_rgba(0,0,0,.35)]" /></div>
    </GlassCard></Container></section>
  );
}
