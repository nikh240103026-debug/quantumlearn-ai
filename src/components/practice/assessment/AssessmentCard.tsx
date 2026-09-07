import Link from "next/link";

export interface AssessmentCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  questions: number;
}

export default function AssessmentCard({
  id,
  title,
  description,
  difficulty,
  duration,
  questions,
}: AssessmentCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="mt-3 text-sm text-gray-600">
        {description}
      </p>

      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Difficulty</span>
          <span>{difficulty}</span>
        </div>

        <div className="flex justify-between">
          <span>Duration</span>
          <span>{duration} min</span>
        </div>

        <div className="flex justify-between">
          <span>Questions</span>
          <span>{questions}</span>
        </div>
      </div>

      <Link
        href={`/practice/assessment/${id}`}
        className="mt-6 inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        View Assessment
      </Link>
    </div>
  );
}