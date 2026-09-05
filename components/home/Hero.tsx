import Image from "next/image";
import { ArrowLeft, BarChart3, TrendingUp } from "lucide-react";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";

const brands = ["DIGIKALA", "snapp! food", "TAPSI", "divar", "cafebazaar"];

export function Hero() {
  return (
    <section className="hero" id="top">
      <AmbientBackground variant="hero" />
      <Container className="hero-inner">
        <div className="hero-copy">
          <span className="eyebrow"><i /> آژانس دیجیتال مارکتینگ</span>
          <h1>راهکارهای خلاقانه<br />برای <span className="gradient-text">رشد برند شما</span></h1>
          <p>ما در تاپ لینک شو با ترکیب استراتژی، خلاقیت و تکنولوژی، کمپین‌هایی طراحی می‌کنیم که برند شما را در ذهن مخاطب ماندگار می‌کند.</p>
          <div className="hero-actions">
            <Button href="#services" size="lg" icon={<ArrowLeft size={19} />}>مشاهده خدمات</Button>
            <Button href="#contact" size="lg" variant="secondary">مشاوره رایگان</Button>
          </div>
          <div className="hero-proof"><div className="avatar-stack"><span>ن</span><span>د</span><span>س</span></div><p><strong>۹۸٪ رضایت</strong><br />همراه بیش از ۱۵۰ برند</p></div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-shell">
            <Image src="/images/toplinksho-hero-3d.png" alt="موشک سفید در کنار کره دیجیتال، نماد رشد برند" fill priority sizes="(max-width: 768px) 90vw, 50vw" />
          </div>
          <GlassCard className="floating-metric metric-growth" padding="sm"><span className="metric-icon pink"><TrendingUp size={17} /></span><div><small>نرخ رشد</small><strong dir="ltr">+128%</strong><svg viewBox="0 0 88 24" aria-hidden="true"><path d="M2 21 C18 20 20 12 34 14 S49 18 58 8 S75 7 86 2" /></svg></div></GlassCard>
          <GlassCard className="floating-metric metric-roas" padding="sm"><span className="metric-icon blue"><BarChart3 size={17} /></span><div><small>بازده سرمایه‌گذاری</small><strong dir="ltr">4.7x</strong><em dir="ltr">ROAS</em></div></GlassCard>
        </div>

        <GlassCard className="trusted-brands" padding="none" radius="xl">
          <p>برندهایی که به ما اعتماد کرده‌اند</p>
          <div>{brands.map((brand) => <span key={brand} dir="ltr">{brand}</span>)}</div>
        </GlassCard>
      </Container>
    </section>
  );
}
