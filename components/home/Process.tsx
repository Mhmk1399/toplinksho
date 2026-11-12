import content from "@/content/home.fa.json";
import { Container } from "@/components/ui/Container";
import { SectionIntro } from "@/components/shared/SectionIntro";

export function Process() {
  const section = content.process;
  return <section id="process" aria-labelledby="process-title" className="home-section scroll-mt-28 border-y border-white/5">
    <Container>
      <SectionIntro compact headingId="process-title" eyebrow={section.eyebrow} title={section.title} description={section.description} />
      <ol className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">{section.steps.map((step, index) => <li key={step.id} className="border-t border-accent/25 pt-5">
        <span className="text-sm font-semibold text-accent" aria-hidden="true">{new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(index + 1)}</span>
        <h3 className="mt-4 text-base font-bold">{step.title}</h3><p className="mt-2 text-sm leading-7 text-muted">{step.description}</p>
      </li>)}</ol>
    </Container>
  </section>;
}
