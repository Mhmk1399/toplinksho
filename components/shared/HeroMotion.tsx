"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { constrainedDevice } from "@/lib/device-capabilities";

export function HeroMotion({ children }: { children: ReactNode }) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const art = element.current;
    if (!art) return;
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    // SSR artwork is already visible. Motion is a single optional idle enhancement.
    art.dataset.active = "false";
    if (motion.matches || !desktop.matches || constrainedDevice(navigator) || !("IntersectionObserver" in window)) return;
    const image = art.querySelector<HTMLImageElement>(".hero-image");
    let visible = false;
    let finished = false, queued = false;
    let idle: number | undefined, timer: number | undefined;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; queue(); }, { threshold: 0.08 });
    function cleanup() {
      observer.disconnect();
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      image?.removeEventListener("load", queue);
      image?.removeEventListener("error", finish);
      art!.removeEventListener("animationend", ended);
      art!.removeEventListener("animationcancel", ended);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("scroll", finish);
      document.removeEventListener("pointerdown", finish);
      document.removeEventListener("keydown", finish);
    }
    function finish() {
      finished = true;
      art!.dataset.active = "false";
      cleanup();
    }
    function start() {
      idle = timer = undefined;
      if (finished) return;
      if (!visible || document.hidden || motion.matches || !desktop.matches || constrainedDevice(navigator) || root.dataset.performance === "reduced" || root.dataset.scrolling === "true" || root.dataset.navigating === "true") { finish(); return; }
      art!.dataset.active = "true";
      // Also release resources if the browser cancels a CSS animation without an event.
      timer = window.setTimeout(finish, 1000);
    }
    function queue() {
      if (finished || queued || !visible || (image && !image.complete)) return;
      if (image && !image.naturalWidth) { finish(); return; }
      queued = true;
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(start);
      else timer = window.setTimeout(start, 200);
    }
    function ended(event: AnimationEvent) {
      if (event.target instanceof Element && event.target.classList.contains("hero-visual")) finish();
    }
    function hidden() { if (document.hidden) finish(); }
    observer.observe(art);
    image?.addEventListener("load", queue, { once: true });
    image?.addEventListener("error", finish, { once: true });
    art.addEventListener("animationend", ended);
    art.addEventListener("animationcancel", ended);
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("scroll", finish, { passive: true, once: true });
    document.addEventListener("pointerdown", finish, { passive: true, once: true });
    document.addEventListener("keydown", finish, { once: true });
    return () => { finished = true; cleanup(); };
  }, []);
  return <div className="hero-art" ref={element}>{children}</div>;
}

