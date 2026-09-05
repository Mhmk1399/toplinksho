"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export type FAQItem = { question: string; answer: string };

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div className={`faq-item ${open ? "is-open" : ""}`} key={item.question}>
            <button onClick={() => setOpenIndex(open ? null : index)} aria-expanded={open}>
              <span>{item.question}</span>{open ? <Minus size={20} /> : <Plus size={20} />}
            </button>
            <div className="faq-answer" aria-hidden={!open}><div><p>{item.answer}</p></div></div>
          </div>
        );
      })}
    </div>
  );
}
