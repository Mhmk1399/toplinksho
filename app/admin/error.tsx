"use client";
import { Button } from "@/components/ui/Button";
export default function AdminError({ reset }: { reset: () => void }) {
  return <main id="main-content" className="grid min-h-dvh place-items-center px-6"><div className="max-w-lg rounded-3xl border border-white/10 bg-panel p-8 text-center"><h1 className="text-2xl font-bold">دریافت اطلاعات انجام نشد.</h1><p className="mt-4 mb-7 text-sm leading-8 text-muted">ارتباط یا دسترسی به اطلاعات را بررسی کنید و دوباره تلاش کنید.</p><Button type="button" onClick={reset}>تلاش دوباره</Button></div></main>;
}
