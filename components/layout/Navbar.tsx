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
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <Container>
        <nav className="navbar" aria-label="ناوبری اصلی">
          <Brand />
          <div className="desktop-nav">
            {links.map(([label, href], index) => (
              <Link key={label} href={href} className={index === 0 ? "active" : ""}>{label}</Link>
            ))}
          </div>
          <div className="nav-action"><Button href="#contact" size="sm">مشاوره رایگان</Button></div>
          <button className="menu-trigger" onClick={() => setOpen(true)} aria-label="باز کردن منو" aria-expanded={open}>
            <Menu size={23} />
          </button>
        </nav>
      </Container>

      <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <button className="mobile-menu-backdrop" onClick={() => setOpen(false)} aria-label="بستن منو" />
        <div className="mobile-menu-panel">
          <div className="mobile-menu-head"><Brand /><button onClick={() => setOpen(false)} aria-label="بستن منو"><X size={23} /></button></div>
          <div className="mobile-menu-links">
            {links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          </div>
          <Button href="#contact" size="lg" className="mobile-menu-cta">مشاوره رایگان</Button>
        </div>
      </div>
    </header>
  );
}
