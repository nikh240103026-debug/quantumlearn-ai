import type { Metadata } from "next";
import { ResourcesExperience } from "@/components/resources/ResourcesExperience";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "The quantum vault: landmark papers, SDKs, playgrounds, core concepts and the milestones of quantum computing — plus your instructors' library.",
};

export default function ResourcesPage() {
  return <ResourcesExperience />;
}
