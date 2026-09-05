"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const links = [
  ["خانه", "#top"], ["خدمات", "#services"], ["نمونه کارها", "#portfolio"],
  ["درباره ما", "#about"], ["مقالات", "#blog"], ["تماس با ما", "#contact"],
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 py-5 transition-all duration-300 ${scrolled ? "bg-[#050817]/75 py-3 shadow-[0_10px_40px_rgba(0,0,0,.18)] backdrop-blur-2xl" : ""}`}>
      <Container>
        <nav className={`flex min-h-[72px] items-center justify-between gap-7 rounded-[22px] border px-6 transition duration-300 ${scrolled ? "border-white/10 bg-white/[.035]" : "border-transparent"}`} aria-label="ناوبری اصلی">
          <Brand />
          <div className="flex items-center gap-8 max-lg:hidden">
            {links.map(([label, href], index) => (
              <Link key={label} href={href} className={`relative py-2 text-sm font-medium transition hover:text-white ${index === 0 ? "text-white after:absolute after:inset-x-2 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-pink-500" : "text-white/60"}`}>{label}</Link>
            ))}
          </div>
          <div className="max-sm:hidden"><Button href="#contact" size="sm">مشاوره رایگان</Button></div>
          <button className="hidden size-11 place-items-center rounded-xl border border-white/10 bg-white/5 max-lg:grid" onClick={() => setOpen(true)} aria-label="باز کردن منو" aria-expanded={open}>
            <Menu size={23} />
          </button>
        </nav>
      </Container>

      <div className={`fixed inset-0 z-50 transition ${open ? "visible" : "invisible"}`} aria-hidden={!open}>
        <button className={`absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} aria-label="بستن منو" />
        <div className={`absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col border-l border-white/10 bg-[#080d22]/95 p-6 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-6"><Brand /><button className="grid size-10 place-items-center rounded-xl bg-white/5" onClick={() => setOpen(false)} aria-label="بستن منو"><X size={23} /></button></div>
          <div className="flex flex-col py-7">
            {links.map(([label, href]) => <Link className="border-b border-white/[.06] py-4 text-lg text-white/75" key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          </div>
          <Button href="#contact" size="lg" className="mt-auto w-full">مشاوره رایگان</Button>
        </div>
      </div>
    </header>
  );
}
