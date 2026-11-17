import Image, { getImageProps } from "next/image";
import { HeroMotion } from "@/components/shared/HeroMotion";
import { HeroOrbits } from "@/components/shared/HeroBackdrop";
import { assetUrl } from "@/lib/assets";

type HeroArtProps = { image: string; alt: string; note: string; detail: string; coordinate: string; unoptimized?: boolean };

export function HeroArt({ image, alt, note, detail, coordinate, unoptimized = false }: HeroArtProps) {
  // The portrait rocket is height-constrained inside the square mobile stage.
  const isPortrait = image === "/images/hero-home.png";
  const mobileSizes = isPortrait ? "(max-width: 360px) 218px, 248px" : "min(calc(100vw - 52px), 372px)";
  const desktopSizes = isPortrait
    ? "(max-width: 1100px) min(calc(50vw - 48px), 341px), (max-width: 1499px) 414px, 448px"
    : "(max-width: 1440px) 48vw, 640px";
  const imageSizes = isPortrait
    ? `(max-width: 360px) 218px, (max-width: 767px) 248px, ${desktopSizes}`
    : `(max-width: 767px) ${mobileSizes}, ${desktopSizes}`;
  const mobileImage = /^\/images\/hero-(home|about|services|contact|404)\.png$/.test(image)
    ? getImageProps({ src: assetUrl(image.replace(/\.png$/, "-mobile.png")), alt, width: 640, height: isPortrait ? 960 : 640, sizes: mobileSizes }).props
    : undefined;
  return <HeroMotion>
    <HeroOrbits />
    <span className="art-coordinate" dir="ltr">{coordinate}</span>
    <div className="hero-visual"><picture>
      {mobileImage && <source media="(max-width: 767px)" srcSet={mobileImage.srcSet} sizes={mobileImage.sizes} />}
      <Image src={assetUrl(image)} alt={alt} unoptimized={unoptimized} fill loading="eager" fetchPriority="high"
        sizes={imageSizes} className="hero-image" />
    </picture></div>
    <span className="hero-satellite" aria-hidden="true" />
    <span className="hero-flare hero-flare--pink" aria-hidden="true" />
    <span className="hero-flare hero-flare--blue" aria-hidden="true" />
    <div className="art-note"><span className="status-dot" /><div><strong>{note}</strong><span>{detail}</span></div></div>
    <span className="art-number" dir="ltr">TOPLINKSHO / NEXT CHAPTER</span>
  </HeroMotion>;
}
