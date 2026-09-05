import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "تاپ لینک شو | آژانس دیجیتال مارکتینگ",
  description:
    "راهکارهای خلاقانه دیجیتال مارکتینگ، طراحی سایت، برندینگ و تبلیغات برای رشد کسب‌وکار شما.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className="antialiased"
    >
      <body>{children}</body>
    </html>
  );
}
