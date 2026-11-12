"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function HeroMotion({ children }: { children: ReactNode }) {
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
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); motion.removeEventListener("change", update); };
  }, []);
  return <div className="hero-art" ref={element}>{children}</div>;
}

