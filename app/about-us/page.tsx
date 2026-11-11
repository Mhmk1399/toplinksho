import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/shared/PageStructuredData";
import { Check, Layers3, UsersRound, Headphones, Compass } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { TeamExpertise } from "@/components/shared/TeamExpertise";
import { ConsultationSection } from "@/components/shared/ConsultationSection";

const reasons = [
  {
    icon: Layers3,
    title: "یکپارچگی خدمات",
    text: "خدمات دیجیتال مارکتینگ از ایده و برنامه‌ریزی تا طراحی و اجرا در یک مسیر هماهنگ پیش می‌روند.",
  },
  {
    icon: UsersRound,
    title: "تیم متخصص",
    text: "هر بخش از پروژه به متخصص همان حوزه سپرده می‌شود؛ با همکاری نزدیک میان تیم‌های استراتژی، طراحی و محتوا.",
  },
  {
    icon: Headphones,
    title: "همراهی و پشتیبانی",
    text: "گفت‌وگو با تیم در طول همکاری ادامه دارد تا پرسش‌ها، بازخوردها و نیازهای تازه به مسیر روشن بعدی برسند.",
  },
];

export const metadata = pageMetadata("/about-us");

export default function AboutPage() {
  return (
    <main id="main-content">
    <PageStructuredData path="/about-us" />
      <PageHero
        eyebrow="آنچه دربارهٔ تاپ لینک شو باید بدانید"
        title={
          <>
            کنار هم،
           
            برای رشد
            <br />
            <span className="gradient-text">برند شما.</span>
          </>
        }
        description={
          <>
            ترکیبی از استراتژی، خلاقیت و تخصص؛
            <br />
            برای ساختن حضوری که برند شما را بهتر معرفی کند.
          </>
        }
        image="/images/hero-about.webp"
        imageAlt="کرهٔ دیجیتال و حلقه‌های به‌هم‌پیوستهٔ شیشه‌ای با رنگ‌های لوگوی تاپ لینک شو"
        note="یک تیم، یک مسیر."
        detail="ایده‌های متفاوت. اجرای هماهنگ."
        coordinate="PEOPLE BEHIND THE PROGRESS"
        secondary={{ label: "داستان ما", href: "#story" }}
        footnote="از شناخت کسب‌وکار شما تا ساختن یک تجربهٔ کامل"
      />
      <section className="section-space" id="story">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
            <div>
              <span className="eyebrow">از کجا شروع شد</span>
              <h2 className="text-4xl leading-[1.65] font-extrabold">
                از یک دفتر تبلیغاتی،
                <br />
                <span className="gradient-text">تا یک همراه دیجیتال.</span>
              </h2>
            </div>
            <div>
              <p className="text-base leading-10 text-muted">
                مسیر آژانس دیجیتال مارکتینگ تاپ لینک شو از بهار سال ۱۳۹۰، با یک
                دفتر تبلیغاتی در فضای دیجیتال آغاز شد. آنچه این مسیر را به هم
                پیوند می‌دهد، توجه به نیاز کسب‌وکار و ساختن ارتباطی روشن میان
                برند و مخاطب است.
              </p>
              <p className="mt-5 text-sm leading-9 text-muted">
                امروز طراحی سایت، هویت بصری، تولید محتوا و تبلیغات را در کنار هم
                می‌بینیم؛ چون تجربهٔ مخاطب از یک برند، حاصل مجموع همهٔ این
                نقطه‌های تماس است.
              </p>
            </div>
          </div>
          <div className="mt-12 grid gap-4 rounded-3xl border border-white/10 bg-panel/70 p-6 sm:grid-cols-2 sm:p-8">
            {[
              "استفاده از روش‌های به‌روز بازاریابی دیجیتال",
              "همکاری تیم‌های متخصص در حوزه‌های مکمل",
              "مشاوره بر اساس هدف و موقعیت کسب‌وکار",
              "پشتیبانی و ارتباط در مسیر همکاری",
              "بازنگری و بهبود مستمر خروجی‌ها",
            ].map((item) => (
              <p
                key={item}
                className="flex items-start gap-3 text-sm leading-8 text-white/85"
              >
                <Check
                  className="mt-2 shrink-0 text-accent"
                  size={16}
                  aria-hidden="true"
                />
                {item}
              </p>
            ))}
          </div>
        </Container>
      </section>
      <section className="section-space border-y border-white/5 bg-panel/30">
        <Container>
          <SectionIntro
            eyebrow="چرا تاپ لینک شو؟"
            title={
              <>
                چند تخصص؛
                <br />
                <span className="gradient-text">یک تصویر یکپارچه.</span>
              </>
            }
          />
          <div className="grid gap-5 md:grid-cols-3">
            {reasons.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-3xl border border-white/10 bg-ink/60 p-7"
              >
                <Icon
                  size={28}
                  strokeWidth={1.5}
                  className="mb-7 text-accent"
                  aria-hidden="true"
                />
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-4 text-sm leading-8 text-muted">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-accent/15 p-6">
            <Compass
              size={24}
              className="mt-1 shrink-0 text-accent"
              aria-hidden="true"
            />
            <p className="text-sm leading-8 text-muted">
              قبل از پیشنهاد راهکار، مسئله را می‌شناسیم. یک سایت، یک کمپین یا یک
              برنامهٔ محتوا زمانی معنا پیدا می‌کند که به هدف واقعی کسب‌وکار شما
              وصل باشد.
            </p>
          </div>
        </Container>
      </section>
      <TeamExpertise />
      <ConsultationSection />
    </main>
  );
}
