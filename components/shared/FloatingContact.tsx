"use client";

import { useState } from "react";
import { Headphones, MessageCircle, Phone, Send, X } from "lucide-react";

const options = [
  { label: "تماس", href: "tel:+982100000000", icon: Phone },
  { label: "واتساپ", href: "https://wa.me/989120000000", icon: MessageCircle },
  { label: "تلگرام", href: "https://t.me/toplinksho", icon: Send },
  { label: "مشاوره رایگان", href: "#contact", icon: Headphones },
];

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-7 left-7 z-50 flex flex-col items-end gap-3 max-md:bottom-4 max-md:left-4">
      <div className={`flex flex-col gap-2 transition duration-300 ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>
        {options.map(({ label, href, icon: Icon }) => (
          <a className="flex items-center gap-3 rounded-full border border-white/10 bg-[#111841]/90 py-2.5 pr-4 pl-3 text-sm shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20" key={label} href={href} aria-label={label}><span>{label}</span><Icon size={18} /></a>
        ))}
      </div>
      <button className="grid size-14 place-items-center rounded-full bg-[linear-gradient(135deg,#3157ff,#8b3dff_50%,#f02b78)] shadow-[0_12px_35px_rgba(124,58,237,.45)] transition hover:-translate-y-1" onClick={() => setOpen(!open)} aria-label={open ? "بستن راه‌های ارتباطی" : "نمایش راه‌های ارتباطی"} aria-expanded={open}>
        {open ? <X size={23} /> : <MessageCircle size={23} />}
      </button>
    </div>
  );
}
