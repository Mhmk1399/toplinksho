"use client";
import { Button } from "@/components/ui/Button";
export default function PortfolioError({ reset }: { reset: () => void }) { return <main id="main-content" className="mx-auto min-h-dvh max-w-3xl px-6 pb-20 pt-40"><h1 className="text-2xl font-bold">دریافت پروژه‌ها کامل نشد.</h1><p className="my-6 text-sm leading-8 text-muted">ارتباط با سرور موقتاً برقرار نیست. برای دریافت دوباره تلاش کنید.</p><Button onClick={reset}>تلاش دوباره</Button></main>; }
