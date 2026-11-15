import { ChartNoAxesColumnIncreasing, ChevronDown, Layers3, Star } from "lucide-react";
import { useId } from "react";
import { FAQExclusiveFallback } from "@/components/ui/FAQExclusiveFallback";

export type FAQItem = { id?: string; question: string; answer: string };
const icons = [Star, Layers3, ChartNoAxesColumnIncreasing];

/** Native disclosures preserve every answer in server HTML and work without JS. */
export function FAQAccordion({ items, defaultOpenIndex = 0, className = "" }: { items: readonly FAQItem[]; defaultOpenIndex?: number | null; className?: string }) {
  const group = useId();
  return <div id={group} className={`faq-accordion ${className}`}>
    <FAQExclusiveFallback group={group} />
    {items.map((item, index) => {
      const Icon = icons[index % icons.length];
      // Native interaction/history can change `open` before React loads. Keep that
      // browser-owned state; exempt only this element's attributes, not its children.
      return <details className="faq-item" key={item.id || item.question} name={group} open={defaultOpenIndex === index} suppressHydrationWarning data-service-reveal>
        <summary className="faq-summary">
          <span className="faq-question-icon" aria-hidden="true"><Icon size={23} /></span>
          <span className="faq-question">{item.question}</span>
          <ChevronDown className="faq-chevron" size={18} aria-hidden="true" />
        </summary>
        <div className="faq-answer"><p>{item.answer}</p></div>
      </details>;
    })}
  </div>;
}
