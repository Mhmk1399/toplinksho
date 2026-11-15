import content from "@/content/home.fa.json";
import { FAQSection } from "@/components/shared/FAQSection";

export function HomeFAQ() {
  const section = content.faq;
  return <FAQSection id="faq" headingId="home-faq-title" items={section.items} title={section.title} highlight={section.eyebrow} eyebrow={section.eyebrow} description={section.description} cta={section.cta} />;
}
