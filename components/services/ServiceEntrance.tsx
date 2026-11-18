"use client";

import { useEffect } from "react";
import { constrainedDevice } from "@/lib/device-capabilities";

/** Progressive enhancement: SSR content stays visible, even when JS never runs. */
export function ServiceEntrance() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-service-page]");
    if (!root || typeof IntersectionObserver === "undefined" || typeof HTMLElement.prototype.animate !== "function") return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)"), pointer = matchMedia("(hover: hover) and (pointer: fine)");
    if (!pointer.matches || constrainedDevice(navigator)) {
      root.dataset.entrance = "static";
      return () => { delete root.dataset.entrance; };
    }
    const seen = new WeakSet<Element>(), visible = new Set<HTMLElement>(), active = new Set<Animation>();
    // Text can enter gently without compositing entire glass cards, SVG rails or artwork.
    const candidates = [...root.querySelectorAll<HTMLElement>(".home-section h2, .feature-card-title, .workflow-copy p")];
    const disabled = () => motion.matches || !pointer.matches || constrainedDevice(navigator) || document.documentElement.dataset.performance === "reduced" || document.hidden;
    const busy = () => document.documentElement.dataset.scrolling === "true" || document.documentElement.dataset.navigating === "true";
    let idle: number | undefined, timer: number | undefined, observing = false, disposed = false;
    const cancel = () => { for (const animation of active) animation.cancel(); active.clear(); };
    const unschedule = () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      idle = timer = undefined;
    };
    const reveal = () => {
      idle = timer = undefined;
      if (disposed || disabled() || busy()) return;
      for (const target of visible) {
        observer.unobserve(target); seen.add(target); visible.delete(target);
        if (!target.isConnected || active.size >= 2 || target.matches(":focus-within")) continue;
        const animation = target.animate([
          { opacity: .8, transform: "translateY(4px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 180, easing: "cubic-bezier(.2,.7,.3,1)", fill: "none" });
        active.add(animation);
        animation.onfinish = animation.oncancel = () => { active.delete(animation); };
      }
    };
    const schedule = () => {
      if (disposed || disabled() || busy() || !visible.size || idle !== undefined || timer !== undefined) return;
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(reveal, { timeout: 700 });
      else timer = window.setTimeout(reveal, 160);
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
        else visible.delete(entry.target as HTMLElement);
      }
      schedule();
    }, { threshold: .2, rootMargin: "0px 0px -24px 0px" });
    const reconcile = () => {
      if (disabled()) { observer.disconnect(); observing = false; visible.clear(); unschedule(); cancel(); root.dataset.entrance = "static"; return; }
      if (!observing) { for (const target of candidates) if (!seen.has(target)) observer.observe(target); observing = true; }
      root.dataset.entrance = "enabled";
      if (busy()) { unschedule(); cancel(); }
      else schedule();
    };
    const capabilities = new MutationObserver(reconcile);
    capabilities.observe(document.documentElement, { attributes: true, attributeFilter: ["data-performance", "data-scrolling", "data-navigating"] });
    motion.addEventListener("change", reconcile);
    pointer.addEventListener("change", reconcile);
    document.addEventListener("visibilitychange", reconcile);
    reconcile();
    return () => { disposed = true; observer.disconnect(); capabilities.disconnect(); motion.removeEventListener("change", reconcile); pointer.removeEventListener("change", reconcile); document.removeEventListener("visibilitychange", reconcile); unschedule(); cancel(); delete root.dataset.entrance; };
  }, []);
  return null;
}
