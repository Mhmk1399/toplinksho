"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Mail, RefreshCw, Save } from "lucide-react";
import { useAdminState, type RequestDraft } from "@/components/admin/AdminState";
import { Button } from "@/components/ui/Button";
import { Select, TextareaField } from "@/components/ui/FormControls";
import { emailStatuses, requestStatuses, type EmailStatus, type RequestStatus } from "@/lib/consultation";

export function InboxBackLink() {
  const { inbox } = useAdminState();
  const params = new URLSearchParams();
  if (inbox?.status) params.set("status", inbox.status);
  if (inbox && inbox.page > 1) params.set("page", String(inbox.page));
  return <Link href={`/admin${params.size ? `?${params}` : ""}`} className="mb-7 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs text-muted hover:bg-white/5 hover:text-white"><ArrowRight size={16} aria-hidden="true" />بازگشت به درخواست‌ها</Link>;
}

export function AdminRequestForm({ id, initial, emailStatus }: { id: string; initial: RequestDraft; emailStatus: EmailStatus }) {
  const router = useRouter();
  const { drafts, setDraft } = useAdminState();
  const draft = drafts[id] || initial;
  const [saved, setSaved] = useState<RequestDraft | null>(null);
  const baseline = saved && saved.version > initial.version ? saved : initial;
  const dirty = draft.status !== baseline.status || draft.notes !== baseline.notes;
  const conflict = draft.version !== baseline.version;
  const [pending, setPending] = useState(false);
  const [mailPending, setMailPending] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [message, setMessage] = useState("");
  function edit(next: RequestDraft) { setDraft(id, { ...next, unsaved: next.status !== initial.status || next.notes !== initial.notes }); }
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) { if (dirty) { event.preventDefault(); event.returnValue = ""; } }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !dirty || conflict) return;
    setPending(true); setError(""); setMessage(""); setExpired(false);
    try {
      const submitted = { ...draft, notes: draft.notes.trim() };
      const response = await fetch(`/api/admin/consultations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(submitted), signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) { setExpired(response.status === 401); setError(data.error || "ذخیره انجام نشد."); if (response.status === 409) router.refresh(); return; }
      const next = { ...submitted, version: data.version, unsaved: false };
      setDraft(id, next);
      setSaved(next);
      setMessage("تغییرات ذخیره شد."); router.refresh();
    } catch { setError("ارتباط برقرار نشد. پیش‌نویس شما در این صفحه باقی مانده است."); }
    finally { setPending(false); }
  }
  async function retryMail() {
    setMailPending(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/consultations/${id}/notification`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) { setExpired(response.status === 401); setError(data.error); return; }
      setMessage("ارسال اعلان در صف قرار گرفت. برای مشاهدهٔ نتیجه، وضعیت را به‌روزرسانی کنید."); router.refresh();
    } catch { setError("ارتباط برقرار نشد. دوباره تلاش کنید."); }
    finally { setMailPending(false); }
  }

  return <div className="space-y-5">
    <form noValidate onSubmit={save} className="rounded-3xl border border-white/10 bg-panel/70 p-6 sm:p-7" aria-label="ویرایش درخواست" aria-busy={pending}>
      <h2 className="mb-6 text-lg font-semibold">پیگیری درخواست</h2>
      <div className="space-y-5"><Select id="request-status" label="وضعیت پیگیری" value={draft.status} disabled={pending} onChange={event => { edit({ ...draft, status: event.target.value as RequestStatus }); setMessage(""); }}>{Object.entries(requestStatuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</Select><TextareaField id="request-notes" label="یادداشت داخلی تیم" help="این یادداشت فقط در پنل مدیریت نمایش داده می‌شود." value={draft.notes} disabled={pending} onChange={event => { edit({ ...draft, notes: event.target.value }); setMessage(""); }} maxLength={5000} rows={8} /></div>
      {dirty && <p className="mt-3 text-xs text-amber-200">تغییرات هنوز ذخیره نشده‌اند. پیش‌نویس هنگام جابه‌جایی بین صفحات مدیریت حفظ می‌شود.</p>}
      {conflict && <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-8 text-amber-100"><p>نسخهٔ جدیدتری در سرور وجود دارد. پیش از ادامه، آخرین یادداشت را بررسی کنید.</p><details className="mt-3"><summary className="cursor-pointer text-accent">مشاهدهٔ آخرین یادداشت سرور</summary><p className="mt-3 whitespace-pre-wrap break-words text-xs">{initial.notes || "یادداشتی ثبت نشده است."}</p><p className="mt-2 text-xs">وضعیت: {requestStatuses[initial.status]}</p></details><button type="button" onClick={() => setDraft(id, { ...draft, version: initial.version })} className="mt-3 min-h-11 rounded-xl border border-amber-300/20 px-3 text-xs hover:bg-white/5">تأیید ادامه با تغییرات من</button></div>}
      <div className="mt-6 flex flex-wrap gap-3"><Button type="submit" disabled={pending || !dirty || conflict} loading={pending} icon={<Save size={16} aria-hidden="true" />}>{pending ? "در حال ذخیره…" : "ذخیره تغییرات"}</Button>{dirty && <button type="button" onClick={() => { setDraft(id, null); setError(""); setMessage(""); }} className="min-h-11 rounded-xl px-3 text-xs text-muted hover:bg-white/5 hover:text-white" disabled={pending}>بازگشت به آخرین نسخه</button>}</div>
    </form>
    <section className="rounded-3xl border border-white/10 bg-panel/70 p-6 sm:p-7"><div className="flex items-center gap-3"><Mail size={20} className="text-accent" aria-hidden="true" /><h2 className="text-base font-semibold">اعلان ایمیلی</h2></div><p className="mt-4 text-sm text-muted">وضعیت: <span className={emailStatus === "sent" ? "text-emerald-300" : "text-accent"}>{emailStatuses[emailStatus]}</span></p><p className="mt-3 text-xs leading-7 text-muted">درخواست در پنل ذخیره شده است؛ وضعیت ایمیل روی اطلاعات ثبت‌شده اثری ندارد.</p><div className="mt-5 flex flex-wrap gap-3">{!["sent", "sending"].includes(emailStatus) && <Button type="button" variant="secondary" onClick={retryMail} loading={mailPending} disabled={mailPending} icon={<Mail size={16} aria-hidden="true" />}>ارسال اعلان</Button>}<button type="button" onClick={() => router.refresh()} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs text-accent hover:bg-white/5"><RefreshCw size={15} aria-hidden="true" />به‌روزرسانی وضعیت</button></div></section>
    <div className="min-h-8" aria-live="polite">{message && <p className="flex items-start gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-sm leading-7 text-emerald-200"><Check size={17} className="mt-1 shrink-0" aria-hidden="true" />{message}</p>}</div>
    {error && <div role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/5 p-4 text-sm leading-7 text-rose-200">{error}{expired && <Link href="/admin/login" target="_blank" rel="noreferrer" className="mt-2 block text-accent underline">ورود مجدد در زبانهٔ جدید؛ پیش‌نویس این صفحه حفظ می‌شود</Link>}</div>}
  </div>;
}
