import Image, { getImageProps } from "next/image";
import { HeroMotion } from "@/components/shared/HeroMotion";
import { HeroOrbits } from "@/components/shared/HeroBackdrop";

type HeroArtProps = { image: string; alt: string; note: string; detail: string; coordinate: string; unoptimized?: boolean };

export function HeroArt({ image, alt, note, detail, coordinate, unoptimized = false }: HeroArtProps) {
  const mobileImage = /^\/images\/hero-(home|about|services|contact|404)\.png$/.test(image)
    ? getImageProps({ src: image.replace(/\.png$/, "-mobile.png"), alt, width: 640, height: image.includes("hero-home") ? 960 : 640, sizes: "90vw" }).props
    : undefined;
  return <HeroMotion>
    <HeroOrbits />
    <span className="art-coordinate" dir="ltr">{coordinate}</span>
    <div className="hero-visual"><picture>
      {mobileImage && <source media="(max-width: 767px)" srcSet={mobileImage.srcSet} sizes={mobileImage.sizes} />}
      <Image src={image} alt={alt} unoptimized={unoptimized} fill loading="eager" fetchPriority="high"
        sizes="(max-width: 767px) 90vw, (max-width: 1440px) 48vw, 640px" className="hero-image" />
    </picture></div>
    <span className="hero-satellite" aria-hidden="true" />
    <span className="hero-flare hero-flare--pink" aria-hidden="true" />
    <span className="hero-flare hero-flare--blue" aria-hidden="true" />
    <div className="art-note"><span className="status-dot" /><div><strong>{note}</strong><span>{detail}</span></div></div>
    <span className="art-number" dir="ltr">TOPLINKSHO / NEXT CHAPTER</span>
  </HeroMotion>;
}
