import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowLeft, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { HeroArt } from "@/components/shared/HeroArt";
import { HeroBackdrop } from "@/components/shared/HeroBackdrop";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  image: string;
  imageAlt: string;
  note: string;
  detail: string;
  coordinate: string;
  primary?: { label: string; href: string };
  secondary: { label: string; href: string };
  footnote?: string;
  capabilities?: string[];
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  note,
  detail,
  coordinate,
  primary = { label: "مشاوره رایگان", href: "/contact#consultation" },
  secondary,
  footnote,
  capabilities = [
    "استراتژی و کمپین",
    "هویت برند",
    "طراحی وب",
    "شبکه‌های اجتماعی",
    "Google Ads",
  ],
}: PageHeroProps) {
  return (
    <section className="hero-stage hero-stage--neon" id="top">
      <HeroBackdrop id={"hero-" + image.replace(/[^a-z0-9]/gi, "-")} />
      <Container>
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" />
              {eyebrow}
            </span>
            <h1>{title}</h1>
            <p className="hero-description">{description}</p>
            <div className="hero-actions">
              <Link
                href={primary.href}
                className={buttonClasses({ size: "lg" })}
              >
                {primary.label}
                <ArrowLeft size={18} aria-hidden="true" />
              </Link>
              <Link className="text-link" href={secondary.href}>
                {secondary.label}
                {secondary.href.includes("#") ? <ArrowDown size={16} aria-hidden="true" /> : <ArrowLeft size={16} aria-hidden="true" />}
              </Link>
            </div>
            {footnote && <div className="hero-footnote">
              <Sparkles size={16} aria-hidden="true" />
              <span>{footnote}</span>
            </div>}
          </div>
          <HeroArt
            image={image}
            alt={imageAlt}
            note={note}
            detail={detail}
            coordinate={coordinate}
          />
        </div>
        {capabilities.length > 0 && <div className="capability-strip">
          <span>
            از یک ایده،
            <br />
            <strong>تا یک تجربه کامل.</strong>
          </span>
          {capabilities.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>}
      </Container>
    </section>
  );
}
