import Link from "next/link";
import { BookOpen } from "lucide-react";
import { PublicFrame } from "@/components/content/PublicFrame";
import {
  EditorialSections,
  FaqBlock,
  LinkCards,
  PageCTA,
} from "@/components/content/ContentBlocks";
import { Container } from "@/components/ui/Container";
import { ConsultationSection } from "@/components/shared/ConsultationSection";
import { ContactMap } from "@/components/shared/ContactMap";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { mainPages } from "@/lib/page-registry";
import type { FAQ } from "@/lib/page-registry";
import { PageOverview } from "@/components/content/PageOverview";
import type { EditorialCopy } from "@/lib/page-copy";

export type MainPageData = EditorialCopy & {
  path: string;
  kind: string;
  title: string;
  description: string;
  image: string;
  eyebrow: string;
  intro: string;
  sections: { title: string; text: string; items?: string[]; price?: string }[];
  faq: FAQ[];
  emptyTitle?: string;
  emptyDescription?: string;
  priceDisplay?: string;
  pricingPolicy?: string;
  consultationDescription?: string;
};
export function MainPage({ page }: { page: MainPageData }) {
  const anchor =
    page.kind === "cases"
      ? "case-list"
      : page.kind === "blog"
        ? "articles"
        : page.kind === "faq"
          ? "questions"
          : page.kind === "contact"
            ? "consultation"
            : page.kind === "pricing"
              ? "plans"
              : "overview";
  const cases = mainPages
    .filter((item) => item.kind === "case")
    .map((item) => ({
      path: item.path,
      title: item.title,
      description: item.description,
    }));
  return (
    <PublicFrame
      page={page}
      secondary={{
        label:
          page.kind === "cases"
            ? "بررسی پیشنهادها"
            : page.kind === "blog"
              ? "نوشته‌ها و راهنماها"
              : page.kind === "contact"
                ? "فرم و راه‌های ارتباطی"
                : "اطلاعات بیشتر",
        href: "#" + anchor,
      }}
    >
      <PageOverview page={page} />
      {page.kind === "contact" ? (
        <>
          <ConsultationSection
            content={{
              eyebrow: "مشاورهٔ رایگان",
              title: "از نیازتان بگویید.",
              description: page.consultationDescription || page.intro,
              formTitle: "در چه زمینه‌ای همراهتان باشیم؟",
            }}
          />
          <section id="location" className="pb-14">
            <Container>
              <ContactMap />
            </Container>
          </section>
        </>
      ) : page.kind === "pricing" ? (
        <>
          <section id="plans" className="home-section scroll-mt-32">
            <Container>
              <CardGrid label="بسته‌های خدمات" mobileScroll>{page.sections.map((plan,index)=><FeatureCard key={plan.title} title={plan.title} description={plan.text}
  artworkKey={"section:" + page.path + ":" + index} visual={(["design","growth","automation"] as const)[index%3]} headingAs="h2" category={["طراحی","رشد","هوشمندسازی"][index%3]}
  href="#consultation" linkLabel="درخواست برآورد" footer={<p className="text-sm font-semibold text-accent">{plan.price||page.priceDisplay}</p>}>
  <ul className="space-y-3 text-sm leading-7">{plan.items?.map(item=><li key={item} className="border-t border-line pt-3">{item}</li>)}</ul>
 </FeatureCard>)}</CardGrid>
              <p className="mt-5 max-w-4xl text-xs leading-7 text-muted">
                {page.pricingPolicy}
              </p>
            </Container>
          </section>
          <ConsultationSection
            compact
            content={{
              eyebrow: "برآورد متناسب با شما",
              title: "دربارهٔ دامنهٔ پروژه صحبت کنیم.",
              description:
                page.consultationDescription || "امکانات ضروری، وضعیت محتوا و اتصال‌های مورد نیاز را بنویسید تا مسیر بررسی روشن شود.",
              formTitle: "نیاز پروژه را توضیح دهید",
            }}
          />
        </>
      ) : page.kind === "cases" ? (
        <section id="case-list" className="home-section scroll-mt-32">
          <Container>
            <p className="mb-6 inline-block rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-xs leading-6 text-accent">
              نوع محتوا: پیشنهاد سامانه و مطالعهٔ مسئله
            </p>
            <LinkCards items={cases} headingAs="h2" />
          </Container>
        </section>
      ) : page.kind === "blog" ? (
        <section id="articles" className="home-section scroll-mt-32">
          <Container>
            <div className="neon-surface mx-auto max-w-3xl p-7 text-center sm:p-10">
              <BookOpen
                size={34}
                className="mx-auto mb-5 text-accent"
                aria-hidden="true"
              />
              <h2 className="home-title font-bold">{page.emptyTitle}</h2>
              <p className="mt-4 text-sm leading-8 text-muted">
                {page.emptyDescription}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/services"
                  className="inline-flex min-h-12 items-center rounded-xl border border-line px-5 text-sm text-accent transition-colors hover:border-accent/50"
                >
                  راهنمای خدمات
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex min-h-12 items-center rounded-xl border border-line px-5 text-sm text-accent transition-colors hover:border-accent/50"
                >
                  پرسش‌های رایج
                </Link>
              </div>
            </div>
          </Container>
        </section>
      ) : page.kind !== "faq" ? (
        <EditorialSections sections={page.sections} id="approach" artworkContext={page.path} />
      ) : null}
      <FaqBlock
        items={page.faq}
        id={page.kind === "faq" ? "questions" : "faq"}
      />
      {!["contact", "pricing"].includes(page.kind) && <PageCTA />}
    </PublicFrame>
  );
}
