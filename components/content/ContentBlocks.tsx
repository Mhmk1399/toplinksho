import Link from "next/link";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import type { FeatureCardProps } from "@/components/ui/FeatureCard";
import type { FAQ } from "@/lib/page-registry";

export function FaqBlock({ items, id = "faq", title = "پرسش‌های رایج" }: { items: FAQ[]; id?: string; title?: string }) {
 if(!items.length)return null;
 return <section id={id} aria-labelledby={id+"-title"} className="home-section scroll-mt-32"><Container><div className="grid items-start gap-8 lg:grid-cols-[.6fr_1.4fr] lg:gap-16">
  <div data-service-reveal><span className="eyebrow">پیش از شروع</span><h2 id={id+"-title"} className="home-title font-extrabold">{title}</h2><p className="mt-3 text-sm leading-7 text-muted">پاسخ به پرسش‌های مهم دربارهٔ دامنهٔ کار، اطلاعات اولیه و مسیر شروع همکاری.</p></div>
  <div className="divide-y divide-line">{items.map(item=><details data-service-reveal key={item.question} className="group py-4 first:pt-0"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg text-sm font-semibold leading-7 transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">{item.question}<Plus size={17} aria-hidden="true" className="shrink-0 text-accent transition-transform group-open:rotate-45 motion-reduce:transition-none" /></summary><p className="pt-3 text-sm leading-8 text-muted">{item.answer}</p></details>)}</div>
 </div></Container></section>;
}
export function PageCTA() {
 return <section className="pb-14 pt-4"><Container><div data-service-reveal className="neon-surface flex flex-col items-start justify-between gap-6 rounded-3xl p-6 sm:flex-row sm:items-center sm:p-8"><div><h2 className="route-card-title font-bold">نیاز پروژه‌تان را با ما در میان بگذارید.</h2><p className="mt-2 text-sm leading-7 text-muted">مسیر مناسب و دامنهٔ همکاری را با هم مشخص می‌کنیم.</p></div><Link href="/contact#consultation" className={buttonClasses({size:"sm"})}>مشاوره رایگان<ArrowLeft size={16} aria-hidden="true" /></Link></div></Container></section>;
}
export type LinkCardData = { path: string; title: string; description: string };
export function LinkCards({ items, compact = false, headingAs = "h3" }: { items: LinkCardData[]; compact?: boolean; headingAs?: FeatureCardProps["headingAs"] }) {
 return <CardGrid label="راهکارهای مرتبط" mobileScroll>{items.map(item=><FeatureCard key={item.path} title={item.title}
  description={item.description} href={item.path} category="راهکار تخصصی" headingAs={headingAs} compact={compact} />)}</CardGrid>;
}
export function EditorialSections({ sections, intro, id = "overview", artworkContext }: { sections: {title:string;text:string;items?:string[]}[]; intro?:string; id?:string; artworkContext?: string }) {
 return <section id={id} className="home-section scroll-mt-32"><Container>
  {intro && <p className="mb-8 max-w-4xl text-base leading-9 text-slate-300">{intro}</p>}
  <CardGrid label="رویکرد و خدمات" mobileScroll>{sections.map((section,index)=><FeatureCard key={section.title} title={section.title} description={section.text}
   headingAs="h2" category="تاپ لینک شو" artworkKey={artworkContext ? "section:" + artworkContext + ":" + index : undefined} visual={(["design","development","growth"] as const)[index%3]}>
   {section.items && <ul className="space-y-3">{section.items.map(item=><li key={item} className="flex items-start gap-2 text-sm leading-7 text-slate-300"><Check size={16} className="mt-1 shrink-0 text-accent" aria-hidden="true" />{item}</li>)}</ul>}
  </FeatureCard>)}</CardGrid>
 </Container></section>;
}
