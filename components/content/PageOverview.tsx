import { Container } from "@/components/ui/Container";
import { NarrativeCopy } from "@/components/content/NarrativeCopy";
import type { EditorialCopy } from "@/lib/page-copy";

export function PageOverview({ page }: { page: EditorialCopy & { intro?: string } }) {
  return <section id="overview" className="scroll-mt-32 py-7 sm:py-10" aria-labelledby="overview-title">
    <Container><div className="grid items-start gap-5 lg:grid-cols-[.6fr_1.4fr] lg:gap-12">
      <div><span className="eyebrow">انتخاب آگاهانه، شروع روشن</span><h2 id="overview-title" className="home-title font-extrabold">{page.overviewTitle || "مسیر مناسب کسب‌وکار شما"}</h2></div>
      <NarrativeCopy intro={page.intro} paragraphs={page.bodyParagraphs} />
    </div></Container>
  </section>;
}
