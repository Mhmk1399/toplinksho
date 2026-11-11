"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Menu, X, ArrowUpLeft } from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { Container } from "@/components/ui/Container";
import { navigation } from "@/lib/site";
export function Navbar() {
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    dialog.current?.close();
    document.body.style.overflow = "";
    trigger.current?.focus();
  }
  function open() {
    dialog.current?.showModal();
    document.body.style.overflow = "hidden";
  }
  useEffect(() => {
    const updateScroll = () => {
      const scrolled = String(window.scrollY > 24);
      if (header.current && header.current.dataset.scrolled !== scrolled) {
        header.current.dataset.scrolled = scrolled;
      }
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    const media = window.matchMedia("(min-width: 1024px)");
    const reset = () => {
      if (media.matches) {
        dialog.current?.close();
        document.body.style.overflow = "";
      }
    };
    media.addEventListener("change", reset);
    return () => {
      window.removeEventListener("scroll", updateScroll);
      media.removeEventListener("change", reset);
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <header className="site-header" ref={header}>
      <Container>
        <nav
          className="nav-shell"
          aria-label="ناوبری اصلی"
          onPointerMove={(event) => {
            if (
              event.pointerType !== "mouse" ||
              document.documentElement.dataset.performance === "reduced" ||
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
              return;
            }
            const bounds = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty(
              "--glass-x",
              `${event.clientX - bounds.left}px`,
            );
            event.currentTarget.style.setProperty(
              "--glass-y",
              `${event.clientY - bounds.top}px`,
            );
          }}
          onPointerLeave={(event) => {
            event.currentTarget.style.removeProperty("--glass-x");
            event.currentTarget.style.removeProperty("--glass-y");
          }}
        >
          <Brand />
          <div className="desktop-nav">
            {navigation.map(({ label, href }) => (
              <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined}>
                {label}
              </Link>
            ))}
          </div>
          <Link className="nav-cta" href="/contact#consultation">
            مشاوره رایگان <ArrowUpLeft size={17} />
          </Link>
          <button
            className="mobile-menu-trigger"
            onClick={open}
            ref={trigger}
            aria-label="باز کردن منو"
            aria-haspopup="dialog"
            aria-controls="mobile-navigation"
          >
            <Menu />
          </button>
        </nav>
      </Container>
      <dialog
        id="mobile-navigation"
        className="mobile-menu"
        data-lenis-prevent
        ref={dialog}
        aria-label="منوی اصلی"
        onClose={() => {
          document.body.style.overflow = "";
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="mobile-menu-top">
          <Brand />
          <button onClick={close} aria-label="بستن منو">
            <X />
          </button>
        </div>
        <nav aria-label="ناوبری موبایل">
          {navigation.map(({ label, href }) => (
            <Link href={href} key={href} onClick={close} aria-current={pathname === href ? "page" : undefined}>
              {label}
              <ArrowUpLeft size={20} />
            </Link>
          ))}
          <Link href="/contact#consultation" onClick={close}>
            مشاوره رایگان <ArrowUpLeft size={20} />
          </Link>
        </nav>
      </dialog>
    </header>
  );
}
