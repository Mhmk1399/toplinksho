"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!email.trim() || !password) { setError("ایمیل و رمز عبور را وارد کنید."); event.currentTarget.querySelector<HTMLInputElement>(!email.trim() ? "#admin-email" : "#admin-password")?.focus(); return; }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), signal: AbortSignal.timeout(15000) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "ورود انجام نشد."); return; }
      router.replace(next);
      router.refresh();
    } catch { setError("ارتباط برقرار نشد. دوباره تلاش کنید."); }
    finally { setPending(false); }
  }
  return <form noValidate onSubmit={submit} className="grid gap-5" aria-label="ورود مدیریت" aria-busy={pending}>
    <Input id="admin-email" name="email" label="ایمیل مدیریت" type="email" autoComplete="username" dir="ltr" value={email} onChange={event => setEmail(event.target.value)} required disabled={pending} />
    <div className="relative"><Input id="admin-password" name="password" label="رمز عبور" type={show ? "text" : "password"} autoComplete="current-password" dir="ltr" value={password} onChange={event => setPassword(event.target.value)} required disabled={pending} maxLength={256} /><button type="button" aria-label={show ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"} aria-pressed={show} onClick={() => setShow(current => !current)} className="absolute top-8 right-1 grid size-11 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-white">{show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div>
    <Button type="submit" className="mt-2 w-full" loading={pending} disabled={pending} icon={!pending ? <ArrowLeft size={17} aria-hidden="true" /> : undefined}>{pending ? "در حال ورود…" : "ورود به پنل"}</Button>
    <div className="min-h-12" role="alert">{error && <p className="rounded-xl border border-rose-300/20 bg-rose-300/5 px-4 py-3 text-sm leading-7 text-rose-200">{error}</p>}</div>
  </form>;
}
