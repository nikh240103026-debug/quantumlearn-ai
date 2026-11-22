import { Hero } from "@/components/landing/Hero";
import { TechMarquee } from "@/components/landing/TechMarquee";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CurriculumExplorer } from "@/components/landing/CurriculumExplorer";
import { SdkExport } from "@/components/landing/SdkExport";
import { TrustSection } from "@/components/landing/TrustSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="bg-[#05070d]">
      <Hero />
      <TechMarquee />
      <FeaturesSection />
      <HowItWorks />
      <CurriculumExplorer />
      <SdkExport />
      <TrustSection />
      <FaqSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
