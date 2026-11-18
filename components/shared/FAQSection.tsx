import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";
import { assetUrl } from "@/lib/assets";

export type FAQSectionProps = {
  items: readonly FAQItem[];
  id?: string;
  headingId?: string;
  title?: string;
  highlight?: string;
  eyebrow?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  cta?: { label: string; href: string };
  defaultOpenIndex?: number | null;
};

export function FAQSection({ items, id = "faq", headingId = `${id}-title`, title = "پرسش‌های رایج", highlight, eyebrow = "سوالات متداول", description = "پاسخ به پرسش‌های مهم دربارهٔ هدف، دامنهٔ کار و مسیر شروع همکاری.", image = "/images/faq-question.png", imageAlt = "", cta, defaultOpenIndex = 0 }: FAQSectionProps) {
  if (!items.length) return null;
  const accent = highlight || (title.includes("رایج") ? "رایج" : "");
  const position = accent ? title.indexOf(accent) : -1;
  return <section id={id} aria-labelledby={headingId} className="home-section faq-section scroll-mt-32">
    <div className="faq-scene" aria-hidden="true"><span className="faq-sphere faq-sphere--one" /><span className="faq-sphere faq-sphere--two" /><span className="faq-light-arc" /></div>
    <Container><div className="faq-reference-grid">
      <div className="faq-intro" data-service-reveal>
        <span className="faq-eyebrow">{eyebrow}</span>
        <h2 id={headingId} className="home-title font-extrabold">{position < 0 ? title : <>{title.slice(0, position)}<span>{accent}</span>{title.slice(position + accent.length)}</>}</h2>
      </div>
      <figure className="faq-figure" data-service-reveal>
        <Image className="faq-illustration" src={assetUrl(image)} alt={imageAlt} width={560} height={480} sizes="(min-width: 1024px) 430px, (min-width: 768px) 300px, (max-width: 351px) calc(100vw - 32px), 320px" loading="lazy" />
      </figure>
      <div className="faq-questions"><FAQAccordion items={items} defaultOpenIndex={defaultOpenIndex} /></div>
      {(description || cta) && <div className="faq-context" data-service-reveal>
        {description && <p>{description}</p>}
        {cta && <Link href={cta.href} className="faq-contact-link">{cta.label}<ArrowLeft size={16} aria-hidden="true" /></Link>}
      </div>}
    </div></Container>
  </section>;
}
