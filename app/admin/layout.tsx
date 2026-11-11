import type { Metadata } from "next";
import { AdminState } from "@/components/admin/AdminState";

export const metadata: Metadata = { title: { default: "مدیریت ارتباط‌ها", template: "%s | مدیریت تاپ لینک شو" }, robots: { index: false, follow: false, noarchive: true } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <AdminState>{children}</AdminState>; }
