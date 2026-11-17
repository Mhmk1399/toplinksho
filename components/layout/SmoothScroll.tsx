"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { constrainedDevice, type PerformanceNavigator } from "@/lib/device-capabilities";

export function SmoothScroll() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const committed = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const device = navigator as PerformanceNavigator;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let lenis: Lenis | null = null;
    let frame = 0, generation = 0, previousTime = 0, samples = 0, slowFrames = 0;
    let idle: number | undefined, timer: number | undefined, scrollTimer: number | undefined;
    let navigationTimer: number | undefined, anchorTimer: number | undefined, settleFrame = 0;
    let disposed = false, performanceLimited = false, navigating = false;
    let lastScrollAt = 0, navigationStarted = 0, pendingHref: string | null = null;

    function destroy() {
      generation += 1;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      idle = timer = undefined; frame = 0;
      lenis?.destroy(); lenis = null;
      if (root.dataset.scrollMode !== "native") root.dataset.scrollMode = "native";
    }

    function clearAnchor(cancelMotion = false) {
      const running = root.dataset.anchorScrolling === "true";
      window.clearTimeout(anchorTimer); anchorTimer = undefined;
      delete root.dataset.anchorScrolling;
      if (cancelMotion && running) window.scrollTo({ left: window.scrollX, top: window.scrollY, behavior: "auto" });
    }

    function stopInertia() {
      if (root.dataset.anchorScrolling === "true") clearAnchor(true);
      if (lenis?.isScrolling !== "smooth") return;
      window.cancelAnimationFrame(frame); frame = 0;
      lenis.scrollTo(window.scrollY, { immediate: true });
    }

    function tick(time: number) {
      if (!lenis || navigating) return;
      if (previousTime) {
        // A visibly stalled frame opts out before inertia compounds the slowdown.
        if (time - previousTime > 64) { performanceLimited = true; reconcile(); return; }
        samples += 1;
        if (time - previousTime > 28) slowFrames += 1;
        if (samples >= 24) {
          if (slowFrames >= 8) { performanceLimited = true; reconcile(); return; }
          samples = slowFrames = 0;
        }
      }
      previousTime = time;
      lenis.raf(time);
      frame = lenis.isScrolling === "smooth" ? window.requestAnimationFrame(tick) : 0;
    }

    function requestTick() {
      if (!lenis || frame || navigating || document.hidden) return;
      lenis.time = performance.now();
      previousTime = samples = slowFrames = 0;
      frame = window.requestAnimationFrame(tick);
    }

    async function initialize(version: number) {
      try {
        const { default: Lenis } = await import("lenis");
        if (disposed || navigating || document.hidden || root.dataset.scrolling === "true" || version !== generation) return;
        lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, lerp: 0.12, anchors: false });
        lenis.on("virtual-scroll", ({ event, deltaY }) => {
          if (event.type === "wheel" && !event.ctrlKey && deltaY !== 0) requestTick();
        });
        root.dataset.scrollMode = "lenis";
      } catch { if (!disposed && version === generation) destroy(); }
    }

    function reconcile() {
      destroy();
      const constrained = performanceLimited || constrainedDevice(device);
      if (constrained || reducedMotion.matches) clearAnchor(true);
      const performanceMode = constrained ? "reduced" : "standard";
      // A busy gesture can fall back to native immediately; expensive global
      // decoration changes wait until it stops, rather than repainting mid-scroll.
      if (root.dataset.scrolling !== "true" && root.dataset.performance !== performanceMode) root.dataset.performance = performanceMode;
      if (disposed || navigating || root.dataset.scrolling === "true" || constrained || reducedMotion.matches || !finePointer.matches || document.hidden) return;
      const version = generation;
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(() => void initialize(version), { timeout: 1500 });
      else timer = window.setTimeout(() => void initialize(version), 200);
    }

    function settleScroll() {
      const remaining = 240 - (performance.now() - lastScrollAt);
      if (remaining > 0) { scrollTimer = window.setTimeout(settleScroll, remaining); return; }
      scrollTimer = undefined;
      delete root.dataset.scrolling;
      clearAnchor();
      if (!lenis && !navigating && !disposed) reconcile();
    }

    function scrolling() {
      lastScrollAt = performance.now();
      // Only two attribute writes per gesture; no React updates or frame polling.
      if (root.dataset.scrolling !== "true") root.dataset.scrolling = "true";
      if (scrollTimer === undefined) scrollTimer = window.setTimeout(settleScroll, 240);
    }

    function finishNavigation() {
      window.clearTimeout(navigationTimer); navigationTimer = undefined;
      navigating = false; pendingHref = null;
      window.cancelAnimationFrame(settleFrame);
      // Let Next finish native hash/history restoration before fresh dimensions.
      settleFrame = window.requestAnimationFrame(() => {
        settleFrame = window.requestAnimationFrame(() => {
          delete root.dataset.navigating;
          if (!disposed) reconcile();
        });
      });
    }

    function checkNavigation() {
      navigationTimer = undefined;
      const location = window.location.pathname + window.location.search;
      if ((pendingHref && location === pendingHref) || performance.now() - navigationStarted > 8000) finishNavigation();
      else navigationTimer = window.setTimeout(checkNavigation, 100);
    }

    function startNavigation(href: string | null) {
      window.cancelAnimationFrame(settleFrame);
      window.clearTimeout(navigationTimer);
      clearAnchor(true); stopInertia();
      navigating = true; pendingHref = href; navigationStarted = performance.now();
      root.dataset.navigating = "true";
      destroy(); // Native wheel/touch stays usable while the route is loading.
      navigationTimer = window.setTimeout(checkNavigation, 100);
    }

    function click(event: MouseEvent) {
      stopInertia();
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        if (url.hash && !reducedMotion.matches && !constrainedDevice(device)) {
          clearAnchor(); root.dataset.anchorScrolling = "true";
          anchorTimer = window.setTimeout(clearAnchor, 2000);
        }
        return;
      }
      startNavigation(url.pathname + url.search);
    }

    function popstate() {
      clearAnchor(true);
      if (window.location.pathname !== previousPath.current) startNavigation(null);
      else { stopInertia(); settleFrame = window.requestAnimationFrame(() => lenis?.resize()); }
    }

    function visibility() {
      if (document.hidden) {
        window.clearTimeout(scrollTimer); scrollTimer = undefined;
        delete root.dataset.scrolling; clearAnchor(true);
      }
      reconcile();
    }

    committed.current = finishNavigation;
    window.addEventListener("scroll", scrolling, { passive: true });
    window.addEventListener("popstate", popstate);
    document.addEventListener("pointerdown", stopInertia, { passive: true });
    document.addEventListener("keydown", stopInertia);
    document.addEventListener("click", click, true);
    document.addEventListener("visibilitychange", visibility);
    reducedMotion.addEventListener("change", reconcile);
    finePointer.addEventListener("change", reconcile);
    device.connection?.addEventListener("change", reconcile);
    reconcile();

    return () => {
      disposed = true; committed.current = null;
      destroy(); clearAnchor();
      window.clearTimeout(scrollTimer); window.clearTimeout(navigationTimer); window.cancelAnimationFrame(settleFrame);
      delete root.dataset.scrollMode; delete root.dataset.performance; delete root.dataset.scrolling; delete root.dataset.navigating;
      window.removeEventListener("scroll", scrolling); window.removeEventListener("popstate", popstate);
      document.removeEventListener("pointerdown", stopInertia); document.removeEventListener("keydown", stopInertia);
      document.removeEventListener("click", click, true); document.removeEventListener("visibilitychange", visibility);
      reducedMotion.removeEventListener("change", reconcile); finePointer.removeEventListener("change", reconcile);
      device.connection?.removeEventListener("change", reconcile);
    };
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    committed.current?.();
  }, [pathname]);
  return null;
}
