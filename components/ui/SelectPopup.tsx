"use client";

import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Select as Primitive } from "@base-ui/react/select";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import type { CSSProperties } from "react";
import type { SelectOption, SelectProps } from "./select-types";

export type SelectPopupProps = {
  field: SelectProps;
  currentValue: string | string[];
  description?: string;
  prompt?: string;
  disabled: boolean;
  native: HTMLSelectElement | null;
  onCommit: (value: string | string[]) => void;
};

export function SelectPopup({ field, currentValue, description, prompt, disabled, native, onCommit }: SelectPopupProps) {
  const { id, options, multiple, label, error, className = "", style, loading } = field;
  const direction = field.dir === "ltr" ? "ltr" : "rtl";
  const flat = options.flatMap(option => "options" in option ? option.options.map(item => ({ ...item, disabled: option.disabled || item.disabled })) : [option]).filter(option => !option.hidden);
  const labels = flat.filter(option => (Array.isArray(currentValue) ? currentValue : [currentValue]).includes(String(option.value))).map(option => option.label);
  const display = multiple ? (labels.length ? `${new Intl.NumberFormat("fa-IR").format(labels.length)} گزینه انتخاب‌شده` : prompt || "انتخاب گزینه‌ها") : labels[0] || prompt || "انتخاب کنید";
  const empty = !flat.length;
  const values = multiple ? (Array.isArray(currentValue) ? currentValue : []) : currentValue === "" ? null : String(currentValue);
  const entry = (option: SelectOption, index: number) => option.hidden ? null : <Primitive.Item key={`${option.value}-${index}`} value={String(option.value)} disabled={option.disabled} title={option.title} className="select-option">
    <Primitive.ItemText>{option.label}</Primitive.ItemText><Primitive.ItemIndicator className="select-check"><Check size={16} /></Primitive.ItemIndicator>
  </Primitive.Item>;
  return <DirectionProvider direction={direction}>
    <Primitive.Root<string | null, boolean> value={values} multiple={!!multiple} modal={false} disabled={disabled} items={flat.map(option => ({ value: String(option.value), label: option.label }))} onValueChange={value => onCommit(Array.isArray(value) ? value.filter((item): item is string => item !== null) : value ?? "")}>
      <Primitive.Trigger id={id} data-ui="select" className={`select-trigger ${className}`} style={style as CSSProperties} tabIndex={field.tabIndex} accessKey={field.accessKey} aria-label={field["aria-label"] || label} aria-labelledby={field["aria-labelledby"]} aria-describedby={description} aria-invalid={error ? true : field["aria-invalid"] ?? false} aria-required={field.required || undefined} aria-busy={loading || undefined} title={field.title} onFocus={() => native?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))} onBlur={event => {
        if (!(event.relatedTarget as Element | null)?.closest(`[data-select-owner="${CSS.escape(id)}"]`)) native?.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: event.relatedTarget }));
      }}>
        <Primitive.Value className="select-current">{display}</Primitive.Value>
        <Primitive.Icon className="select-toggle"><ChevronDown size={17} /></Primitive.Icon>
      </Primitive.Trigger>
      <Primitive.Portal container={native?.closest("dialog") || undefined}>
        <Primitive.Positioner side="bottom" align="start" sideOffset={8} collisionPadding={12} alignItemWithTrigger={false} className="select-positioner" data-select-owner={id} dir={direction}>
          <Primitive.Popup className="select-popup" data-lenis-prevent>
            <Primitive.ScrollUpArrow className="select-scroll"><ChevronUp size={16} /></Primitive.ScrollUpArrow>
            <Primitive.List className="select-options">
              {!multiple && prompt !== undefined && <Primitive.Item value={null} disabled={(field.placeholderDisabled ?? !!field.required) || empty} className="select-option select-option--placeholder"><Primitive.ItemText>{prompt}</Primitive.ItemText><Primitive.ItemIndicator className="select-check"><Check size={16} /></Primitive.ItemIndicator></Primitive.Item>}
              {options.map((option, index) => "options" in option ? <Primitive.Group key={`${option.label}-${index}`} className="select-group"><Primitive.GroupLabel className="select-group-label">{option.label}</Primitive.GroupLabel>{option.options.map((item, itemIndex) => entry({ ...item, disabled: option.disabled || item.disabled }, itemIndex))}</Primitive.Group> : entry(option, index))}
              {empty && (multiple || prompt === undefined) && <Primitive.Item value={`empty:${id}`} disabled className="select-option"><Primitive.ItemText>{field.emptyText || "گزینه‌ای موجود نیست"}</Primitive.ItemText></Primitive.Item>}
            </Primitive.List>
            <Primitive.ScrollDownArrow className="select-scroll"><ChevronDown size={16} /></Primitive.ScrollDownArrow>
          </Primitive.Popup>
        </Primitive.Positioner>
      </Primitive.Portal>
    </Primitive.Root>
  </DirectionProvider>;
}
