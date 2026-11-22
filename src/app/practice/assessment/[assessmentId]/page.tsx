import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAssessmentById } from "@/lib/assessment/assessmentService";
import { PaperPage } from "@/components/exam/PaperPage";
import { AssessmentBriefing } from "@/components/exam/AssessmentBriefing";

// Single source of truth for assessment metadata.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}): Promise<Metadata> {
  const { assessmentId } = await params;
  const assessment = getAssessmentById(assessmentId);
  return { title: assessment ? `${assessment.title} — Instructions` : "Assessment" };
}

export default async function AssessmentDetails({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;

  const assessment = getAssessmentById(assessmentId);

  if (!assessment) {
    notFound();
  }

  return (
    <PaperPage
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Practice", href: "/practice" },
        { label: "Assessments", href: "/practice/assessment" },
        { label: assessment.title.replace(/ Assessment$/, "") },
      ]}
      kicker={`${assessment.difficulty} · ${assessment.duration} minutes`}
      title={assessment.title.replace(/ Assessment$/, "")}
      lead={assessment.description}
    >
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AssessmentBriefing assessment={assessment} />
      </section>
    </PaperPage>
  );
}
