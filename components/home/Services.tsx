import Link from "next/link";
import { ArrowUpLeft, Globe2, Megaphone, MousePointerClick, Share2, Shapes } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { services } from "@/lib/services";
const icons = [Globe2, Share2, Shapes, MousePointerClick, Megaphone];
export function Services() {
  return <section className="section-space" id="services"><Container><div className="section-heading"><div><span className="eyebrow">راهکارهای ما / ۰۱</span><h2>هر چالش،<br /><span className="muted">یک نقطه شروع.</span></h2></div><p>لازم نیست از همه‌جا شروع کنید. راهکاری را انتخاب کنید که به هدف امروز کسب‌وکارتان نزدیک‌تر است.</p></div><div className="service-grid">{services.map((service,index)=>{const Icon=icons[index % icons.length]; return <Link className={`service-tile ${index===0 ? "service-featured" : ""}`} href={`/services/${service.slug}`} key={service.slug}><div className="tile-top"><span className="service-icon"><Icon size={25} strokeWidth={1.4} /></span><span className="small-number" dir="ltr">0{index+1}</span></div><h3>{service.title}</h3><p>{service.description}</p><span className="tile-link">کشف این راهکار <ArrowUpLeft size={20}/></span></Link>})}<div className="service-question"><span className="eyebrow">از کجا شروع کنیم؟</span><h3>اول مسئله را بشناسیم،<br />بعد راه‌حل را بسازیم.</h3><Link className="text-link" href="/#contact">گفت‌وگو درباره پروژه <ArrowUpLeft size={20}/></Link></div></div></Container></section>;
}
