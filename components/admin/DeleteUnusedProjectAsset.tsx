"use client";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
export function DeleteUnusedProjectAsset({ id, name, disabled, onDeleted }: { id: string; name: string; disabled: boolean; onDeleted: (id: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null), labelId = useId();
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function remove() {
    if (busy) return; setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/project-media/${id}`, { method: "DELETE", signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "حذف فایل انجام نشد."); return; }
      dialog.current?.close(); onDeleted(id);
    } catch { setError("ارتباط قطع شد؛ دوباره تلاش کنید."); }
    finally { setBusy(false); }
  }
  return <><button type="button" disabled={disabled} className="min-h-11 rounded-xl px-3 text-xs text-rose-300 disabled:opacity-40" onClick={() => { setError(""); dialog.current?.showModal(); }}>حذف فایل استفاده‌نشده</button><dialog ref={dialog} aria-labelledby={labelId} className="fixed inset-0 m-auto max-h-[85dvh] w-[min(calc(100%-2rem),28rem)] overflow-y-auto rounded-3xl border border-line bg-panel p-6 text-white backdrop:bg-black/75"><h2 id={labelId} className="text-lg font-bold">حذف دائمی فایل استفاده‌نشده</h2><p className="mt-4 break-all text-sm leading-8 text-muted">فایل «{name}» از کتابخانه حذف می‌شود و قابل بازگردانی نیست. سرور حذف فایل متصل به پروژهٔ ذخیره‌شده را نمی‌پذیرد.</p>{error && <p className="mt-4 text-sm leading-7 text-rose-300" role="alert">{error}</p>}<div className="mt-6 flex flex-wrap gap-3"><Button type="button" variant="secondary" disabled={busy} onClick={() => dialog.current?.close()}>نگه داشتن فایل</Button><Button type="button" disabled={busy} loading={busy} onClick={remove}>حذف دائمی فایل</Button></div></dialog></>;
}
