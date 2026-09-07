"use client";

interface QuestionPaletteProps {
  totalQuestions: number;
  currentQuestion: number;
  answers: Record<string, string>;
  questionIds: string[];
  onQuestionSelect: (index: number) => void;
}

export default function QuestionPalette({
  totalQuestions,
  currentQuestion,
  answers,
  questionIds,
  onQuestionSelect,
}: QuestionPaletteProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold">
        Question Palette
      </h2>

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const questionId = questionIds[index];
          const answered = !!answers[questionId];

          return (
            <button
              key={index}
              onClick={() => onQuestionSelect(index)}
              className={`h-11 w-11 rounded-lg border text-sm font-medium transition-all
              ${
                currentQuestion === index
                  ? "border-blue-600 bg-blue-600 text-white"
                  : answered
                  ? "border-green-500 bg-green-100 text-green-700"
                  : "hover:bg-gray-100"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-blue-600"></span>
          Current Question
        </div>

        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-green-100 border border-green-500"></span>
          Answered
        </div>

        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded border"></span>
          Not Answered
        </div>
      </div>
    </div>
  );
}