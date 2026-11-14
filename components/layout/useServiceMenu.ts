"use client";

import { useCallback, useEffect, useRef, type FocusEvent, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { constrainedDevice } from "@/lib/device-capabilities";

const desktopQuery = "(min-width: 1200px)";
const hoverQuery = `${desktopQuery} and (hover: hover) and (pointer: fine)`;
const resting = { opacity: "1", transform: "translateY(0) scale(1)" };
const folded = { opacity: "0", transform: "translateY(-6px) scale(.99)" };

/** Native disclosure semantics remain available before hydration and without JS. */
export function useServiceMenu(pathname: string) {
  const services = useRef<HTMLDetailsElement>(null);
  const intent = useRef<"hover" | "explicit" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animation = useRef<Animation | null>(null);
  const clearTimer = useCallback(() => { clearTimeout(timer.current); timer.current = undefined; }, []);
  const motionAllowed = useCallback(() => !matchMedia("(prefers-reduced-motion: reduce)").matches && !constrainedDevice(navigator) && document.documentElement.dataset.performance !== "reduced" && !document.hidden, []);

  const transition = useCallback((opening: boolean, immediate = false) => {
    clearTimer();
    const node = services.current, panel = node?.querySelector<HTMLElement>(".service-mega-menu");
    if (!node || !panel) return;
    if (opening && node.open && node.dataset.motion !== "closing" && !immediate) return;
    if (!opening && (!node.open || (node.dataset.motion === "closing" && !immediate))) return;
    // Read only when reversing an in-flight transition; ordinary hover needs no layout read.
    const from = animation.current ? { opacity: getComputedStyle(panel).opacity, transform: getComputedStyle(panel).transform } : opening ? folded : resting;
    animation.current?.cancel(); animation.current = null;
    if (!opening && panel.contains(document.activeElement)) node.querySelector("summary")?.focus({ preventScroll: true });
    panel.inert = !opening;
    if (opening) node.open = true;
    const animated = !immediate && motionAllowed() && typeof panel.animate === "function";
    if (animated) node.dataset.motion = opening ? "opening" : "closing";
    const running = animated ? panel.animate([from, opening ? resting : folded], { duration: opening ? 180 : 140, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" }) : null;
    animation.current = running;
    const finish = () => {
      if (running && animation.current !== running) return;
      if (!opening) node.open = false;
      animation.current?.cancel(); animation.current = null;
      delete node.dataset.motion;
      panel.inert = false;
    };
    if (running) running.onfinish = finish;
    else finish();
  }, [clearTimer, motionAllowed]);

  const openServices = useCallback((source: "hover" | "explicit" = "explicit") => {
    if (source === "explicit" || intent.current !== "explicit") intent.current = source;
    transition(true);
  }, [transition]);
  const closeServices = useCallback((immediate = false) => { intent.current = null; transition(false, immediate); }, [transition]);

  const onPointerEnter = (event: ReactPointerEvent<HTMLDetailsElement>) => {
    if (event.pointerType === "touch" || !matchMedia(hoverQuery).matches) return;
    clearTimer();
    if (services.current?.open) { openServices("hover"); return; }
    timer.current = setTimeout(() => openServices("hover"), 70);
  };
  const onPointerLeave = () => {
    clearTimer();
    if (intent.current !== "hover") return;
    timer.current = setTimeout(() => {
      if (!services.current?.querySelector(".service-mega-menu")?.contains(document.activeElement)) closeServices();
    }, 170);
  };
  const onBlur = (event: FocusEvent<HTMLDetailsElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) closeServices();
  };
  const onTriggerClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    // A pointer click can pin a hover-open menu; keyboard activation always toggles.
    if (services.current?.open && services.current.dataset.motion !== "closing" && (intent.current !== "hover" || event.detail === 0)) closeServices();
    else openServices();
  };

  useEffect(() => { closeServices(true); }, [pathname, closeServices]);
  useEffect(() => {
    const desktop = matchMedia(desktopQuery), motion = matchMedia("(prefers-reduced-motion: reduce)");
    const outside = (event: PointerEvent) => {
      if (services.current?.open && !services.current.contains(event.target as Node)) closeServices();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      if (event.key === "Escape" && services.current?.open) { event.preventDefault(); closeServices(); return; }
      if (event.key.toLowerCase() !== "k" || !(event.ctrlKey || event.metaKey) || event.altKey || !desktop.matches || (event.target as HTMLElement).closest("input,textarea,select,[contenteditable=true]")) return;
      event.preventDefault(); openServices();
      services.current?.querySelector<HTMLAnchorElement>(".service-menu-group")?.focus({ preventScroll: true });
    };
    const resize = () => closeServices(true);
    const reconcile = () => {
      if (document.hidden) closeServices(true);
      else if (animation.current && !motionAllowed()) transition(services.current?.dataset.motion === "opening", true);
    };
    const performance = new MutationObserver(reconcile);
    performance.observe(document.documentElement, { attributes: true, attributeFilter: ["data-performance"] });
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", reconcile);
    desktop.addEventListener("change", resize);
    motion.addEventListener("change", reconcile);
    return () => {
      clearTimer(); animation.current?.cancel(); animation.current = null;
      performance.disconnect();
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("visibilitychange", reconcile);
      desktop.removeEventListener("change", resize);
      motion.removeEventListener("change", reconcile);
    };
  }, [clearTimer, closeServices, motionAllowed, openServices, transition]);

  return { services, closeServices, onPointerEnter, onPointerLeave, onBlur, onTriggerClick };
}
