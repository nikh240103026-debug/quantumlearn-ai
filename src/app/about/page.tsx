import { AboutHero } from "@/components/about/AboutHero";
import { AboutPlatform } from "@/components/about/AboutPlatform";
import { AboutPurpose } from "@/components/about/AboutPurpose";
import { AboutCapabilities } from "@/components/about/AboutCapabilities";
import { AboutTechnology } from "@/components/about/AboutTechnology";
import { AboutCreator } from "@/components/about/AboutCreator";
import { AboutVision } from "@/components/about/AboutVision";
import { AboutCTA } from "@/components/about/AboutCTA";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f3] text-[#111318]">
      <AboutHero />
      <AboutPlatform />
      <AboutPurpose />
      <AboutCapabilities />
      <AboutTechnology />
      <AboutCreator />
      <AboutVision />
      <AboutCTA />
      <Footer />
    </main>
  );
}