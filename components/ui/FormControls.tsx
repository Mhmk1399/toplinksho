import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldMeta = { label: string; error?: string; success?: string };

function FieldShell({ label, id, error, success, children }: FieldMeta & { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-white/70" htmlFor={id}>{label}</label>{children}
      {error ? <span className="text-xs text-rose-400">{error}</span> : success ? <span className="text-xs text-emerald-400">{success}</span> : null}
    </div>
  );
}

export function Input({ label, error, success, id, ...props }: FieldMeta & InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return <FieldShell label={label} id={id} error={error} success={success}><input className="min-h-12 rounded-2xl border border-white/10 bg-white/[.045] px-4 text-white outline-none placeholder:text-white/35 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/15" id={id} aria-invalid={!!error} {...props} /></FieldShell>;
}
export function Textarea({ label, error, success, id, ...props }: FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }) {
  return <FieldShell label={label} id={id} error={error} success={success}><textarea className="min-h-32 resize-y rounded-2xl border border-white/10 bg-white/[.045] p-4 text-white outline-none placeholder:text-white/35 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/15" id={id} aria-invalid={!!error} {...props} /></FieldShell>;
}
export function Select({ label, error, success, id, children, ...props }: FieldMeta & SelectHTMLAttributes<HTMLSelectElement> & { id: string }) {
  return <FieldShell label={label} id={id} error={error} success={success}><select className="min-h-12 rounded-2xl border border-white/10 bg-[#0c1029] px-4 text-white outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/15" id={id} aria-invalid={!!error} {...props}>{children}</select></FieldShell>;
}
