import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import type { FeatureCardProps } from "@/components/ui/FeatureCard";
import { FAQSection, type FAQSectionProps } from "@/components/shared/FAQSection";

export function FaqBlock(props: FAQSectionProps) {
 return <FAQSection description="پاسخ به پرسش‌های مهم دربارهٔ دامنهٔ کار، اطلاعات اولیه و مسیر شروع همکاری." {...props} />;
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
