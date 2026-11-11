import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpLeft, Inbox, Settings2 } from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { Container } from "@/components/ui/Container";
import { LogoutButton } from "@/components/admin/AdminActions";

export function AdminShell({ children, email, active = "inbox" }: { children: ReactNode; email: string; active?: "inbox" | "settings" }) {
  return <div className="min-h-dvh bg-ink">
    <header className="border-b border-white/10 bg-panel/60"><Container><div className="flex flex-wrap items-center justify-between gap-4 py-4"><div className="flex items-center gap-5"><Brand href="/admin" label="تاپ لینک شو، مدیریت درخواست‌ها" /><span className="border-r border-white/10 pr-5 text-sm text-muted">مدیریت ارتباط‌ها</span></div><div className="flex items-center gap-3"><Link href="/" target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 px-2 text-xs text-muted hover:text-white">مشاهدهٔ سایت<ArrowUpLeft size={15} aria-hidden="true" /></Link><LogoutButton /></div></div></Container></header>
    <Container><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-4"><nav className="flex gap-2" aria-label="ناوبری مدیریت"><Link href="/admin" aria-current={active === "inbox" ? "page" : undefined} className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm transition-colors hover:bg-white/5 ${active === "inbox" ? "bg-accent/10 text-accent" : "text-muted"}`}><Inbox size={17} aria-hidden="true" />درخواست‌ها</Link><Link href="/admin/settings" aria-current={active === "settings" ? "page" : undefined} className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm transition-colors hover:bg-white/5 ${active === "settings" ? "bg-accent/10 text-accent" : "text-muted"}`}><Settings2 size={17} aria-hidden="true" />تنظیمات</Link></nav><span className="max-w-full truncate text-[11px] text-muted" dir="ltr">{email}</span></div></Container>
    <main id="main-content" className="py-8 md:py-12"><Container>{children}</Container></main>
  </div>;
}
