"use client";

import { useEffect, useReducer, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CircleCheck, CircleAlert, TriangleAlert, Info, X } from "lucide-react";
import { toast, toastStore, type ToastMessage } from "@/lib/client/toast";
import { constrainedDevice } from "@/lib/device-capabilities";

const icons = {
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};
function Notice({ item }: { item: ToastMessage }) {
  const element = useRef<HTMLLIElement>(null);
  const closing = useRef(false);
  const dismiss = useRef<() => void>(() => {});
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    closing.current = false;
    let remaining = item.duration,
      started = 0;
    let timer: ReturnType<typeof setTimeout> | undefined,
      exitTimer: ReturnType<typeof setTimeout> | undefined;
    let hovered = false,
      active = true;
    const close = () => {
      if (closing.current) return;
      closing.current = true;
      node.dataset.leaving = "true";
      clearTimeout(timer);
      exitTimer = setTimeout(() => toast.dismiss(item.id), 150);
    };
    dismiss.current = close;
    const pause = () => {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
        remaining -= performance.now() - started;
      }
    };
    const resume = () => {
      pause();
      if (
        !active ||
        closing.current ||
        hovered ||
        document.hidden ||
        node.contains(document.activeElement)
      )
        return;
      if (item.duration <= 0) return;
      started = performance.now();
      timer = setTimeout(close, Math.max(remaining, 0));
    };
    const enter = () => {
      hovered = true;
      pause();
    };
    const leave = () => {
      hovered = false;
      resume();
    };
    const focusOut = () => {
      queueMicrotask(resume);
    };
    const visibility = () => {
      if (document.hidden) pause();
      else resume();
    };
    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);
    node.addEventListener("focusin", pause);
    node.addEventListener("focusout", focusOut);
    document.addEventListener("visibilitychange", visibility);
    resume();
    return () => {
      active = false;
      clearTimeout(timer);
      clearTimeout(exitTimer);
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("focusin", pause);
      node.removeEventListener("focusout", focusOut);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [item]);
  const Icon = icons[item.kind];
  return (
    <li
      ref={element}
      className="toast-notice"
      data-kind={item.kind}
      data-toast-id={item.id}
    >
      <span className="toast-icon" aria-hidden="true">
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <div className="toast-copy">
        <p className="toast-title">{item.title}</p>
        <p className="toast-message">{item.message}</p>
      </div>
      <button
        type="button"
        className="toast-close"
        aria-label={`بستن اعلان: ${item.title}`}
        onClick={() => dismiss.current()}
      >
        <X size={17} aria-hidden="true" />
      </button>
    </li>
  );
}

/** Mounted once above both layouts, so redirecting after a save/login keeps feedback visible. */
export function Toaster() {
  const items = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot,
  );
  const [, redraw] = useReducer((value) => value + 1, 0);
  useEffect(() => {
    // Native modal dialogs occupy the top layer. Render their feedback inside the
    // active dialog, then return it to the body when that dialog closes.
    const close = () => redraw();
    document.addEventListener("close", close, true);
    return () => document.removeEventListener("close", close, true);
  }, []);
  const latest = items.at(-1);
  const target = items.length
    ? document.querySelector("dialog[open]") || document.body
    : null;
  return (
    <>
      <span
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {latest?.announce && latest.kind !== "error"
          ? `${latest.title}. ${latest.message}`
          : ""}
      </span>
      <span className="sr-only" role="alert" aria-atomic="true">
        {latest?.announce && latest.kind === "error"
          ? `${latest.title}. ${latest.message}`
          : ""}
      </span>
      {target &&
        createPortal(
          <section
            className="toast-viewport"
            aria-label="اعلان‌های عملیات"
            dir="rtl"
            data-lenis-prevent
            data-static={constrainedDevice(navigator) || undefined}
          >
            <ol className="toast-list">
              {items.map((item) => (
                <Notice key={`${item.id}-${item.revision}`} item={item} />
              ))}
            </ol>
          </section>,
          target,
        )}
    </>
  );
}
