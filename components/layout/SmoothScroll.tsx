"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import { constrainedDevice, type PerformanceNavigator } from "@/lib/device-capabilities";

export function SmoothScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const device = navigator as PerformanceNavigator;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let lenis: Lenis | null = null;
    let frame = 0;
    let idle: number | undefined;
    let timer: number | undefined;
    let generation = 0;
    let disposed = false;
    let performanceLimited = false;
    let previousTime = 0;
    let samples = 0;
    let slowFrames = 0;

    function destroy() {
      generation += 1;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      idle = timer = undefined;
      frame = 0;
      lenis?.destroy();
      lenis = null;
      root.dataset.scrollMode = "native";
    }

    function tick(time: number) {
      if (!lenis) return;
      if (previousTime) {
        samples += 1;
        if (time - previousTime > 28) slowFrames += 1;
        // A sustained low frame rate opts out for the rest of this visit.
        if (samples >= 24) {
          if (slowFrames >= 16) {
            performanceLimited = true;
            reconcile();
            return;
          }
          samples = slowFrames = 0;
        }
      }
      previousTime = time;
      lenis.raf(time);
      frame =
        lenis.isScrolling === "smooth" ? window.requestAnimationFrame(tick) : 0;
    }

    function requestTick() {
      if (!lenis || frame || document.hidden) return;
      // Reset the clock after idle time so the next gesture never jumps.
      lenis.time = performance.now();
      previousTime = samples = slowFrames = 0;
      frame = window.requestAnimationFrame(tick);
    }

    function stopInertia() {
      if (lenis?.isScrolling !== "smooth") return;
      window.cancelAnimationFrame(frame);
      frame = 0;
      lenis.scrollTo(window.scrollY, { immediate: true });
    }

    async function initialize(version: number) {
      try {
        const { default: Lenis } = await import("lenis");
        if (disposed || version !== generation) return;
        lenis = new Lenis({
          autoRaf: false,
          smoothWheel: true,
          syncTouch: false,
          lerp: 0.12,
          anchors: false,
        });
        lenis.on("virtual-scroll", ({ event, deltaY }) => {
          if (event.type === "wheel" && !event.ctrlKey && deltaY !== 0) {
            requestTick();
          }
        });
        root.dataset.scrollMode = "lenis";
      } catch {
        // Native scrolling stays available if the optional chunk cannot load.
        if (!disposed && version === generation) destroy();
      }
    }

    function reconcile() {
      destroy();
      const constrained = performanceLimited || constrainedDevice(device);

      root.dataset.performance = constrained ? "reduced" : "standard";
      if (
        disposed ||
        constrained ||
        reducedMotion.matches ||
        !finePointer.matches ||
        document.hidden
      ) {
        return;
      }

      const version = generation;
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(() => void initialize(version), {
          timeout: 1500,
        });
      } else {
        timer = window.setTimeout(() => void initialize(version), 200);
      }
    }

    // Let links, keyboard, scrollbars and modal content keep native behavior.
    document.addEventListener("pointerdown", stopInertia, { passive: true });
    document.addEventListener("keydown", stopInertia);
    document.addEventListener("click", stopInertia, true);
    document.addEventListener("visibilitychange", reconcile);
    window.addEventListener("popstate", stopInertia);
    reducedMotion.addEventListener("change", reconcile);
    finePointer.addEventListener("change", reconcile);
    device.connection?.addEventListener("change", reconcile);
    reconcile();

    return () => {
      disposed = true;
      destroy();
      delete root.dataset.scrollMode;
      delete root.dataset.performance;
      document.removeEventListener("pointerdown", stopInertia);
      document.removeEventListener("keydown", stopInertia);
      document.removeEventListener("click", stopInertia, true);
      document.removeEventListener("visibilitychange", reconcile);
      window.removeEventListener("popstate", stopInertia);
      reducedMotion.removeEventListener("change", reconcile);
      finePointer.removeEventListener("change", reconcile);
      device.connection?.removeEventListener("change", reconcile);
    };
  }, []);

  return null;
}
