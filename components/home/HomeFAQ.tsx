import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import content from "@/content/home.fa.json";
import { Container } from "@/components/ui/Container";

export function HomeFAQ() {
  const section = content.faq;
  return <section id="faq" aria-labelledby="home-faq-title" className="home-section scroll-mt-28">
    <Container><div className="grid items-start gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
      <div><span className="eyebrow">{section.eyebrow}</span><h2 id="home-faq-title" className="home-title font-extrabold">{section.title}</h2><p className="mt-3 text-sm leading-7 text-muted">{section.description}</p>
        <Link href={section.cta.href} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-accent transition-colors hover:text-white">{section.cta.label}<ArrowLeft size={16} aria-hidden="true" /></Link>
      </div>
      <div className="divide-y divide-white/10">{section.items.map(item => <details className="group py-4 first:pt-0" key={item.id}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg text-sm font-semibold leading-7 transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">{item.question}<Plus size={17} className="shrink-0 text-accent transition-transform group-open:rotate-45 motion-reduce:transition-none" aria-hidden="true" /></summary>
        <p className="pt-3 text-sm leading-8 text-muted">{item.answer}</p>
      </details>)}</div>
    </div></Container>
  </section>;
}
