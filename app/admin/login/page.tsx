import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Inbox, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/server/auth";

export const metadata: Metadata = { title: "ورود مدیریت" };
export const dynamic = "force-dynamic";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: requested } = await searchParams;
  const next =
    typeof requested === "string" &&
    /^\/admin(?:\/settings|\/requests\/[\da-f-]{36})?(?:\?[^#]*)?$/.test(
      requested,
    )
      ? requested
      : "/admin";
  if (await getAdminSession()) redirect(next);
  return (
    <main id="main-content" className="grid min-h-dvh items-center py-12">
      <Container>
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <Brand />
            <span className="mt-12 mb-5 flex size-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/5 text-accent">
              <Inbox size={24} aria-hidden="true" />
            </span>
            <h1 className="text-4xl leading-[1.7] font-extrabold">
              هر گفت‌وگو،
              <br />
              <span className="gradient-text">شروع یک همکاری.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-8 text-muted">
              درخواست‌های مشاوره، پیگیری‌ها و یادداشت‌های تیم را در یک جای مشخص
              مدیریت کنید.
            </p>
            <p className="mt-8 flex items-center gap-2 text-xs text-muted">
              <ShieldCheck size={16} aria-hidden="true" />
              ویژهٔ مدیریت تاپ لینک شو
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-panel p-6 sm:p-9">
            <h2 className="mb-2 text-2xl font-semibold">ورود به مدیریت</h2>
            <p className="mb-8 text-sm leading-7 text-muted">
              با ایمیل و رمز عبور مدیریت وارد شوید.
            </p>
            <LoginForm next={next} />
          </div>
        </div>
      </Container>
    </main>
  );
}
