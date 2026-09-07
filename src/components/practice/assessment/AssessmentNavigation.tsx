"use client";

interface AssessmentNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function AssessmentNavigation({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
}: AssessmentNavigationProps) {
  const isFirst = currentQuestion === 0;
  const isLast = currentQuestion === totalQuestions - 1;

  return (
    <div className="mt-8 flex items-center justify-between">

      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirst}
        className="rounded-lg border px-5 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      <span className="text-sm text-gray-500">
        {currentQuestion + 1} / {totalQuestions}
      </span>

      {!isLast ? (
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Next
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
        >
          Submit Assessment
        </button>
      )}

    </div>
  );
}