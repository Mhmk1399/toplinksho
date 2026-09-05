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
      className="scroll-pt-28 scroll-smooth bg-[#050817] antialiased"
    >
      <body className="m-0 overflow-x-hidden bg-[#050817] font-['Vazirmatn',Tahoma,sans-serif] text-right text-white selection:bg-[#f02b78]/40 selection:text-white [&_a]:[-webkit-tap-highlight-color:transparent] [&_a]:no-underline [&_button]:[-webkit-tap-highlight-color:transparent] [&_button]:font-inherit [&_button]:text-inherit [&_input]:font-inherit [&_select]:font-inherit [&_textarea]:font-inherit">{children}</body>
    </html>
  );
}
