"use client";

import { useEffect } from "react";
import { constrainedDevice } from "@/lib/device-capabilities";

/** Progressive enhancement: SSR content stays visible, even when JS never runs. */
export function ServiceEntrance() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-service-page]");
    if (!root || typeof IntersectionObserver === "undefined" || typeof HTMLElement.prototype.animate !== "function") return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet<Element>(), active = new Set<Animation>();
    const candidates = [...root.querySelectorAll<HTMLElement>("[data-service-reveal], .home-section h2, .home-section .feature-card, .home-section .neon-surface, .workflow-step")]
      .filter(node => !node.parentElement?.closest("[data-service-reveal], .feature-card, .workflow-step, .neon-surface"));
    const disabled = () => motion.matches || constrainedDevice(navigator) || document.documentElement.dataset.performance === "reduced" || document.hidden;
    const cancel = () => { for (const animation of active) animation.cancel(); active.clear(); };
    const observer = new IntersectionObserver(entries => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target); seen.add(entry.target);
        if (disabled() || active.size >= 6 || entry.target.matches(":focus-within")) continue;
        const animation = (entry.target as HTMLElement).animate([
          { opacity: .35, transform: "translateY(14px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 420, delay: Math.min(order++, 3) * 45, easing: "cubic-bezier(.2,.7,.3,1)", fill: "none" });
        active.add(animation);
        animation.onfinish = animation.oncancel = () => { active.delete(animation); };
      }
    }, { threshold: .08, rootMargin: "0px 0px -24px 0px" });
    const reconcile = () => {
      if (disabled()) { observer.disconnect(); cancel(); root.dataset.entrance = "static"; }
      else { for (const target of candidates) if (!seen.has(target)) observer.observe(target); root.dataset.entrance = "enabled"; }
    };
    const capabilities = new MutationObserver(reconcile);
    capabilities.observe(document.documentElement, { attributes: true, attributeFilter: ["data-performance"] });
    motion.addEventListener("change", reconcile);
    document.addEventListener("visibilitychange", reconcile);
    reconcile();
    return () => { observer.disconnect(); capabilities.disconnect(); motion.removeEventListener("change", reconcile); document.removeEventListener("visibilitychange", reconcile); cancel(); delete root.dataset.entrance; };
  }, []);
  return null;
}
