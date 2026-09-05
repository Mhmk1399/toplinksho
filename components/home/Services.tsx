import { Globe2, Megaphone, MousePointerClick, Share2, Shapes } from "lucide-react";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { ServiceCard } from "@/components/shared/ContentCards";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

const services = [
  { icon: MousePointerClick, title: "مشاوره و کمپین‌های تبلیغاتی", description: "استراتژی و اجرای کمپین‌های موثر در دیجیتال مارکتینگ", color: "pink" },
  { icon: Share2, title: "شبکه‌های اجتماعی", description: "مدیریت و رشد شبکه‌های اجتماعی برند شما", color: "purple" },
  { icon: Shapes, title: "تبلیغات و برندینگ", description: "کمپین‌های هدفمند و برند‌سازی اثربخش", color: "blue" },
  { icon: Globe2, title: "طراحی سایت و توسعه", description: "طراحی وب‌سایت‌های مدرن، سریع و کاربرپسند", color: "cyan" },
  { icon: Megaphone, title: "تبلیغات گوگل", label: "Google Ads", description: "افزایش فروش و جذب مشتری هدفمند در گوگل", color: "rose" },
];

export function Services() {
  return (
    <section className="relative py-32 max-md:py-20" id="services">
      <AmbientBackground variant="service" />
      <Container>
        <SectionHeader eyebrow="آنچه انجام می‌دهیم" title="خدمات ما" description="راهکارهای جامع دیجیتال مارکتینگ برای رشد کسب و کار شما" />
        <div className="mt-14 grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {services.map((service, index) => <ServiceCard key={service.title} {...service} number={index + 1} />)}
        </div>
      </Container>
    </section>
  );
}
