import AssessmentCard from "./AssessmentCard";

export interface Assessment {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  questions: number;
}

interface AssessmentGridProps {
  assessments: Assessment[];
}

export default function AssessmentGrid({
  assessments,
}: AssessmentGridProps) {
  if (assessments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <h2 className="text-xl font-semibold">
          No Assessments Available
        </h2>

        <p className="mt-2 text-gray-500">
          New assessments will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {assessments.map((assessment) => (
        <AssessmentCard
          key={assessment.id}
          id={assessment.id}
          title={assessment.title}
          description={assessment.description}
          difficulty={assessment.difficulty}
          duration={assessment.duration}
          questions={assessment.questions}
        />
      ))}
    </div>
  );
}