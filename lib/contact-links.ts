import { site } from "@/lib/site";

export type ContactChannel = "phone" | "whatsapp" | "instagram" | "email" | "linkedin";
export type ContactLink = { id: ContactChannel; label: string; href: string; detail: string; external: boolean };

const channels: ContactLink[] = [
  { id: "phone", label: "تماس تلفنی", href: `tel:${site.phone}`, detail: site.phoneDisplay, external: false },
  { id: "whatsapp", label: "واتساپ", href: site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, "")}` : "", detail: "گفت‌وگو دربارهٔ پروژه", external: true },
  { id: "instagram", label: "اینستاگرام", href: site.instagram, detail: site.instagram ? "صفحهٔ تاپ لینک شو" : "به‌زودی", external: true },
  { id: "email", label: "ایمیل", href: `mailto:${site.email}`, detail: site.email, external: false },
  { id: "linkedin", label: "لینکدین", href: site.linkedin, detail: "همراه ما در لینکدین", external: true },
];

// Keep the requested Instagram slot visible until the owner supplies its URL.
export const contactLinks = channels.filter(channel => Boolean(channel.href) || channel.id === "instagram");
