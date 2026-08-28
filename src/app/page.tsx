import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { LearningJourney } from "@/components/landing/LearningJourney";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { QuantumLabPreview } from "@/components/landing/QuantumLabPreview";
import { AITutorPreview } from "@/components/landing/AITutorPreview";
import { LearningRoadmap } from "@/components/landing/LearningRoadmap";
import { ProgressPreview } from "@/components/landing/ProgressPreview";
import { ResourcesSection } from "@/components/landing/ResourcesSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <ProblemSection />
      <LearningJourney />
      <FeaturesSection />
      <QuantumLabPreview />
      <AITutorPreview />
      <LearningRoadmap />
      <ProgressPreview />
      <ResourcesSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}