import Link from "next/link";
import { ArrowDown, ArrowLeft, Bot, ListFilter, CalendarCheck, BarChart3, PenLine, MessagesSquare } from "lucide-react";
import content from "@/content/home.fa.json";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { SectionIntro } from "@/components/shared/SectionIntro";

const icons = [Bot, ListFilter, CalendarCheck, BarChart3, PenLine, MessagesSquare];
const visuals = ["automation", "growth", "development", "growth", "design", "automation"] as const;
function solutionCard(item: (typeof content.ai.items)[number], index: number) {
  const Icon = icons[index] || Bot;
  return <FeatureCard key={item.id} title={item.title} description={item.description}
    visual={visuals[index]} category="هوش مصنوعی" icon={<Icon size={18} />} />;
}
export function AISolutions() {
  const section = content.ai;
  return <section id="ai-solutions" aria-labelledby="ai-title" className="home-section scroll-mt-28">
    <Container>
      <SectionIntro compact headingId="ai-title" eyebrow={section.eyebrow} title={section.title} description={section.description} />
      <CardGrid label="ابزارهای هوش مصنوعی" mobileScroll>{section.items.slice(0,3).map(solutionCard)}</CardGrid>
      <details className="group mt-4">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl border border-white/10 px-5 py-3 text-sm leading-7 text-slate-300 transition-colors hover:border-accent/40 hover:text-accent [&::-webkit-details-marker]:hidden">{section.moreLabel}<ArrowDown size={16} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
        <div className="mt-4"><CardGrid label="ابزارهای تکمیلی هوش مصنوعی" mobileScroll>{section.items.slice(3).map((item,index)=>solutionCard(item,index+3))}</CardGrid></div>
      </details>
      <Link href={section.cta.href} className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-lg text-sm text-accent transition-colors hover:text-white">{section.cta.label}<ArrowLeft size={16} aria-hidden="true" /></Link>
    </Container>
  </section>;
}
