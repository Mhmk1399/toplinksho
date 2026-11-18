"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useImperativeHandle, useRef, useState, type ChangeEventHandler } from "react";
import { FieldShell } from "@/components/ui/FieldShell";
import type { SelectProps, SelectOption } from "./select-types";
import type { SelectPopupProps } from "./SelectPopup";
export type { SelectProps, SelectOption, SelectOptionGroup } from "./select-types";
type PopupComponent = typeof import("./SelectPopup").SelectPopup;

function applyNativeSelection(node: HTMLSelectElement, value: string | string[]) {
  if (Array.isArray(value)) Array.from(node.options).forEach(option => { option.selected = value.includes(option.value); });
  else node.value = value;
  node.dispatchEvent(new Event("change", { bubbles: true }));
}

/** SSR/native fallback upgraded after the accessible popup chunk loads. */
export function Select(props: SelectProps) {
  const { id, label, options, error, help, placeholder, placeholderDisabled = !!props.required || !!props.multiple,
    loading = false, loadingText = "در حال دریافت گزینه‌ها…", emptyText = "گزینه‌ای موجود نیست",
    containerClassName, labelClassName, messageClassName, hideLabel, className = "", multiple, size, value, defaultValue,
    onChange, onValueChange, disabled, ref, ...nativeProps } = props;
  const native = useRef<HTMLSelectElement>(null);
  const [Popup, setPopup] = useState<PopupComponent | null>(null);
  const [selected, setSelected] = useState<string | string[] | null>(null);
  const [fieldDisabled, setFieldDisabled] = useState(false);
  const [nativeElement, setNativeElement] = useState<HTMLSelectElement | null>(null);
  useImperativeHandle(ref, () => native.current!, []);
  const enhanced = !!Popup;
  const count = options.reduce((total, option) => total + ("options" in option ? option.options.length : 1), 0);
  const message = loading ? loadingText : help;
  const description = [...new Set([...(nativeProps["aria-describedby"] || "").split(/\\s+/), error || message ? id + "-message" : ""].filter(Boolean))].join(" ") || undefined;
  const prompt = loading && !count ? loadingText : placeholder ?? (!count ? emptyText : undefined);
  const listbox = multiple || (size !== undefined && size > 1);

  useEffect(() => {
    const node = native.current;
    if (!node || (size !== undefined && size > 1 && !multiple)) return;
    let disposed = false;
    let requested = false;
    let cleanupFocus: (() => void) | undefined;
    let observer: IntersectionObserver | undefined;
    let timer: number | undefined;
    let idle: number | undefined;
    let waiting = false;
    const cancelScheduled = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      timer = idle = undefined;
      waiting = false;
      window.removeEventListener("scroll", settledScroll);
    };
    const load = () => {
      if (requested || disposed) return;
      requested = true;
      cancelScheduled();
      observer?.disconnect();
      void import("./SelectPopup").then(module => {
        const upgrade = () => {
          if (disposed) return;
          setSelected(multiple ? Array.from(node.selectedOptions, option => option.value) : node.value);
          setFieldDisabled(node.matches(":disabled"));
          setNativeElement(node);
          setPopup(() => module.SelectPopup);
        };
        // Preserve a native interaction already in progress during a slow script load.
        if (document.activeElement === node) { node.addEventListener("blur", upgrade, { once: true }); cleanupFocus = () => node.removeEventListener("blur", upgrade); }
        else upgrade();
      }).catch(() => { /* The styled native field remains usable if the optional chunk fails. */ });
    };
    function settledScroll() {
      if (timer !== undefined) window.clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      idle = undefined;
      timer = window.setTimeout(() => {
        timer = undefined;
        if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(load, { timeout: 1200 });
        else load();
      }, 180);
    }
    const schedule = () => {
      if (requested || disposed || waiting) return;
      waiting = true;
      window.addEventListener("scroll", settledScroll, { passive: true });
      settledScroll();
    };
    // Below-the-fold forms must not compete with the hero for parsing/hydration.
    // Enhance before use, after a quiet scroll interval, so importing the popup
    // cannot interrupt an active gesture. Focus/click intent can load directly.
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) schedule(); else cancelScheduled(); }, { rootMargin: "320px" });
      observer.observe(node);
    } else schedule();
    node.addEventListener("pointerenter", schedule, { once: true });
    node.addEventListener("pointerdown", load, { once: true });
    node.addEventListener("focus", load, { once: true });
    return () => {
      disposed = true; observer?.disconnect(); cleanupFocus?.(); cancelScheduled();
      node.removeEventListener("pointerenter", schedule); node.removeEventListener("pointerdown", load); node.removeEventListener("focus", load);
    };
  }, [multiple, size]);

  useEffect(() => {
    const node = native.current;
    if (!node) return;
    const sync = () => {
      setSelected(multiple ? Array.from(node.selectedOptions, option => option.value) : node.value);
      setFieldDisabled(node.matches(":disabled"));
    };
    const observer = new MutationObserver(sync);
    observer.observe(node, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "selected", "value", "hidden"] });
    let ancestor = node.parentElement;
    while (ancestor) {
      if (ancestor instanceof HTMLFieldSetElement) observer.observe(ancestor, { attributes: true, attributeFilter: ["disabled"] });
      ancestor = ancestor.parentElement;
    }
    const reset = () => queueMicrotask(sync);
    const form = node.form;
    form?.addEventListener("reset", reset);
    return () => { observer.disconnect(); form?.removeEventListener("reset", reset); };
  }, [multiple]);

  const handleChange: ChangeEventHandler<HTMLSelectElement> = event => {
    const next = Array.from(event.currentTarget.selectedOptions, option => option.value);
    const nextValue = event.currentTarget.value;
    setSelected(multiple ? next : nextValue);
    onChange?.(event);
    if (onValueChange) {
      if (props.multiple) props.onValueChange?.(next, event);
      else props.onValueChange?.(nextValue, event);
    }
  };
  const commit: SelectPopupProps["onCommit"] = next => {
    const node = native.current;
    if (!node || node.matches(":disabled")) return;
    applyNativeSelection(node, next);
  };
  const renderOption = (option: SelectOption, index: number) => <option key={String(option.value) + "-" + index} value={option.value} disabled={option.disabled} hidden={option.hidden} title={option.title}>{option.label}</option>;
  const currentValue = value !== undefined ? multiple ? (value as readonly string[]).map(String) : String(value) : selected ?? (multiple ? (defaultValue as readonly string[] | undefined)?.map(String) || [] : String(defaultValue ?? ""));

  return <FieldShell id={id} label={label} error={error} help={message} containerClassName={containerClassName} labelClassName={labelClassName} messageClassName={messageClassName} hideLabel={hideLabel}>
    <div className="select-shell" data-enhanced={enhanced ? "true" : undefined} dir={nativeProps.dir}>
      <select {...nativeProps} ref={native} id={enhanced ? id + "-native" : id} data-ui={enhanced ? "select-native" : "select"} multiple={multiple} size={size ?? (multiple ? 5 : undefined)}
        value={value} defaultValue={defaultValue ?? (value === undefined && prompt && !multiple ? "" : undefined)} onChange={handleChange} disabled={disabled || loading}
        aria-hidden={enhanced || undefined} tabIndex={enhanced ? -1 : nativeProps.tabIndex} aria-busy={loading || undefined}
        aria-invalid={enhanced ? undefined : error ? true : nativeProps["aria-invalid"] ?? false} aria-describedby={enhanced ? undefined : description}
        className={["select-native", error ? "select-native--invalid" : "", className].join(" ")}>
        {prompt !== undefined && <option value="" disabled={placeholderDisabled || loading || !count}>{prompt}</option>}
        {options.map((option, index) => "options" in option ? <optgroup key={option.label + "-" + index} label={option.label} disabled={option.disabled}>{option.options.map(renderOption)}</optgroup> : renderOption(option, index))}
      </select>
      {Popup ? <Popup field={props} currentValue={currentValue} description={description} prompt={prompt} disabled={!!disabled || loading || fieldDisabled} native={nativeElement} onCommit={commit} />
        : !listbox && <ChevronDown size={17} aria-hidden="true" className="select-native-chevron" />}
    </div>
  </FieldShell>;
}
