import { ArrowUpLeft, Mail, Phone, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/shared/ContactForm";
import { site } from "@/lib/site";

export function ConsultationSection({ id = "consultation", closing = false }: { id?: string; closing?: boolean }) {
  return <section className="section-space" id={id}><Container>
    <div className="grid items-start gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
      <div className="lg:sticky lg:top-36">
        <span className="eyebrow">فرم مشاوره رایگان</span><h2 className="text-4xl leading-[1.65] font-extrabold lg:text-5xl">{closing ? <>فصل بعدی برندتان،<br /><span className="gradient-text">از همین‌جا.</span></> : <>اولین قدم،<br /><span className="gradient-text">یک گفت‌وگو است.</span></>}</h2>
        <p className="mt-5 max-w-md text-sm leading-8 text-muted">دربارهٔ کسب‌وکار، هدف و نیازتان بنویسید. با هم بررسی می‌کنیم کدام راهکار برای مسیر امروز شما مناسب‌تر است.</p>
        <div className="mt-8 space-y-3">
          <a href={`tel:${site.phone}`} className="flex min-h-16 items-center gap-4 rounded-2xl border border-white/10 bg-panel/70 px-5 transition-colors hover:border-accent/40"><Phone size={20} aria-hidden="true" className="text-accent" /><div className="flex-1"><span className="block text-[11px] text-muted">ترجیح می‌دهید صحبت کنیم؟</span><span className="mt-1 inline-block text-base" dir="ltr">{site.phoneDisplay}</span></div><ArrowUpLeft size={18} aria-hidden="true" /></a>
          <a href={`mailto:${site.email}`} className="flex min-h-14 items-center gap-4 rounded-2xl border border-white/10 px-5 text-sm transition-colors hover:border-accent/40"><Mail size={20} aria-hidden="true" className="text-accent" /><span dir="ltr" className="min-w-0 flex-1 break-all">{site.email}</span><ArrowUpLeft size={18} aria-hidden="true" /></a>
        </div>
        <p className="mt-6 flex items-start gap-2 text-xs leading-7 text-muted"><ShieldCheck size={16} className="mt-1 shrink-0 text-accent" aria-hidden="true" />اطلاعات تماس شما برای بررسی درخواست و هماهنگی مشاوره استفاده می‌شود.</p>
      </div>
      <div className="rounded-3xl border border-white/12 bg-linear-to-br from-white/4 via-panel to-panel p-5 sm:p-8 lg:p-9"><h3 className="mb-7 border-b border-white/10 pb-5 text-lg font-semibold">در چه زمینه‌ای همراهتان باشیم؟</h3><ContactForm /></div>
    </div>
  </Container></section>;
}
