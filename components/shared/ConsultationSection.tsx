import { ArrowUpLeft, Mail, Phone, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/shared/ContactForm";
import { site } from "@/lib/site";

type ConsultationContent = { eyebrow: string; title: string; description: string; formTitle: string };

export function ConsultationSection({ id = "consultation", closing = false, content, compact = false }: { id?: string; closing?: boolean; content?: ConsultationContent; compact?: boolean }) {
  return <section className={compact ? "home-section" : "section-space"} id={id} aria-labelledby={`${id}-title`}><Container>
    <div className="grid items-start gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
      <div className="lg:sticky lg:top-36">
        <span className="eyebrow">{content?.eyebrow || "فرم مشاوره رایگان"}</span><h2 id={`${id}-title`} className={compact ? "home-title font-extrabold" : "text-4xl leading-[1.65] font-extrabold lg:text-5xl"}>{content?.title || (closing ? <>فصل بعدی برندتان،<br /><span className="gradient-text">از همین‌جا.</span></> : <>اولین قدم،<br /><span className="gradient-text">یک گفت‌وگو است.</span></>)}</h2>
        <p className="mt-5 max-w-md text-sm leading-8 text-muted">{content?.description || "دربارهٔ کسب‌وکار، هدف و نیازتان بنویسید. با هم بررسی می‌کنیم کدام راهکار برای مسیر امروز شما مناسب‌تر است."}</p>
        {!compact && <><div className="mt-8 space-y-3">
          <a href={`tel:${site.phone}`} className="neon-surface flex min-h-16 items-center gap-4 px-5"><Phone size={20} aria-hidden="true" className="text-accent" /><div className="flex-1"><span className="block text-[11px] text-muted">ترجیح می‌دهید صحبت کنیم؟</span><span className="mt-1 inline-block text-base" dir="ltr">{site.phoneDisplay}</span></div><ArrowUpLeft size={18} aria-hidden="true" /></a>
          <a href={`mailto:${site.email}`} className="neon-surface flex min-h-14 items-center gap-4 px-5 text-sm"><Mail size={20} aria-hidden="true" className="text-accent" /><span dir="ltr" className="min-w-0 flex-1 break-all">{site.email}</span><ArrowUpLeft size={18} aria-hidden="true" /></a>
        </div>
        <p className="mt-6 flex items-start gap-2 text-xs leading-7 text-muted"><ShieldCheck size={16} className="mt-1 shrink-0 text-accent" aria-hidden="true" />اطلاعات تماس شما برای بررسی درخواست و هماهنگی مشاوره استفاده می‌شود.</p></>}
      </div>
      <div className="neon-surface p-5 sm:p-8 lg:p-9"><h3 className="mb-7 border-b border-white/10 pb-5 text-lg font-semibold">{content?.formTitle || "در چه زمینه‌ای همراهتان باشیم؟"}</h3><ContactForm /></div>
    </div>
  </Container></section>;
}
