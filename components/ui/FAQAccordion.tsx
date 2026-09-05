"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export type FAQItem = { question: string; answer: string };

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="grid gap-3">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.035]" key={item.question}>
            <button className="flex w-full items-center justify-between gap-5 p-5 text-right font-semibold" onClick={() => setOpenIndex(open ? null : index)} aria-expanded={open}>
              <span>{item.question}</span>{open ? <Minus size={20} /> : <Plus size={20} />}
            </button>
            <div className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`} aria-hidden={!open}><div className="overflow-hidden"><p className="px-5 pb-5 leading-8 text-white/65">{item.answer}</p></div></div>
          </div>
        );
      })}
    </div>
  );
}
