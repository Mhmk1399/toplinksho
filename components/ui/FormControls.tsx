import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldMeta = { label: string; error?: string; success?: string };

function FieldShell({ label, id, error, success, children }: FieldMeta & { id: string; children: React.ReactNode }) {
  return (
    <div className={`field ${error ? "has-error" : ""} ${success ? "has-success" : ""}`}>
      <label htmlFor={id}>{label}</label>{children}
      {error ? <span className="field-message">{error}</span> : success ? <span className="field-message">{success}</span> : null}
    </div>
  );
}

export function Input({ label, error, success, id, ...props }: FieldMeta & InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return <FieldShell label={label} id={id} error={error} success={success}><input id={id} aria-invalid={!!error} {...props} /></FieldShell>;
}
export function Textarea({ label, error, success, id, ...props }: FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }) {
  return <FieldShell label={label} id={id} error={error} success={success}><textarea id={id} aria-invalid={!!error} {...props} /></FieldShell>;
}
export function Select({ label, error, success, id, children, ...props }: FieldMeta & SelectHTMLAttributes<HTMLSelectElement> & { id: string }) {
  return <FieldShell label={label} id={id} error={error} success={success}><select id={id} aria-invalid={!!error} {...props}>{children}</select></FieldShell>;
}
