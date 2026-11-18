"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowUpLeft, Headset, X } from "lucide-react";
import { contactLinks } from "@/lib/contact-links";
import { ContactIcon } from "@/components/shared/ContactIcon";
import { PendingContactLink } from "@/components/shared/PendingContactLink";

/** Native disclosure first; JavaScript only enhances dismissal and route cleanup. */
export function FloatingContact() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = disclosure.current;
    if (!root) return;
    const outside = (event: PointerEvent) => {
      if (
        root.open &&
        event.target instanceof Node &&
        !root.contains(event.target)
      )
        root.open = false;
    };
    const keyboard = (event: KeyboardEvent) => {
      if (!event.defaultPrevented && event.key === "Escape" && root.open) {
        event.preventDefault();
        root.open = false;
        trigger.current?.focus({ preventScroll: true });
      }
    };
    const focus = (event: FocusEvent) => {
      if (
        root.open &&
        event.relatedTarget instanceof Node &&
        !root.contains(event.relatedTarget)
      )
        root.open = false;
    };
    document.addEventListener("pointerdown", outside, { passive: true });
    document.addEventListener("keydown", keyboard);
    root.addEventListener("focusout", focus);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
      root.removeEventListener("focusout", focus);
    };
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (disclosure.current) disclosure.current.open = false;
  }, [pathname]);

  return (
    <details
      ref={disclosure}
      className="contact-fab"
      data-floating-contact
      suppressHydrationWarning
    >
      <summary
        ref={trigger}
        className="contact-fab-trigger"
        aria-label="راه‌های ارتباطی"
        aria-controls="floating-contact-panel"
      >
        <span className="contact-fab-trigger-icon">
          <Headset
            className="contact-fab-open-icon"
            size={25}
            aria-hidden="true"
          />
          <X className="contact-fab-close-icon" size={25} aria-hidden="true" />
        </span>
        <span className="contact-fab-hint" aria-hidden="true">
          در تماس باشیم
        </span>
      </summary>
      <div
        id="floating-contact-panel"
        className="contact-fab-panel"
        data-lenis-prevent
      >
        <div className="contact-fab-intro">
          <h2>گفت‌وگو را شروع کنیم.</h2>
        </div>
        <nav aria-label="راه‌های ارتباط سریع">
          <ul className="contact-fab-links">
            {contactLinks.map((link) => {
              const content = (
                <>
                  <span className="contact-fab-channel-icon">
                    <ContactIcon channel={link.id} size={21} />
                  </span>
                  <span className="contact-fab-copy">
                    <strong>{link.label}</strong>
                    <span
                      dir={
                        link.id === "phone" || link.id === "email"
                          ? "ltr"
                          : undefined
                      }
                    >
                      {link.detail}
                    </span>
                  </span>
                  {link.href && (
                    <ArrowUpLeft
                      size={16}
                      className="contact-fab-arrow"
                      aria-hidden="true"
                    />
                  )}
                </>
              );
              return (
                <li key={link.id}>
                  {link.href ? (
                    <a
                      href={link.href}
                      className="contact-fab-link"
                      data-channel={link.id}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      onClick={() => {
                        if (disclosure.current) disclosure.current.open = false;
                      }}
                    >
                      {content}
                    </a>
                  ) : (
                    <PendingContactLink
                      className="contact-fab-link"
                      channel={link.id}
                      label={link.label}
                    >
                      {content}
                    </PendingContactLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <Link
          href="/contact#consultation"
          prefetch={false}
          className="contact-fab-consultation"
          onClick={() => {
            if (disclosure.current) disclosure.current.open = false;
          }}
        >
          فرم مشاورهٔ رایگان
          <ArrowUpLeft size={15} aria-hidden="true" />
        </Link>
      </div>
    </details>
  );
}
