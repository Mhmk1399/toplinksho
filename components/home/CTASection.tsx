import { ArrowLeft, Crosshair, MoveUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";

export function CTASection() {
  return (
    <section className="cta-section"><Container><GlassCard className="cta-card" padding="lg" radius="xl" glow glowColor="rgba(240,43,120,.2)">
      <div className="cta-copy"><span className="eyebrow">قدم بعدی</span><h2>بیایید رشد برند شما را شروع کنیم</h2><p>در تاپ لینک شو، تخصص ما رشد کسب‌وکار شماست.</p><Button href="#contact" size="lg" icon={<ArrowLeft size={18} />}>مشاوره رایگان دریافت کنید</Button></div>
      <div className="target-visual" aria-label="جایگاه تصویر سه‌بعدی هدف و پیکان"><span className="target-ring ring-one" /><span className="target-ring ring-two" /><span className="target-ring ring-three"><Crosshair /></span><MoveUpRight className="target-arrow" /></div>
    </GlassCard></Container></section>
  );
}
