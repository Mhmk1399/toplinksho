import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { siteOrigin } from "@/lib/seo";
import "lenis/dist/lenis.css";
import "./globals.css";
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0c14", colorScheme: "dark" };
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  applicationName: "TopLinkSho",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "تاپ لینک شو", statusBarStyle: "black-translucent" },
  icons: { apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }] },
  formatDetection: { telephone: false },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined, other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined },
  title: {
    default: "تاپ لینک شو | استراتژی، خلاقیت و رشد دیجیتال",
    template: "%s | تاپ لینک شو",
  },
  description:
    "راهکارهای طراحی سایت، برندینگ، شبکه‌های اجتماعی و کمپین‌های تبلیغاتی تاپ لینک شو. مسیر دیجیتال کسب‌وکارتان را با یک گفت‌وگو شروع کنید.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <a className="skip-link" href="#main-content">
          رفتن به محتوای اصلی
        </a>
        <SiteFrame header={<Navbar />} footer={<Footer />}>
          {children}
        </SiteFrame>
      </body>
    </html>
  );
}
