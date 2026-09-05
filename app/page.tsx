import { Blog } from "@/components/home/Blog";
import { CTASection } from "@/components/home/CTASection";
import { Hero } from "@/components/home/Hero";
import { Portfolio } from "@/components/home/Portfolio";
import { Services } from "@/components/home/Services";
import { Statistics } from "@/components/home/Statistics";
import { WhyUs } from "@/components/home/WhyUs";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { FloatingContact } from "@/components/shared/FloatingContact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <WhyUs />
        <Statistics />
        <Portfolio />
        <CTASection />
        <Blog />
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
