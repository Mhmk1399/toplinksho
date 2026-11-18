"use client";

import { useEffect } from "react";

/** Older browsers ignore details[name]; modern browsers need no observer. */
export function FAQExclusiveFallback({ group }: { group: string }) {
  useEffect(() => {
    if ("name" in HTMLDetailsElement.prototype) return;
    const root = document.getElementById(group);
    if (!root) return;
    const keep = (current: HTMLDetailsElement) => {
      for (const item of root.children) {
        if (item instanceof HTMLDetailsElement && item !== current && item.open) item.open = false;
      }
    };
    const opened = root.querySelectorAll<HTMLDetailsElement>(":scope > details[open]");
    if (opened.length > 1) keep(opened[opened.length - 1]);
    const observer = new MutationObserver(records => {
      // Prefer the last newly opened item, even for rapid changes in one task.
      for (let index = records.length - 1; index >= 0; index -= 1) {
        const record = records[index], item = record.target;
        if (record.oldValue === null && item instanceof HTMLDetailsElement && item.parentElement === root && item.open) {
          keep(item);
          break;
        }
      }
    });
    observer.observe(root, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["open"] });
    return () => observer.disconnect();
  }, [group]);
  return null;
}
