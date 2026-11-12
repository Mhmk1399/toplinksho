import content from "@/content/home.fa.json";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/shared/PageStructuredData";
import { Hero } from "@/components/home/Hero";
import { AISolutions } from "@/components/home/AISolutions";
import { ConsultationSection } from "@/components/shared/ConsultationSection";
import { Process } from "@/components/home/Process";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { HomeContact } from "@/components/home/HomeContact";

export const metadata = pageMetadata("/");

export default function Home() {
  return <main id="main-content">
    <PageStructuredData path="/" />
    <Hero />
    <AISolutions />
    <ConsultationSection content={content.consultation} compact />
    <Process />
    <HomeFAQ />
    <HomeContact />
  </main>;
}
