"use client";

import { useId, useRef, useState } from "react";
import { CheckCircle2, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, TextareaField } from "@/components/ui/FormControls";
import { createSubmissionId } from "@/lib/client/submission-id";
import { toast } from "@/lib/client/toast";
import { useFeedback } from "@/components/ui/useFeedback";
import { consultationSubjects, validateConsultation, type ConsultationField, type FieldErrors } from "@/lib/consultation";

export function ContactForm() {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const submission = useRef({ signature: "", key: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useFeedback("error", `${id}-consultation`);
  const [reference, setReference] = useState("");

  function update(key: ConsultationField) {
    setErrors(current => ({ ...current, [key]: undefined }));
    setError("");
  }
  function focusError(fields: FieldErrors) {
    const name = Object.keys(fields)[0];
    // The enhanced select keeps its native value field hidden. Focus the
    // visible control sharing the original field id, including before upgrade.
    document.getElementById(`${id}-${name}`)?.focus();
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    // Native fields preserve early typing/autofill across hydration. Read the
    // submitted DOM values, including autofill that dispatched no React event.
    const data = new FormData(event.currentTarget);
    const checked = validateConsultation(Object.fromEntries(data));
    setErrors(checked.errors);
    if (Object.keys(checked.errors).length) { toast.warning("فیلدهای مشخص‌شده را بررسی و تکمیل کنید.", { id: `${id}-consultation`, announce: false }); focusError(checked.errors); return; }
    submitting.current = true;
    setPending(true);
    setError("");
    let timeout: number | undefined;
    try {
      const signature = JSON.stringify(checked.values);
      if (submission.current.signature !== signature) submission.current = { signature, key: createSubmissionId() };
      const company = data.get("company");
      const controller = new AbortController();
      timeout = window.setTimeout(() => controller.abort(), 15000);
      const response = await fetch("/api/consultations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...checked.values, company, submissionId: submission.current.key }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!result) throw new Error("پاسخ معتبری دریافت نشد. اطلاعات شما در فرم باقی مانده؛ دوباره تلاش کنید.");
      if (!response.ok) {
        if (result.errors) { setErrors(result.errors); focusError(result.errors); }
        throw new Error(result.error || "ثبت درخواست انجام نشد. دوباره تلاش کنید.");
      }
      if (typeof result.reference !== "string") throw new Error("ثبت درخواست تأیید نشد. دوباره تلاش کنید.");
      setReference(result.reference);
      toast.success(`درخواست مشاوره با موفقیت ثبت شد.\nکد پیگیری: ${result.reference}`, { id: `${id}-consultation`, announce: false });
    } catch (failure) {
      setError(failure instanceof Error && !["TimeoutError", "AbortError", "TypeError"].includes(failure.name) ? failure.message : "ارتباط برقرار نشد. اطلاعات در فرم باقی مانده است؛ دوباره تلاش کنید.");
    } finally { window.clearTimeout(timeout); submitting.current = false; setPending(false); }
  }

  if (reference) return <div className="flex min-h-[530px] flex-col items-center justify-center text-center" role="status" aria-live="polite">
    <span className="mb-6 grid size-16 place-items-center rounded-full border border-emerald-300/20 bg-emerald-300/10 text-emerald-300"><CheckCircle2 size={30} aria-hidden="true" /></span>
    <h3 className="text-2xl font-bold" tabIndex={-1} ref={node => { if (node) { node.focus({ preventScroll: true }); node.scrollIntoView({ block: "center", behavior: "auto" }); } }}>درخواست شما ثبت شد.</h3>
    <p className="mt-4 max-w-sm text-sm leading-8 text-muted">تیم تاپ لینک شو برای گفت‌وگو دربارهٔ نیازتان با شماره‌ای که ثبت کردید، با شما در ارتباط خواهد بود.</p>
    <p className="mt-6 rounded-xl border border-white/10 bg-ink px-5 py-3 text-sm text-accent" dir="ltr">{reference}</p>
    <p className="mt-2 text-xs text-muted">کد پیگیری درخواست</p>
    <Button type="button" variant="secondary" className="mt-8" icon={<RotateCcw size={16} aria-hidden="true" />} onClick={() => { setReference(""); submission.current = { key: "", signature: "" }; }}>ثبت درخواست دیگر</Button>
  </div>;

  return <form ref={form} onSubmit={submit} noValidate className="grid gap-5" aria-label="فرم مشاوره رایگان" aria-busy={pending}>
    <div className="grid gap-5 sm:grid-cols-2">
      <Input id={`${id}-name`} name="name" label="نام و نام خانوادگی *" autoComplete="name" onChange={() => update("name")} error={errors.name} required disabled={pending} maxLength={100} placeholder="نام شما" />
      <Input id={`${id}-phone`} name="phone" label="شماره تماس *" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" onChange={() => update("phone")} error={errors.phone} required disabled={pending} maxLength={32} placeholder="0912 345 6789" />
    </div>
    <Select id={`${id}-subject`} name="subject" label="مشاوره در زمینهٔ *" onValueChange={() => update("subject")} error={errors.subject} required disabled={pending} placeholder="زمینهٔ مشاوره را انتخاب کنید" options={consultationSubjects.map(subject => ({ value: subject, label: subject }))} />
    <TextareaField id={`${id}-description`} name="description" label="در چه موردی به مشاوره نیاز دارید؟" onChange={() => update("description")} error={errors.description} disabled={pending} maxLength={3000} rows={4} placeholder="کمی دربارهٔ کسب‌وکار، هدف و نیازتان بنویسید." />
    <Input id={`${id}-website`} name="website" label="آدرس سایت یا شبکهٔ اجتماعی کسب‌وکار" dir="ltr" autoComplete="url" onChange={() => update("website")} error={errors.website} disabled={pending} maxLength={250} placeholder="example.com یا @yourbrand" />
    <div className="hidden" aria-hidden="true"><label htmlFor={`${id}-company`}>Company<input id={`${id}-company`} name="company" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-xs text-[11px] leading-6 text-muted">اطلاعات شما برای پاسخ‌گویی به همین درخواست در اختیار تیم تاپ لینک شو قرار می‌گیرد.</p>
      <Button type="submit" loading={pending} disabled={pending} className="min-w-40 shrink-0" icon={!pending ? <ArrowLeft size={17} aria-hidden="true" /> : undefined}>{pending ? "در حال ثبت…" : "ارسال درخواست"}</Button>
    </div>
    <div className="min-h-6" role="alert">{error && <p className="rounded-xl border border-rose-300/20 bg-rose-300/5 px-4 py-3 text-sm leading-7 text-rose-200">{error}</p>}</div>
  </form>;
}
