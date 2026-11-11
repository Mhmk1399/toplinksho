import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/shared/PageStructuredData";
import { Blog } from "@/components/home/Blog";
import { CTASection } from "@/components/home/CTASection";
import { Hero } from "@/components/home/Hero";
import { Portfolio } from "@/components/home/Portfolio";
import { Services } from "@/components/home/Services";
import { WhyUs } from "@/components/home/WhyUs";
import { Growth } from "@/components/home/Growth";
import { Expertise } from "@/components/home/Expertise";
import { Testimonials } from "@/components/home/Testimonials";
import { TeamExpertise } from "@/components/shared/TeamExpertise";
import { ConsultationSection } from "@/components/shared/ConsultationSection";

export const metadata = pageMetadata("/");

export default function Home() {
  return <main id="main-content">
    <PageStructuredData path="/" />
    <Hero />
    <ConsultationSection />
    <Services />
    <Growth />
    <Expertise />
    <WhyUs />
    <Testimonials />
    <Portfolio />
    <TeamExpertise />
    <Blog />
    <ConsultationSection id="consultation-final" closing />
    <CTASection />
  </main>;
}
