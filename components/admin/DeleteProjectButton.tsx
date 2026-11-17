"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/useFeedback";
import { useAdminState } from "@/components/admin/AdminState";
import { toast } from "@/lib/client/toast";

type Props = {
  id: string;
  title: string;
  version: number;
  disabled?: boolean;
  redirectToList?: boolean;
  deletionPending?: boolean;
  onBusy?: (busy: boolean) => void;
};
type LatestProject = { title: string; version: number; deletionPending?: boolean };

export function DeleteProjectButton({ id, title, version, disabled = false, redirectToList = false, deletionPending = false, onBusy }: Props) {
  const router = useRouter();
  const { projectDrafts, projectUploads, setProjectDraft, setProjectUploading } = useAdminState();
  const dialog = useRef<HTMLDialogElement>(null), cancel = useRef<HTMLButtonElement>(null);
  const request = useRef<AbortController | null>(null), inFlight = useRef(false), busyCallback = useRef(onBusy);
  const labelId = useId(), descriptionId = useId();
  const [busy, setBusy] = useState(false), [removed, setRemoved] = useState(false);
  const [latest, setLatest] = useState<LatestProject | null>(null), [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useFeedback("error", `delete-project-${id}`);
  const blocked = disabled || !!projectUploads[id];
  const pendingCleanup = deletionPending || latest?.deletionPending;
  const unsaved = Object.entries(projectDrafts).some(([key, draft]) => (key === id || draft.projectId === id) && draft.unsaved);

  useEffect(() => { busyCallback.current = onBusy; }, [onBusy]);
  useEffect(() => () => {
    request.current?.abort();
    if (inFlight.current) busyCallback.current?.(false);
  }, []);

  function open() {
    if (blocked || inFlight.current || removed) return;
    setError(""); setLatest(null); setNeedsLogin(false);
    dialog.current?.showModal();
    cancel.current?.focus();
  }

  async function remove() {
    if (blocked || inFlight.current || removed) return;
    inFlight.current = true; setBusy(true); busyCallback.current?.(true); setError(""); setNeedsLogin(false);
    const controller = new AbortController(); request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: latest?.version || version }), signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok && response.status !== 404) {
        let message = typeof result?.error === "string" ? result.error : "حذف پروژه انجام نشد. دوباره تلاش کنید.";
        if (response.status === 409) {
          const current = await fetch(`/api/admin/projects/${id}`, { cache: "no-store", signal: controller.signal });
          const data = current.ok ? await current.json() : null;
          if (Number.isInteger(data?.project?.version) && typeof data?.project?.title === "string") {
            setLatest({ title: data.project.title, version: data.project.version, deletionPending: data.project.deletionPending });
            message = "این پروژه هم‌زمان تغییر کرده است. عنوان فعلی را بررسی و در صورت اطمینان، حذف را دوباره تأیید کنید.";
          }
        }
        setNeedsLogin(response.status === 401); setError(message);
        if (response.status === 409 || response.status === 503) router.refresh();
        return;
      }
      if (response.status !== 404 && result?.ok !== true) throw new Error("Incomplete response");
      for (const [key, draft] of Object.entries(projectDrafts)) if (key === id || draft.projectId === id) setProjectDraft(key, null);
      setProjectUploading(id, false);
      setRemoved(true); dialog.current?.close();
      toast.success("پروژه و فایل‌های آپلودشدهٔ اختصاصی آن حذف شدند.", { id: `delete-project-${id}`, title: "حذف پروژه انجام شد" });
      if (redirectToList) router.replace("/admin/projects");
      router.refresh();
    } catch {
      setError("نتیجهٔ حذف مشخص نشد. برای بررسی و تکمیل عملیات، دوباره تلاش کنید.");
    } finally {
      window.clearTimeout(timeout); request.current = null; inFlight.current = false;
      setBusy(false); busyCallback.current?.(false);
    }
  }

  return <div>
    <button type="button" onClick={open} disabled={blocked || busy || removed} aria-label={`حذف پروژهٔ ${title}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] px-3 text-xs text-[var(--danger)] transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] disabled:cursor-not-allowed disabled:opacity-45">
      <Trash2 size={15} aria-hidden="true" />{removed ? "حذف شد" : pendingCleanup ? "تکمیل حذف پروژه" : "حذف پروژه"}
    </button>
    <dialog ref={dialog} aria-labelledby={labelId} aria-describedby={descriptionId} aria-busy={busy} onCancel={event => { if (inFlight.current) event.preventDefault(); }} style={{ position: "fixed" }} className="neon-surface fixed inset-0 m-auto max-h-[85dvh] w-[min(calc(100%-2rem),30rem)] overflow-y-auto p-5 text-[var(--text)] shadow-[0_20px_80px_color-mix(in_srgb,var(--shadow)_45%,transparent)] backdrop:bg-[color-mix(in_srgb,var(--shadow)_75%,transparent)] sm:p-7">
      <span className="mb-4 grid size-12 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)]"><Trash2 size={23} aria-hidden="true" /></span>
      <h2 id={labelId} className="text-xl font-bold">{pendingCleanup ? "تکمیل حذف پروژه" : "حذف دائمی پروژه"}</h2>
      <p className="mt-4 break-words text-sm font-semibold leading-8">{latest?.title || title}</p>
      <p id={descriptionId} className="mt-2 text-sm leading-8 text-muted">پروژه و فایل‌های آپلودشدهٔ اختصاصی آن برای همیشه حذف می‌شوند و صفحهٔ پروژه از سایت برداشته می‌شود. تصویرهای مشترک سایت حذف نمی‌شوند.</p>
      {pendingCleanup && <p className="mt-3 text-xs leading-7 text-[var(--warning)]">پروژه از نمایش عمومی خارج شده است. برای پاک‌سازی فایل‌های باقی‌مانده، عملیات حذف را تکمیل کنید.</p>}
      {unsaved && <p className="mt-3 text-xs leading-7 text-[var(--warning)]">تغییرات ذخیره‌نشدهٔ این پروژه نیز کنار گذاشته می‌شوند.</p>}
      <div role="alert" className="mt-4 text-sm leading-8 text-[var(--danger)]">{error}</div>
      {needsLogin && <Link href={`/admin/login?next=${encodeURIComponent(redirectToList ? `/admin/projects/${id}` : "/admin/projects")}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm text-accent underline">ورود مجدد در زبانهٔ جدید</Link>}
      <div className="mt-5 flex flex-wrap gap-3">
        <button ref={cancel} type="button" className={buttonClasses({ variant: "secondary", size: "sm" })} disabled={busy} onClick={() => dialog.current?.close()}>انصراف</button>
        <Button type="button" size="sm" disabled={busy || blocked || removed} loading={busy} onClick={remove} style={{ backgroundImage: "none", backgroundColor: "var(--danger)", color: "var(--background)", boxShadow: "none" }} className="border-[color-mix(in_srgb,var(--danger)_45%,transparent)]">{busy ? "در حال حذف…" : error ? "تلاش دوباره برای حذف" : "بله، حذف شود"}</Button>
      </div>
    </dialog>
  </div>;
}
