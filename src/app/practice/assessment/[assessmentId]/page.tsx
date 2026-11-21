import Link from "next/link";
import { notFound } from "next/navigation";

import { getAssessmentById } from "@/lib/assessment/assessmentService";

// Single source of truth for assessment metadata.

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
    <main className="mx-auto max-w-5xl p-8">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold">
          {assessment.title}
        </h1>

        <p className="mt-4 text-gray-600">
          {assessment.description}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="font-medium">Difficulty</p>
            <p>{assessment.difficulty}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="font-medium">Duration</p>
            <p>{assessment.duration} Minutes</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="font-medium">Questions</p>
            <p>{assessment.questions}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="font-medium">Passing Marks</p>
            <p>{assessment.passingMarks}%</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="font-medium">Total Marks</p>
            <p>{assessment.totalMarks}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-semibold">
            Topics Covered
          </h2>

          <div className="flex flex-wrap gap-3">
            {assessment.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <Link
            href={`/practice/assessment/start/${assessment.id}`}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Start Assessment
          </Link>

          <Link
            href="/practice/assessment"
            className="rounded-lg border px-6 py-3 hover:bg-gray-100"
          >
            Back
          </Link>
        </div>
      </div>
    </main>
  );
}