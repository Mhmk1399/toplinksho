"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminState } from "@/components/admin/AdminState";
import { LogOut, LoaderCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/useFeedback";
import { toast } from "@/lib/client/toast";

export function LogoutButton() {
  const router = useRouter();
  const { drafts, projectDrafts, projectUploads, clear } = useAdminState();
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useFeedback("error", "admin-logout");
  async function logout() {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      clear();
      toast.dismiss();
      toast.success("از حساب مدیریت خارج شدید.", { id: "admin-session", title: "خروج موفق" });
      router.replace("/admin/login");
      router.refresh();
    } catch { setError("خروج انجام نشد. دوباره تلاش کنید."); setPending(false); }
  }
  return <div><button type="button" onClick={() => { if ([...Object.values(drafts), ...Object.values(projectDrafts)].some(draft => draft.unsaved) || Object.values(projectUploads).some(Boolean)) dialog.current?.showModal(); else void logout(); }} disabled={pending} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs text-muted transition-colors hover:bg-white/5 hover:text-white disabled:cursor-wait disabled:opacity-50">{pending ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <LogOut size={16} aria-hidden="true" />}خروج</button>{error && <p className="text-xs text-rose-300" role="alert">{error}</p>}<dialog ref={dialog} aria-labelledby="logout-title" aria-describedby="logout-description" className="fixed inset-0 m-auto w-[min(calc(100%-2rem),28rem)] rounded-3xl border border-white/15 bg-panel p-6 text-white backdrop:bg-black/75"><h2 id="logout-title" className="text-xl font-bold">تغییرات ذخیره نشده</h2><p id="logout-description" className="mt-4 text-sm leading-8 text-muted">با خروج، پیش‌نویس‌هایی که ذخیره نکرده‌اید کنار گذاشته می‌شوند.</p><div className="mt-6 flex flex-wrap gap-3"><Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>ادامهٔ ویرایش</Button><Button type="button" onClick={() => { dialog.current?.close(); void logout(); }}>خروج و کنارگذاشتن پیش‌نویس‌ها</Button></div></dialog></div>;
}

export function VerifyMailButton() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  async function verify() {
    if (pending) return;
    setPending(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/mail/verify", { method: "POST" });
      const data = await response.json();
      const message = response.ok ? "اتصال و اطلاعات ورود ایمیل معتبر است." : data.error || "بررسی اتصال ایمیل انجام نشد.";
      setResult({ ok: response.ok, message });
      toast[response.ok ? "success" : "error"](message, { id: "mail-verify", announce: false });
    } catch { const message = "ارتباط برقرار نشد. دوباره تلاش کنید."; setResult({ ok: false, message }); toast.error(message, { id: "mail-verify", announce: false }); }
    finally { setPending(false); }
  }
  return <div><Button type="button" variant="secondary" onClick={verify} loading={pending} disabled={pending} icon={<MailCheck size={17} aria-hidden="true" />}>{pending ? "در حال بررسی…" : "بررسی اتصال ایمیل"}</Button><div className="mt-4 min-h-7" aria-live="polite">{result && <p className={`text-sm leading-7 ${result.ok ? "text-emerald-300" : "text-rose-300"}`}>{result.message}</p>}</div></div>;
}
