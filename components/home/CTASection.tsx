import Link from "next/link";
import { ArrowUpLeft, Mail, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export function CTASection() {
  return <section className="section-space contact-section" id="contact"><Container>
    <div className="contact-panel">
      <div><span className="eyebrow">فصل بعدی برند شما</span><h2>از یک گفت‌وگو<br /><span className="gradient-text">شروع کنیم.</span></h2><p>هدفتان چیست و چه چیزی جلوی رسیدن به آن را گرفته؟<br />دربارهٔ پروژه، نیازها و مسیر پیش رو با ما صحبت کنید.</p><Link href="/contact#consultation" className="text-link mt-6">مشاوره رایگان<ArrowUpLeft size={18} aria-hidden="true" /></Link></div>
      <div className="contact-options"><a className="contact-main" href={`tel:${site.phone}`}><span><Phone size={21} aria-hidden="true" />تماس برای گفت‌وگو</span><strong dir="ltr">0912 219 1549</strong><ArrowUpLeft size={24} aria-hidden="true" /></a><a className="contact-email" href={`mailto:${site.email}`}><Mail size={19} aria-hidden="true" /><span dir="ltr">{site.email}</span><ArrowUpLeft size={19} aria-hidden="true" /></a><p>{site.address}</p></div>
    </div>
  </Container></section>;
}
