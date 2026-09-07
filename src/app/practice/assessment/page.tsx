import AssessmentGrid from "@/components/practice/assessment/AssessmentGrid";
import AssessmentStats from "@/components/practice/assessment/AssessmentStats";

import {
  getAllAssessments,
  getTotalAssessmentCount,
  getTotalDuration,
  getTotalQuestions,
} from "@/lib/assessment/assessmentService";

export default function AssessmentPage() {
  const assessments = getAllAssessments();

  return (
    <main>

      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Assessments
        </h1>

        <p className="mt-2 text-gray-600">
          Evaluate your understanding through structured assessments.
        </p>
      </div>

      <AssessmentStats
        totalAssessments={getTotalAssessmentCount()}
        totalQuestions={getTotalQuestions()}
        totalDuration={getTotalDuration()}
      />

      <AssessmentGrid
        assessments={assessments}
      />

    </main>
  );
}