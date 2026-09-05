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
    <div className={`floating-contact ${open ? "is-open" : ""}`}>
      <div className="contact-options">
        {options.map(({ label, href, icon: Icon }) => (
          <a key={label} href={href} aria-label={label}><span>{label}</span><Icon size={18} /></a>
        ))}
      </div>
      <button onClick={() => setOpen(!open)} aria-label={open ? "بستن راه‌های ارتباطی" : "نمایش راه‌های ارتباطی"} aria-expanded={open}>
        {open ? <X size={23} /> : <MessageCircle size={23} />}
      </button>
    </div>
  );
}
