import Image from "next/image";
import { ArrowLeft, ArrowDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return <section className="hero-stage" id="top"><Container>
    <div className="hero-grid">
      <div className="hero-copy">
        <span className="eyebrow"><span className="status-dot" /> استراتژی، خلاقیت، تکنولوژی</span>
        <h1>دیده شوید.<br />متفاوت بمانید.<br /><span className="gradient-text">رشد کنید.</span></h1>
        <p className="hero-description">از اولین جست‌وجو تا انتخاب برند شما؛<br />مسیر دیجیتال کسب‌وکارتان را با هم می‌سازیم.</p>
        <div className="hero-actions"><Button href="/#contact" size="lg" icon={<ArrowLeft size={18} />}>درباره پروژه‌تان صحبت کنیم</Button><a className="text-link" href="#services">کشف راهکارها <ArrowDown size={16} /></a></div>
        <div className="hero-footnote"><Sparkles size={16} /><span>یک مسیر یکپارچه؛ از ایده تا اجرا و بهینه‌سازی</span></div>
      </div>
      <div className="hero-art">
        <span className="orbit orbit-one" /><span className="orbit orbit-two" />
        <span className="art-coordinate" dir="ltr">BUILT FOR YOUR NEXT CHAPTER</span>
        <Image src="/images/toplinksho-hero-3d.png" alt="موشک و کره دیجیتال؛ تصویر مفهومی رشد" fill priority sizes="(max-width: 768px) 90vw, 48vw" className="hero-image" />
        <div className="art-note"><span className="status-dot" /><div><strong>رشد، اتفاقی نیست.</strong><span>استراتژی روشن. اجرای هماهنگ.</span></div></div>
        <span className="art-number" dir="ltr">01 / NEXT LEVEL</span>
      </div>
    </div>
    <div className="capability-strip"><span>از یک ایده،<br /><strong>تا یک تجربه کامل.</strong></span><span>استراتژی و کمپین</span><span>هویت برند</span><span>توسعه وب</span><span>شبکه‌های اجتماعی</span><span dir="ltr">Google Ads</span></div>
  </Container></section>;
}
