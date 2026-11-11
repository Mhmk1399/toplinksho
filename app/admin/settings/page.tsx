import type { Metadata } from "next";
import { CheckCircle2, AlertCircle, Mail, LockKeyhole } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { VerifyMailButton } from "@/components/admin/AdminActions";
import { requireAdmin } from "@/lib/server/auth";
import { mailConfigured } from "@/lib/server/mail";

export const metadata: Metadata = { title: "تنظیمات ارتباط‌ها" };
export const dynamic = "force-dynamic";
export default async function SettingsPage() {
  const admin = await requireAdmin("/admin/settings");
  const configured = mailConfigured();
  return (
    <AdminShell email={admin.email} active="settings">
      <div className="mb-8">
        <p className="mb-3 text-xs text-accent">مدیریت ارتباط‌ها</p>
        <h1 className="text-3xl font-bold">تنظیمات</h1>
        <p className="mt-3 text-sm leading-8 text-muted">
          وضعیت ایمیل و دسترسی مدیریت را بررسی کنید.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-panel/70 p-7">
          <Mail size={26} className="mb-6 text-accent" aria-hidden="true" />
          <h2 className="text-xl font-semibold">اعلان ایمیلی درخواست‌ها</h2>
          <p className="mt-4 text-sm leading-8 text-muted">
            هر درخواست ابتدا در پنل ذخیره می‌شود. ایمیل، اعلان ثبت آن را برای
            مسئول پیگیری می‌فرستد.
          </p>
          <p
            className={`mt-5 flex items-center gap-2 text-sm ${configured ? "text-emerald-300" : "text-amber-200"}`}
          >
            {configured ? (
              <CheckCircle2 size={18} aria-hidden="true" />
            ) : (
              <AlertCircle size={18} aria-hidden="true" />
            )}
            {configured
              ? "اطلاعات اتصال وارد شده است."
              : "اطلاعات اتصال ایمیل هنوز کامل نیست."}
          </p>
          {configured && (
            <dl className="my-6 space-y-3 border-y border-white/10 py-5 text-xs">
              <div className="flex flex-wrap justify-between gap-3">
                <dt className="text-muted">میزبان</dt>
                <dd dir="ltr">{process.env.SMTP_HOST}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <dt className="text-muted">ایمیل دریافت‌کننده</dt>
                <dd dir="ltr" className="break-all">
                  {process.env.LEADS_EMAIL}
                </dd>
              </div>
            </dl>
          )}
          <div className="mt-6">
            <VerifyMailButton />
          </div>
        </section>
        <section className="rounded-3xl border border-white/10 bg-panel/70 p-7">
          <LockKeyhole
            size={26}
            className="mb-6 text-accent"
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold">دسترسی مدیریت</h2>
          <p className="mt-4 text-sm leading-8 text-muted">
            این پنل ویژهٔ حساب مدیریت است. اطلاعات ورود و تنظیمات ایمیل در محیط
            سرور نگهداری می‌شوند و در سایت عمومی نمایش داده نمی‌شوند.
          </p>
          <p
            className="mt-6 rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-sm break-all"
            dir="ltr"
          >
            {admin.email}
          </p>
          <p className="mt-5 text-xs leading-8 text-muted">
            با تغییر اطلاعات ورود مدیریت در سرور، نشست‌های قبلی از اعتبار
            می‌افتند. برای راه‌اندازی و تغییر تنظیمات، راهنمای پروژه را دنبال
            کنید.
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
