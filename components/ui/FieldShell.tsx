import type { ReactNode } from "react";

export type FieldMeta = { label: string; error?: string; help?: string };
export type FieldPresentation = { containerClassName?: string; labelClassName?: string; messageClassName?: string; hideLabel?: boolean };

export function FieldShell({ label, id, error, help, children, containerClassName = "", labelClassName = "", messageClassName = "", hideLabel = false }: FieldMeta & FieldPresentation & { id: string; children: ReactNode }) {
  return <div className={`flex min-w-0 flex-col gap-2 ${containerClassName}`}>
    <label className={`${hideLabel ? "sr-only" : "text-sm font-medium text-white/85"} ${labelClassName}`} htmlFor={id}>{label}</label>
    {children}
    {(error || help) && <span id={`${id}-message`} className={`min-h-5 text-xs leading-6 ${error ? "text-rose-300" : "text-muted"} ${messageClassName}`}>{error || help}</span>}
  </div>;
}

export const fieldClass = "min-h-12 w-full rounded-2xl border border-white/15 bg-ink/60 px-4 text-base text-white outline-none transition-colors placeholder:text-muted hover:border-white/25 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm";
