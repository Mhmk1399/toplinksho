import { ArrowUpLeft } from "lucide-react";
import { ContactIcon } from "@/components/shared/ContactIcon";
import { PendingContactLink } from "@/components/shared/PendingContactLink";
import { contactLinks } from "@/lib/contact-links";

type ContactLinksProps = {
  variant?: "footer" | "contact";
  className?: string;
};

/** Server-rendered contact destinations shared by the footer and consultation area. */
export function ContactLinks({ variant = "contact", className = "" }: ContactLinksProps) {
  const direct = (id: string) => id === "phone" || id === "email";
  const links = variant === "contact"
    ? [...contactLinks.filter(link => direct(link.id)), ...contactLinks.filter(link => !direct(link.id))]
    : contactLinks;
  return (
    <ul className={`contact-link-list contact-link-list--${variant} ${className}`} aria-label="راه‌های ارتباط با تاپ لینک شو">
      {links.map(link => {
        const primary = direct(link.id);
        const content = <>
          <span className="contact-channel-icon" aria-hidden="true"><ContactIcon channel={link.id} size={variant === "footer" ? 17 : 20} /></span>
          <span className="contact-channel-copy">
            <span className="contact-channel-label">{link.label}</span>
            {!link.href && <span className="contact-channel-pending" aria-hidden="true">به‌زودی</span>}
            {variant === "contact" && primary && <span className="contact-channel-detail" dir="ltr">{link.detail}</span>}
          </span>
          {variant === "contact" && primary && <ArrowUpLeft className="contact-channel-arrow" size={17} aria-hidden="true" />}
        </>;
        return (
          <li key={link.id} className={`contact-link-item contact-link-item--${link.id}`}>
            {!link.href ? (
              <PendingContactLink className="contact-channel" channel={link.id} label={link.label}>
                {content}
              </PendingContactLink>
            ) : <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="contact-channel"
              data-channel={link.id}
              aria-label={link.external ? `${link.label}؛ باز شدن در زبانهٔ جدید` : undefined}
              title={link.detail}
            >
              {content}
            </a>}
          </li>
        );
      })}
    </ul>
  );
}
