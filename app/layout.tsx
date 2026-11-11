import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
export const metadata:Metadata={title:{default:"تاپ لینک شو | استراتژی، خلاقیت و رشد دیجیتال",template:"%s | تاپ لینک شو"},description:"راهکارهای طراحی سایت، برندینگ، شبکه‌های اجتماعی و کمپین‌های تبلیغاتی تاپ لینک شو. مسیر دیجیتال کسب‌وکارتان را با یک گفت‌وگو شروع کنید.",robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body><a className="skip-link" href="#main-content">رفتن به محتوای اصلی</a><Navbar/>{children}<Footer/></body></html>}
