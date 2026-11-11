import { PageHero } from "@/components/shared/PageHero";

export function Hero() {
  return <PageHero
    eyebrow="آژانس دیجیتال مارکتینگ تاپ لینک شو"
    title={<>دیده شوید.<br />متفاوت بمانید.<br /><span className="gradient-text">رشد کنید.</span></>}
    description={<>از طراحی سایت و برندینگ تا شبکه‌های اجتماعی؛<br />مسیر رشد دیجیتال کسب‌وکارتان را با هم می‌سازیم.</>}
    image="/images/hero-home.webp"
    imageAlt="موشک و کرهٔ دیجیتال؛ تصویر مفهومی رشد کسب‌وکار"
    note="رشد، اتفاقی نیست."
    detail="استراتژی روشن. اجرای هماهنگ."
    coordinate="BUILT FOR YOUR NEXT CHAPTER"
    primary={{ label: "مشاوره رایگان", href: "#consultation" }}
    secondary={{ label: "مشاهده خدمات", href: "/services" }}
    footnote="یک مسیر یکپارچه؛ از ایده تا اجرا و بهینه‌سازی"
  />;
}
