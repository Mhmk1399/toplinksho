import { ArrowLeft, BarChart2, Layers3, Search, Smartphone } from "lucide-react";
import { ArticleCard } from "@/components/shared/ContentCards";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

const articles = [
  { title: "۱۰ راهکار افزایش تعامل در اینستاگرام", excerpt: "روش‌های عملی برای ساختن یک جامعه فعال و وفادار در شبکه‌های اجتماعی.", category: "شبکه‌های اجتماعی", date: "۱۸ مرداد ۱۴۰۵", icon: Smartphone, visual: "social" },
  { title: "نکات طلایی برای بهینه‌سازی کمپین‌های Google Ads", excerpt: "چطور بودجه تبلیغات را هوشمندانه‌تر خرج کنیم و بازده بیشتری بگیریم.", category: "تبلیغات گوگل", date: "۱۲ مرداد ۱۴۰۵", icon: BarChart2, visual: "ads" },
  { title: "چگونه یک برند ماندگار بسازیم؟", excerpt: "از استراتژی تا هویت بصری؛ مسیر تبدیل شدن به یک نام به‌یادماندنی.", category: "برندینگ", date: "۴ مرداد ۱۴۰۵", icon: Layers3, visual: "brand" },
  { title: "ویژگی‌های یک سایت موفق در سال 2026", excerpt: "اصول تجربه کاربری، سرعت و سئویی که وب‌سایت شما به آن‌ها نیاز دارد.", category: "طراحی سایت", date: "۲۸ تیر ۱۴۰۵", icon: Search, visual: "web" },
];

export function Blog() {
  return (
    <section className="relative py-32 max-md:py-20" id="blog"><Container>
      <div className="flex items-end justify-between gap-8 max-sm:items-start"><SectionHeader eyebrow="بینش و تجربه" title="آخرین مقالات" description="جدیدترین مطالب و آموزش‌های دیجیتال مارکتینگ" /><Button className="max-sm:hidden" href="#" variant="ghost" icon={<ArrowLeft size={18} />}>مشاهده همه مقالات</Button></div>
      <div className="mt-14 grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-md:grid-cols-1">{articles.map((article) => <ArticleCard key={article.title} {...article} />)}</div>
    </Container></section>
  );
}
