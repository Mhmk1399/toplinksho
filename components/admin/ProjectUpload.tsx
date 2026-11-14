"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { projectImageLimit, projectVideoLimit, type MediaAsset } from "@/lib/projects";

export function ProjectUpload({ projectId, disabled, onUploaded, onBusy }: { projectId: string; disabled: boolean; onUploaded: (asset: MediaAsset) => void; onBusy: (busy: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null), [busy, setBusy] = useState(false), [progress, setProgress] = useState(0), [error, setError] = useState(""), [message, setMessage] = useState("");
  const xhr = useRef<XMLHttpRequest | null>(null), input = useRef<HTMLInputElement>(null), callback = useRef(onUploaded), busyCallback = useRef(onBusy);
  useEffect(() => { callback.current = onUploaded; busyCallback.current = onBusy; }, [onUploaded, onBusy]);
  useEffect(() => () => { if (xhr.current) { xhr.current.onload = xhr.current.onerror = xhr.current.onabort = xhr.current.ontimeout = null; xhr.current.upload.onprogress = null; xhr.current.abort(); busyCallback.current(false); } }, []);
  function upload() {
    if (!file || xhr.current || disabled) return;
    const image = ["image/png", "image/jpeg", "image/webp"].includes(file.type);
    if ((!image && !["video/mp4", "video/webm"].includes(file.type)) || !file.size || file.size > (image ? projectImageLimit : projectVideoLimit)) { setError("فرمت یا حجم فایل مجاز نیست؛ تصویر تا ۸ و ویدیو تا ۸۰ مگابایت انتخاب کنید."); return; }
    const request = new XMLHttpRequest(); xhr.current = request; setBusy(true); onBusy(true); setProgress(0); setError(""); setMessage("");
    const finish = () => { xhr.current = null; setBusy(false); busyCallback.current(false); };
    request.open("POST", "/api/admin/project-media"); request.timeout = 300000;
    request.setRequestHeader("Content-Type", file.type); request.setRequestHeader("x-file-name", encodeURIComponent(file.name)); request.setRequestHeader("x-project-id", projectId);
    request.upload.onprogress = event => { if (event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100)); };
    request.onload = () => {
      try { const result = JSON.parse(request.responseText); if (request.status < 200 || request.status >= 300) { setError(result.error || "بارگذاری کامل نشد؛ دوباره تلاش کنید."); } else { callback.current(result.asset); setMessage("فایل ذخیره شد؛ توضیحات رسانه را تکمیل و پروژه را ذخیره کنید."); setFile(null); if (input.current) input.current.value = ""; } }
      catch { setError("پاسخ سرور کامل نبود. فایل را دوباره انتخاب و تلاش کنید."); }
      finish();
    };
    request.onerror = request.ontimeout = () => { setError("ارتباط قطع شد؛ فایل انتخاب‌شده حفظ شده و می‌توانید دوباره تلاش کنید."); finish(); };
    request.onabort = () => { setMessage("بارگذاری لغو شد. برای شروع دوباره، بارگذاری فایل را بزنید."); finish(); };
    request.send(file);
  }
  return <div className="rounded-2xl border border-dashed border-accent/30 bg-ink/50 p-4 sm:p-5">
    <label htmlFor="project-upload" className="mb-2 block text-sm font-semibold">افزودن تصویر یا ویدیو</label>
    <p id="project-upload-help" className="mb-4 text-xs leading-7 text-muted">PNG، JPEG یا WebP تا ۸ مگابایت؛ MP4 یا WebM تا ۸۰ مگابایت. تصاویر برای وب بهینه می‌شوند. هر بار یک فایل بارگذاری کنید.</p>
    <input ref={input} id="project-upload" type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm" aria-describedby="project-upload-help" disabled={disabled || busy} onChange={event => { setFile(event.target.files?.[0] || null); setError(""); setMessage(""); }} className="min-h-11 w-full min-w-0 rounded-xl border border-line p-2 text-sm file:me-3 file:rounded-lg file:border-0 file:bg-accent/15 file:px-3 file:py-2 file:text-accent" />
    {file && <p className="mt-3 break-all text-xs leading-7 text-muted">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} مگابایت</p>}
    <div className="mt-4 flex flex-wrap gap-3"><Button type="button" size="sm" variant="secondary" onClick={upload} disabled={disabled || busy || !file} loading={busy}>{busy ? "در حال بارگذاری…" : "بارگذاری فایل"}</Button>{busy && <button type="button" onClick={() => xhr.current?.abort()} className="min-h-11 rounded-xl px-3 text-xs text-accent">لغو بارگذاری</button>}</div>
    {busy && <div className="mt-4"><label htmlFor="project-upload-progress" className="mb-2 block text-xs text-muted">{progress === 100 ? "در حال پردازش و ذخیره…" : `ارسال ${progress.toLocaleString("fa-IR")}٪`}</label><progress id="project-upload-progress" value={progress} max={100} className="h-2 w-full accent-accent" /></div>}
    {error && <p className="mt-4 text-sm leading-7 text-rose-300" role="alert">{error}</p>}<p role="status" className="mt-3 text-xs leading-7 text-accent">{message}</p>
  </div>;
}
