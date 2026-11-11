"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type HeroArtProps = { image: string; alt: string; note: string; detail: string; coordinate: string };

export function HeroArt({ image, alt, note, detail, coordinate }: HeroArtProps) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const art = element.current;
    if (!art) return;
    let visible = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { art.dataset.active = String(visible && !document.hidden && !motion.matches); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: 0.08 });
    observer.observe(art);
    document.addEventListener("visibilitychange", update);
    motion.addEventListener("change", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      motion.removeEventListener("change", update);
    };
  }, []);
  return (
    <div className="hero-art" ref={element}>
      <span className="orbit orbit-one" aria-hidden="true" /><span className="orbit orbit-two" aria-hidden="true" />
      <span className="art-coordinate" dir="ltr">{coordinate}</span>
      <div className="hero-visual"><Image src={image} alt={alt} fill preload sizes="(max-width: 767px) 90vw, (max-width: 1440px) 48vw, 640px" className="hero-image" /></div>
      <span className="hero-satellite" aria-hidden="true" />
      <div className="art-note"><span className="status-dot" /><div><strong>{note}</strong><span>{detail}</span></div></div>
      <span className="art-number" dir="ltr">TOPLINKSHO / NEXT CHAPTER</span>
    </div>
  );
}
