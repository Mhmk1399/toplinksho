import Image from "next/image";
import type { ReactNode } from "react";
import { Braces, ScanSearch, PenTool, Workflow } from "lucide-react";
import { getVisual, visualFor, type VisualKey } from "@/lib/visuals";

const icons = {
  development: Braces,
  design: PenTool,
  growth: ScanSearch,
  automation: Workflow,
};
export function CardVisual({
  path,
  visual,
  label,
  compact = false,
  decorative = false,
  sizes,
  image: imageSrc,
  imageAlt,
  backgroundImage,
  icon,
  variant = "thumbnail",
}: {
  path?: string;
  visual?: VisualKey;
  label?: string;
  compact?: boolean;
  decorative?: boolean;
  sizes?: string;
  image?: string;
  imageAlt?: string;
  backgroundImage?: string;
  icon?: ReactNode;
  variant?: "thumbnail" | "feature";
}) {
  const key = visual || visualFor(path);
  const fallback = getVisual(key);
  const image = {
    src: imageSrc || fallback.src,
    alt: imageAlt ?? (imageSrc ? "" : fallback.alt),
  };
  const Icon = icons[key];
  return (
    <div
      className={`card-visual ${compact ? "card-visual--compact" : ""} ${variant === "feature" ? "feature-card-art" : ""}`}
      aria-hidden={decorative || undefined}
    >
      {variant === "feature" && (
        <>
          <span className="feature-art-wave feature-art-wave--blue" />
          <span className="feature-art-wave feature-art-wave--pink" />
        </>
      )}
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          loading="lazy"
          sizes={sizes || "400px"}
          className="card-visual-background"
        />
      )}
      <span className="card-visual-grid" aria-hidden="true" />
      <Image
        src={image.src}
        alt={decorative ? "" : image.alt}
        fill
        loading="lazy"
        sizes={
          sizes ||
          (compact
            ? "110px"
            : "(max-width: 639px) 90vw, (max-width: 1023px) 44vw, 400px")
        }
        className="card-visual-image"
      />
      <span className="card-visual-icon" aria-hidden="true">
        {icon || <Icon size={18} />}
      </span>
      {label && <span className="card-visual-label">{label}</span>}
    </div>
  );
}
