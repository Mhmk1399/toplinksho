import content from "@/content/home.fa.json";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { NarrativeCopy } from "@/components/content/NarrativeCopy";

export function HomeServices() {
  return <section id="services" aria-label={content.services.label} className="scroll-mt-28 pb-6 pt-3">
    <Container><h2 className="sr-only">{content.services.label}</h2>
      <div className="mb-7"><NarrativeCopy intro={content.services.description} paragraphs={content.services.bodyParagraphs} /></div>
      <CardGrid label={content.services.label} mobileScroll>
        {content.services.items.map(service => <FeatureCard key={service.id}
          title={service.title} description={service.description} href={service.href}
          category={service.features[0]} linkLabel={"خدمات " + service.title} />)}
      </CardGrid>
    </Container>
  </section>;
}
