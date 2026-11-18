import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { FieldShell, fieldClass, type FieldMeta } from "@/components/ui/FieldShell";
export { Select } from "@/components/ui/Select";
export type { SelectProps, SelectOption, SelectOptionGroup } from "@/components/ui/Select";
export function Input({ label, error, help, id, ...props }: FieldMeta & InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return <FieldShell label={label} id={id} error={error} help={help}><input className={fieldClass} id={id} aria-invalid={!!error} aria-describedby={error || help ? `${id}-message` : undefined} {...props} /></FieldShell>;
}
export function TextareaField({ label, error, help, id, ...props }: FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }) {
  return <FieldShell label={label} id={id} error={error} help={help}><textarea className={`${fieldClass} min-h-32 resize-none py-3 leading-7`} id={id} aria-invalid={!!error} aria-describedby={error || help ? `${id}-message` : undefined} {...props} /></FieldShell>;
}
export { TextareaField as Textarea };
