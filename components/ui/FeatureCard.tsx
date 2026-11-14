import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { ArrowUpLeft } from "lucide-react";
import { CardVisual } from "@/components/shared/CardVisual";
import type { VisualKey } from "@/lib/visuals";

export type FeatureCardProps = {
  title: string;
  description?: ReactNode;
  image?: string;
  imageAlt?: string;
  artworkKey?: string;
  backgroundImage?: string;
  visual?: VisualKey;
  path?: string;
  category?: string;
  icon?: ReactNode;
  href?: string;
  linkLabel?: string;
  headingAs?: "h2" | "h3" | "h4" | "p";
  onNavigate?: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  compact?: boolean;
};

export function FeatureCard({
  title,
  description,
  image,
  imageAlt,
  artworkKey,
  backgroundImage,
  visual,
  path,
  category,
  icon,
  href,
  linkLabel = "بررسی جزئیات",
  headingAs = "h3",
  onNavigate,
  children,
  footer,
  className = "",
  compact = false,
}: FeatureCardProps) {
  const Heading: ElementType = headingAs;
  return (
    <article
      className={`neon-surface feature-card visual-link-card ${compact ? "feature-card--compact" : ""} ${href ? "feature-card--linked" : ""} ${className}`}
    >
      <CardVisual
        path={path || href}
        visual={visual}
        image={image}
        imageAlt={imageAlt}
        artworkKey={artworkKey}
        backgroundImage={backgroundImage}
        icon={icon}
        variant="feature"
        decorative={!imageAlt}
      />
      <div className="feature-card-panel">
        <div className="feature-card-heading">
          <Heading className="feature-card-title">{title}</Heading>
          {category && (
            <span className="feature-card-category">{category}</span>
          )}
        </div>
        <span className="feature-card-rule" aria-hidden="true" />
        {description && (
          <p className="feature-card-description">{description}</p>
        )}
        {children && <div className="feature-card-extra">{children}</div>}
        {footer && <div className="feature-card-footer">{footer}</div>}
        {href && (
          <span className="feature-card-hint" aria-hidden="true">
            {linkLabel}
            <ArrowUpLeft size={15} />
          </span>
        )}
      </div>
      {href && (
        <Link
          href={href}
          onClick={onNavigate}
          className="feature-card-cover-link"
          aria-label={title}
        >
          <span className="sr-only">{title}</span>
        </Link>
      )}
    </article>
  );
}
