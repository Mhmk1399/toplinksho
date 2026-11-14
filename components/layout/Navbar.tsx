"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Menu,
  X,
  ArrowUpLeft,
  ChevronDown,
  ChevronLeft,
  MessageCircle,
} from "lucide-react";
import {
  DesktopServiceMenu,
  MobileServiceMenu,
} from "@/components/layout/ServiceMenu";
import { NavigationIcon } from "@/components/layout/NavigationIcon";
import { Brand } from "@/components/shared/Brand";
import { Container } from "@/components/ui/Container";
import { useServiceMenu } from "@/components/layout/useServiceMenu";
import { navigation } from "@/lib/site";

export function Navbar() {
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const { services, closeServices, onPointerEnter, onPointerLeave, onBlur, onTriggerClick } = useServiceMenu(pathname);
  function close() {
    dialog.current?.close();
    document.body.style.overflow = "";
    trigger.current?.focus();
  }
  function openMobile() {
    const menu = dialog.current;
    if (!menu) return;
    menu
      .querySelector<HTMLDetailsElement>(".mobile-services")
      ?.setAttribute("open", "");
    menu.showModal();
    document.body.style.overflow = "hidden";
  }
  useEffect(() => {
    const scroll = () => {
      const value = String(window.scrollY > 24);
      if (header.current && header.current.dataset.scrolled !== value)
        header.current.dataset.scrolled = value;
    };
    const media = window.matchMedia("(min-width: 1200px)");
    const resize = () => {
      if (media.matches) {
        dialog.current?.close();
        document.body.style.overflow = "";
      }
    };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    media.addEventListener("change", resize);
    return () => {
      window.removeEventListener("scroll", scroll);
      media.removeEventListener("change", resize);
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <header className="site-header" ref={header}>
      <Container>
        <nav className="nav-shell" aria-label="ناوبری اصلی">
          <Brand />
          <div className="desktop-nav">
            {navigation.map((item) =>
              item.href === "/services" ? (
                <div
                  key={item.href}
                  className="nav-services-item"
                  data-current={
                    pathname === "/services" ||
                    pathname.startsWith("/services/")
                  }
                >
                  <details
                    ref={services}
                    className="service-disclosure"
                    onPointerEnter={onPointerEnter}
                    onPointerLeave={onPointerLeave}
                    onBlur={onBlur}
                  >
                    <summary
                      aria-label="باز کردن فهرست خدمات"
                      className="service-disclosure-trigger"
                      onClick={onTriggerClick}
                    >
                      <span>{item.label}</span>
                      <ChevronDown size={15} aria-hidden="true" />
                    </summary>
                    <span className="service-menu-bridge" aria-hidden="true" />
                    <DesktopServiceMenu onNavigate={() => closeServices(true)} />
                  </details>
                </div>
              ) : (
                <Link
                  href={item.href}
                  key={item.href}
                  prefetch={false}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
          <Link
            className="nav-cta"
            href="/contact#consultation"
            prefetch={false}
          >
            مشاوره رایگان
            <ArrowUpLeft size={17} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="mobile-menu-trigger"
            ref={trigger}
            onClick={openMobile}
            aria-label="باز کردن منو"
            aria-haspopup="dialog"
            aria-controls="mobile-navigation"
          >
            <Menu aria-hidden="true" />
          </button>
        </nav>
      </Container>
      <dialog
        ref={dialog}
        id="mobile-navigation"
        className="mobile-menu service-mobile-menu"
        data-lenis-prevent
        aria-label="منوی اصلی"
        onClose={() => {
          document.body.style.overflow = "";
        }}
        onClick={(event) => {
          if (!dialog.current?.open) return;
          if (event.target === event.currentTarget) {
            const box = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < box.left ||
              event.clientX > box.right ||
              event.clientY < box.top ||
              event.clientY > box.bottom
            )
              close();
          } else if ((event.target as HTMLElement).closest("a")) close();
        }}
      >
        <div className="mobile-menu-top">
          <Brand />
          <button type="button" onClick={close} aria-label="بستن منو">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="ناوبری موبایل">
          {navigation.map((item) =>
            item.href === "/services" ? (
              <MobileServiceMenu key={item.href} onNavigate={close} />
            ) : (
              <Link
                className="mobile-primary-link"
                href={item.href}
                key={item.href}
                prefetch={false}
                onClick={close}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                <NavigationIcon path={item.href} />
                <span>{item.label}</span>
                <ChevronLeft size={14} aria-hidden="true" />
              </Link>
            ),
          )}
        </nav>
        <div className="mobile-menu-footer">
          <Link
            href="/contact#consultation"
            prefetch={false}
            onClick={close}
            className="service-menu-button"
          >
            <MessageCircle size={17} aria-hidden="true" />
            مشاوره رایگان
          </Link>
        </div>
      </dialog>
    </header>
  );
}
