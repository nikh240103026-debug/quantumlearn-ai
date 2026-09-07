interface AssessmentStatsProps {
  totalAssessments: number;
  totalQuestions: number;
  totalDuration: number;
}

export default function AssessmentStats({
  totalAssessments,
  totalQuestions,
  totalDuration,
}: AssessmentStatsProps) {
  const stats = [
    {
      label: "Assessments",
      value: totalAssessments,
    },
    {
      label: "Questions",
      value: totalQuestions,
    },
    {
      label: "Duration",
      value: `${totalDuration} min`,
    },
  ];

  return (
    <div className="mb-8 grid gap-6 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border bg-white p-6 shadow-sm"
        >
          <p className="text-sm text-gray-500">
            {stat.label}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stat.value}
          </h2>
        </div>
      ))}
    </div>
  );
}