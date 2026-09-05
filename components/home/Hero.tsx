import Image from "next/image";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="relative flex min-h-[780px] items-center overflow-hidden pb-24 pt-40 max-md:min-h-0 max-md:pb-20 max-md:pt-32" id="top">
      <AmbientBackground variant="hero" />
      <Container className="grid grid-cols-2 items-center gap-12 max-md:grid-cols-1">
        <div className="relative z-10 max-w-[650px] max-md:text-center">
          <span className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#d8caff] before:h-px before:w-5 before:bg-[#ff3d9a] before:shadow-[0_0_12px_#f02b78]">
            آژانس دیجیتال مارکتینگ
          </span>
          <h1 className="text-[clamp(42px,5.4vw,76px)] leading-[1.32] font-[850] tracking-[-.02em]">
            راهکارهای خلاقانه
            <br />
            برای <span className="bg-[linear-gradient(135deg,#3157ff,#8b3dff_45%,#f02b78)] bg-clip-text text-transparent">رشد برند شما</span>
          </h1>
          <p className="mt-6 max-w-[610px] text-lg leading-9 text-white/65 max-md:mx-auto max-md:text-base">
            ما در تاپ لینک شو با ترکیب استراتژی، خلاقیت و تکنولوژی، کمپین‌هایی
            طراحی می‌کنیم که برند شما را در ذهن مخاطب ماندگار می‌کند.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 max-md:justify-center">
            <Button href="#services" size="lg">
              مشاهده خدمات
            </Button>
            <Button href="#contact" size="lg" variant="secondary">
              مشاوره رایگان
            </Button>
          </div>
        </div>

        <div className="relative min-h-[540px] max-md:order-first max-md:min-h-[340px]">
          <div className="absolute inset-0 drop-shadow-[0_35px_55px_rgba(49,87,255,.25)] before:absolute before:inset-[18%] before:rounded-full before:bg-violet-600/20 before:blur-[70px]">
            <Image
              src="/images/toplinksho-hero-3d.png"
              alt="موشک سفید در کنار کره دیجیتال، نماد رشد برند"
              fill
              priority
              sizes="(max-width: 768px) 90vw, 50vw"
              className="object-contain"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
