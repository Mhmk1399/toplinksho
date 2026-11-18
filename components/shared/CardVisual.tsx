import Image from "next/image";
import type { ReactNode } from "react";
import { Braces, ScanSearch, PenTool, Workflow } from "lucide-react";
import { getVisual, getCardArtwork, visualFor, type VisualKey } from "@/lib/visuals";
import { assetUrl } from "@/lib/assets";

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
  artworkKey,
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
  artworkKey?: string;
  backgroundImage?: string;
  icon?: ReactNode;
  variant?: "thumbnail" | "feature";
}) {
  const key = visual || visualFor(path);
  const exact = getCardArtwork({ artworkKey, path });
  const fallback = exact || getVisual(key);
  const image = {
    src: assetUrl(imageSrc || fallback.src),
    alt: imageAlt ?? (imageSrc ? "" : fallback.alt),
  };
  const Icon = icons[key];
  const imageSizes = sizes || (compact
    ? "110px"
    : "(max-width: 639px) min(calc(88vw - 60px), 300px), (max-width: 767px) calc(50vw - 40px), (max-width: 1023px) calc(50vw - 56px), (max-width: 1344px) calc(33.333vw - 58px), 390px");
  return (
    <div
      className={`card-visual ${compact ? "card-visual--compact" : ""} ${variant === "feature" ? "feature-card-art" : ""}`}
      aria-hidden={decorative || undefined}
      data-artwork-key={exact?.key || artworkKey || (path ? "route:" + path : undefined)}
    >
      {variant === "feature" && (
        <>
          <span className="feature-art-wave feature-art-wave--blue" />
          <span className="feature-art-wave feature-art-wave--pink" />
        </>
      )}
      {backgroundImage && (
        <Image
          src={assetUrl(backgroundImage)}
          alt=""
          fill
          loading="lazy"
          sizes={imageSizes}
          className="card-visual-background"
        />
      )}
      <span className="card-visual-grid" aria-hidden="true" />
      <Image
        src={image.src}
        alt={decorative ? "" : image.alt}
        fill
        loading="lazy"
        sizes={imageSizes}
        className="card-visual-image"
      />
      <span className="card-visual-icon" aria-hidden="true">
        {icon || <Icon size={18} />}
      </span>
      {label && <span className="card-visual-label">{label}</span>}
    </div>
  );
}
