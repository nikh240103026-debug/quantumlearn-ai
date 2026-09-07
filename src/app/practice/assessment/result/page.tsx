"use client";

import { useSearchParams } from "next/navigation";

export default function AssessmentResultPage() {
  const searchParams = useSearchParams();

  const score = Number(searchParams.get("score") ?? 0);
  const totalMarks = Number(searchParams.get("totalMarks") ?? 0);
  const correct = Number(searchParams.get("correct") ?? 0);
  const wrong = Number(searchParams.get("wrong") ?? 0);
  const skipped = Number(searchParams.get("skipped") ?? 0);
  const accuracy = Number(searchParams.get("accuracy") ?? 0);
  const passed = searchParams.get("passed") === "true";

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="rounded-xl border bg-white p-8 shadow-sm">

        <h1 className="text-center text-4xl font-bold">
          Assessment Result
        </h1>

        <p
          className={`mt-4 text-center text-2xl font-bold ${
            passed ? "text-green-600" : "text-red-600"
          }`}
        >
          {passed ? "PASSED 🎉" : "FAILED"}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">

          <div className="rounded-lg border p-5">
            <p className="text-gray-500">
              Score
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {score} / {totalMarks}
            </h2>
          </div>

          <div className="rounded-lg border p-5">
            <p className="text-gray-500">
              Accuracy
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {accuracy}%
            </h2>
          </div>

          <div className="rounded-lg border p-5">
            <p className="text-gray-500">
              Correct Answers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {correct}
            </h2>
          </div>

          <div className="rounded-lg border p-5">
            <p className="text-gray-500">
              Wrong Answers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {wrong}
            </h2>
          </div>

          <div className="rounded-lg border p-5">
            <p className="text-gray-500">
              Skipped Questions
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {skipped}
            </h2>
          </div>

        </div>

      </div>
    </main>
  );
}