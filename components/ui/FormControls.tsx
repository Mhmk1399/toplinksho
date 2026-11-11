import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

type FieldMeta = { label: string; error?: string; help?: string };
function FieldShell({ label, id, error, help, children }: FieldMeta & { id: string; children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-2">
    <label className="text-sm font-medium text-white/85" htmlFor={id}>{label}</label>
    {children}
    {(error || help) && <span id={`${id}-message`} className={`min-h-5 text-xs leading-6 ${error ? "text-rose-300" : "text-muted"}`}>{error || help}</span>}
  </div>;
}
const fieldClass = "min-h-12 w-full rounded-2xl border border-white/15 bg-ink/60 px-4 text-base text-white outline-none transition-colors placeholder:text-muted hover:border-white/25 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm";
export function Input({ label, error, help, id, ...props }: FieldMeta & InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return <FieldShell label={label} id={id} error={error} help={help}><input className={fieldClass} id={id} aria-invalid={!!error} aria-describedby={error || help ? `${id}-message` : undefined} {...props} /></FieldShell>;
}
export function TextareaField({ label, error, help, id, ...props }: FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }) {
  return <FieldShell label={label} id={id} error={error} help={help}><textarea className={`${fieldClass} min-h-32 resize-none py-3 leading-7`} id={id} aria-invalid={!!error} aria-describedby={error || help ? `${id}-message` : undefined} {...props} /></FieldShell>;
}
export { TextareaField as Textarea };
export function Select({ label, error, help, id, children, ...props }: FieldMeta & SelectHTMLAttributes<HTMLSelectElement> & { id: string }) {
  return <FieldShell label={label} id={id} error={error} help={help}><select className={`${fieldClass} bg-ink`} id={id} aria-invalid={!!error} aria-describedby={error || help ? `${id}-message` : undefined} {...props}>{children}</select></FieldShell>;
}
