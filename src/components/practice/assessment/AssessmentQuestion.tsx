"use client";

import type { AssessmentQuestion } from "@/types/assessmentQuestion";

interface AssessmentQuestionProps {
  question: AssessmentQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOption?: string;
  onSelectOption: (
    questionId: string,
    optionId: string
  ) => void;
}

export default function AssessmentQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
}: AssessmentQuestionProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-medium text-blue-600">
          Question {questionNumber} of {totalQuestions}
        </span>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
          {question.marks} Marks
        </span>
      </div>

      <h2 className="text-xl font-semibold">
        {question.question}
      </h2>

      <div className="mt-8 space-y-4">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() =>
              onSelectOption(question.id, option.id)
            }
            className={`w-full rounded-lg border p-4 text-left transition-all ${
              selectedOption === option.id
                ? "border-blue-600 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
          >
            <span className="font-semibold">
              {option.id}.
            </span>{" "}
            {option.text}
          </button>
        ))}
      </div>

    </div>
  );
}