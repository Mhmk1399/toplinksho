import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { Megaphone, Shapes, Share2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionIntro } from "@/components/shared/SectionIntro";

const cards = [
  { icon: Megaphone, title: "مشاوره و کمپین‌های تبلیغاتی", text: "مشاوره و برنامه‌ریزی تبلیغاتی برای شرکت‌ها و کلینیک‌ها؛ با شناخت مخاطب، تعیین پیام و طراحی مسیر اجرای کمپین.", href: "/services/campaigns" },
  { icon: Shapes, title: "تبلیغات و برندینگ", text: "برندینگ و تبلیغات در شبکه‌های اجتماعی، سایت، گوگل ادز و رسانه‌های محیطی؛ در چارچوب یک هویت و پیام هماهنگ.", href: "/services/branding" },
  { icon: Share2, title: "شبکه‌های اجتماعی", text: "از استراتژی و تولید محتوا تا مدیریت حضور برند، تبلیغات و طراحی کمپین در اینستاگرام، تلگرام و شبکه‌های مناسب مخاطب شما.", href: "/services/social-media" },
];

export function Services() {
  return <section className="section-space" id="services"><Container>
    <SectionIntro eyebrow="برند شدن سخت نیست!" title={<>ایده‌تان را به یک<br /><span className="gradient-text">برند دیدنی تبدیل کنیم.</span></>} description="حضور مؤثر دیجیتال، ترکیبی از شناخت مخاطب، محتوای درست و اجرای هماهنگ است. از راهکاری شروع کنید که به مسئلهٔ امروزتان نزدیک‌تر است." />
    <CardGrid label="خدمات تاپ لینک شو" mobileScroll>{cards.map(({icon:Icon,title,text,href})=><FeatureCard key={href} title={title} description={text} href={href} category="خدمات" icon={<Icon size={18} />} />)}</CardGrid>
  </Container></section>;
}
