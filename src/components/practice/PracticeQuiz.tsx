"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";

type Difficulty = "easy" | "medium" | "difficult";

interface PracticeQuestion {
  id: string;
  chapterNumber: number;
  chapterSlug: string;
  chapterTitle: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PracticeQuizProps {
  chapterNumber?: number;
  difficulty?: Difficulty;
  limit?: number;
  topicId?: string;
  moduleId?: string;
}

interface CurriculumTopic {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  orderIndex: number;
}

interface CurriculumModule {
  id: string;
  moduleNumber: number;
  title: string;
  slug: string;
  description: string;
  topics: CurriculumTopic[];
}

const CHAPTERS = Array.from(
  { length: 10 },
  (_, index) => index + 1,
);

const DIFFICULTIES: {
  value: Difficulty;
  label: string;
}[] = [
  {
    value: "easy",
    label: "Easy",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "difficult",
    label: "Difficult",
  },
];

function shuffleQuestions(
  questions: PracticeQuestion[],
): PracticeQuestion[] {
  const shuffled = [...questions];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1),
    );

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
}

function PracticeQuizContent({
  chapterNumber: initialChapter = 1,
  difficulty: initialDifficulty = "easy",
  limit = 10,
  topicId: initialTopicId,
  moduleId: initialModuleId,
}: PracticeQuizProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ==========================================================
  // CURRICULUM URL CONTEXT
  // ==========================================================

  const urlTopicId =
    searchParams.get("topicId") ||
    initialTopicId;

  const urlModuleId =
    searchParams.get("moduleId") ||
    initialModuleId;

  const urlChapter =
    searchParams.get("chapterNumber");

  const urlDifficulty =
    searchParams.get("difficulty");

  const resolvedInitialChapter =
    urlChapter &&
    Number.isInteger(
      Number(urlChapter),
    )
      ? Number(urlChapter)
      : initialChapter;

  const resolvedInitialDifficulty =
    urlDifficulty === "easy" ||
    urlDifficulty === "medium" ||
    urlDifficulty === "difficult"
      ? urlDifficulty
      : initialDifficulty;

  // ==========================================================
  // PRACTICE SETUP
  // ==========================================================

  const [selectedChapter, setSelectedChapter] =
    useState<number>(
      resolvedInitialChapter,
    );

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>(
      resolvedInitialDifficulty,
    );

  const [questionLimit, setQuestionLimit] =
    useState<number>(limit);

  const [selectedTopicId, setSelectedTopicId] =
    useState<string | undefined>(
      urlTopicId,
    );

  const [selectedModuleId, setSelectedModuleId] =
    useState<string | undefined>(
      urlModuleId,
    );

  const [started, setStarted] =
    useState(false);

  // ==========================================================
  // CURRICULUM
  // ==========================================================

  const [curriculumModules, setCurriculumModules] =
    useState<CurriculumModule[]>([]);

  const [curriculumLoading, setCurriculumLoading] =
    useState(true);

  const [curriculumError, setCurriculumError] =
    useState("");

  // ==========================================================
  // QUESTIONS
  // ==========================================================

  const [questions, setQuestions] =
    useState<PracticeQuestion[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // QUIZ STATE
  // ==========================================================

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);

  const [answers, setAnswers] =
    useState<Record<number, number>>({});

  const [submitted, setSubmitted] =
    useState(false);

  const [finished, setFinished] =
    useState(false);

  // ==========================================================
  // RESULT STATE
  // ==========================================================

  const [savingResult, setSavingResult] =
    useState(false);

  const [resultError, setResultError] =
    useState("");

  // ==========================================================
  // LOAD CURRICULUM
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadCurriculum() {
      try {
        setCurriculumLoading(true);
        setCurriculumError("");

        /*
         * Curriculum modules/topics are read from the
         * existing curriculum API when available.
         *
         * The practice system does not depend on this
         * request to function; chapter practice remains
         * available if the curriculum endpoint is absent.
         */

        const response = await fetch(
          "/api/curriculum",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const modules =
          Array.isArray(data.modules)
            ? data.modules
            : Array.isArray(data)
              ? data
              : [];

        if (!cancelled) {
          setCurriculumModules(
            modules as CurriculumModule[],
          );
        }
      } catch (err) {
        console.error(
          "Failed to load curriculum:",
          err,
        );

        if (!cancelled) {
          setCurriculumError(
            "Curriculum selection is temporarily unavailable.",
          );
        }
      } finally {
        if (!cancelled) {
          setCurriculumLoading(false);
        }
      }
    }

    loadCurriculum();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // CURRENT CURRICULUM MODULE
  // ==========================================================

  const selectedModule = useMemo(() => {
    return curriculumModules.find(
      (module) =>
        module.id ===
        selectedModuleId,
    );
  }, [
    curriculumModules,
    selectedModuleId,
  ]);

  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) {
      return undefined;
    }

    for (
      const module of curriculumModules
    ) {
      const topic =
        module.topics?.find(
          (item) =>
            item.id ===
            selectedTopicId,
        );

      if (topic) {
        return topic;
      }
    }

    return undefined;
  }, [
    curriculumModules,
    selectedTopicId,
  ]);

  // ==========================================================
  // SCORE
  // ==========================================================

  const score = useMemo(() => {
    return Object.entries(
      answers,
    ).reduce(
      (
        total,
        [questionIndex, answer],
      ) => {
        const index =
          Number(questionIndex);

        if (!questions[index]) {
          return total;
        }

        return (
          total +
          (questions[index]
            .correctAnswer ===
          answer
            ? 1
            : 0)
        );
      },
      0,
    );
  }, [answers, questions]);

  // ==========================================================
  // FETCH QUESTIONS
  // ==========================================================

  async function loadQuestions() {
    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      const params =
        new URLSearchParams();

      /*
       * Curriculum filtering takes priority.
       * Chapter filtering remains available for
       * backward compatibility with the original
       * 600-question practice bank.
       */

      if (selectedTopicId) {
        params.set(
          "topicId",
          selectedTopicId,
        );
      } else if (selectedModuleId) {
        params.set(
          "moduleId",
          selectedModuleId,
        );
      } else {
        params.set(
          "chapterNumber",
          String(selectedChapter),
        );
      }

      params.set(
        "difficulty",
        selectedDifficulty,
      );

      params.set(
        "limit",
        String(questionLimit),
      );

      const response = await fetch(
        `/api/practice/questions?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load practice questions.",
        );
      }

      if (
        !Array.isArray(
          data.questions,
        ) ||
        data.questions.length === 0
      ) {
        if (selectedTopic) {
          throw new Error(
            `No ${selectedDifficulty} questions are available for ${selectedTopic.title}.`,
          );
        }

        if (selectedModule) {
          throw new Error(
            `No ${selectedDifficulty} questions are available for ${selectedModule.title}.`,
          );
        }

        throw new Error(
          `No ${selectedDifficulty} questions are available for Chapter ${selectedChapter}.`,
        );
      }

      const fetchedQuestions =
        data.questions as PracticeQuestion[];

      const randomized =
        shuffleQuestions(
          fetchedQuestions,
        );

      setQuestions(
        randomized.slice(
          0,
          questionLimit,
        ),
      );

      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswers({});
      setSubmitted(false);
      setFinished(false);
      setResultError("");
      setStarted(true);
    } catch (err) {
      console.error(
        "Failed to load practice questions:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load practice questions.",
      );

      setStarted(false);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // START PRACTICE
  // ==========================================================

  function handleStartPractice() {
    loadQuestions();
  }

  // ==========================================================
  // SELECT MODULE
  // ==========================================================

  function handleModuleChange(
    moduleId: string,
  ) {
    if (!moduleId) {
      setSelectedModuleId(
        undefined,
      );
      setSelectedTopicId(
        undefined,
      );
      return;
    }

    setSelectedModuleId(
      moduleId,
    );

    setSelectedTopicId(
      undefined,
    );
  }

  // ==========================================================
  // SELECT TOPIC
  // ==========================================================

  function handleTopicChange(
    topicId: string,
  ) {
    if (!topicId) {
      setSelectedTopicId(
        undefined,
      );
      return;
    }

    setSelectedTopicId(
      topicId,
    );

    const topicModule =
      curriculumModules.find(
        (module) =>
          module.topics?.some(
            (topic) =>
              topic.id ===
              topicId,
          ),
      );

    if (topicModule) {
      setSelectedModuleId(
        topicModule.id,
      );
    }
  }

  // ==========================================================
  // SELECT ANSWER
  // ==========================================================

  function handleSelectAnswer(
    answerIndex: number,
  ) {
    if (submitted) {
      return;
    }

    setSelectedAnswer(
      answerIndex,
    );
  }

  // ==========================================================
  // SUBMIT ANSWER
  // ==========================================================

  function handleSubmitAnswer() {
    if (
      selectedAnswer === null
    ) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,
        [currentQuestion]:
          selectedAnswer,
      }),
    );

    setSubmitted(true);
  }

  // ==========================================================
  // NEXT QUESTION
  // ==========================================================

  async function handleNext() {
    if (!submitted) {
      return;
    }

    if (
      currentQuestion ===
      questions.length - 1
    ) {
      await finishQuiz();
      return;
    }

    const nextIndex =
      currentQuestion + 1;

    setCurrentQuestion(
      nextIndex,
    );

    setSelectedAnswer(
      answers[nextIndex] ??
        null,
    );

    setSubmitted(
      Object.prototype.hasOwnProperty.call(
        answers,
        nextIndex,
      ),
    );
  }

  // ==========================================================
  // FINISH QUIZ
  // ==========================================================

  async function finishQuiz() {
    setSavingResult(true);
    setResultError("");

    const finalAnswers = {
      ...answers,
      ...(selectedAnswer !==
      null
        ? {
            [currentQuestion]:
              selectedAnswer,
          }
        : {}),
    };

    const finalScore =
      Object.entries(
        finalAnswers,
      ).reduce(
        (
          total,
          [
            questionIndex,
            answer,
          ],
        ) => {
          const index =
            Number(
              questionIndex,
            );

          if (!questions[index]) {
            return total;
          }

          return (
            total +
            (questions[index]
              .correctAnswer ===
            answer
              ? 1
              : 0)
          );
        },
        0,
      );

    const percentage =
      Math.round(
        (finalScore /
          questions.length) *
          100,
      );

    setAnswers(finalAnswers);

    try {
      const response =
        await fetch(
          "/api/practice/result",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              lessonSlug:
                selectedTopicId
                  ? `topic-${selectedTopicId}`
                  : selectedModuleId
                    ? `module-${selectedModuleId}`
                    : `chapter-${selectedChapter}`,

              chapterNumber:
                selectedChapter,

              difficulty:
                selectedDifficulty,

              score:
                finalScore,

              totalQuestions:
                questions.length,

              percentage,

              answers:
                finalAnswers,

              questionIds:
                questions.map(
                  (question) =>
                    question.id,
                ),

              curriculumTopicId:
                selectedTopicId ??
                null,

              curriculumModuleId:
                selectedModuleId ??
                null,
            }),
          },
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(
              () => ({}),
            );

        throw new Error(
          data.error ||
            "Practice result could not be saved.",
        );
      }

      setFinished(true);
    } catch (err) {
      console.error(
        "Failed to save practice result:",
        err,
      );

      setResultError(
        err instanceof Error
          ? err.message
          : "Practice result could not be saved.",
      );

      /*
       * Preserve the original behavior:
       * saving analytics must not prevent
       * the student from seeing their result.
       */
      setFinished(true);
    } finally {
      setSavingResult(false);
    }
  }

  // ==========================================================
  // RESTART SAME SET
  // ==========================================================

  function handleRestart() {
    loadQuestions();
  }

  // ==========================================================
  // CHANGE SET
  // ==========================================================

  function handleChangePractice() {
    setStarted(false);
    setFinished(false);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setSubmitted(false);
    setError("");
    setResultError("");
  }

  // ==========================================================
  // FINISHED SCREEN
  // ==========================================================

  if (finished) {
    const finalPercentage =
      Math.round(
        (score /
          questions.length) *
          100,
      );

    let message =
      "Keep practicing!";

    if (finalPercentage >= 90) {
      message =
        "Excellent work!";
    } else if (
      finalPercentage >= 70
    ) {
      message = "Good job!";
    } else if (
      finalPercentage >= 50
    ) {
      message =
        "You're making progress!";
    }

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Trophy size={30} />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Practice Complete
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {message}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {selectedTopic
              ? selectedTopic.title
              : selectedModule
                ? selectedModule.title
                : `Chapter ${selectedChapter}`}{" "}
            · {selectedDifficulty}
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-500">
              Your Score
            </p>

            <p className="mt-2 text-5xl font-black text-slate-950">
              {score}
              <span className="text-2xl text-slate-400">
                /{questions.length}
              </span>
            </p>

            <p className="mt-2 text-sm font-semibold text-blue-600">
              {finalPercentage}%
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={
                handleRestart
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <RotateCcw
                size={17}
              />
              Try Another Set
            </button>

            <button
              type="button"
              onClick={
                handleChangePractice
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Change Practice
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft
                size={17}
              />
              Home
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft
                size={17}
              />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // SETUP SCREEN
  // ==========================================================

  if (!started) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Practice Setup
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-950">
            Choose your practice
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select a curriculum topic,
            module, or legacy chapter,
            then choose your difficulty
            and number of questions.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {/* Curriculum Module */}

          <div>
            <label
              htmlFor="practice-module"
              className="block text-sm font-bold text-slate-800"
            >
              Curriculum Module
            </label>

            <select
              id="practice-module"
              value={
                selectedModuleId ??
                ""
              }
              onChange={(event) =>
                handleModuleChange(
                  event.target.value,
                )
              }
              disabled={
                curriculumLoading
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                All curriculum modules
              </option>

              {curriculumModules.map(
                (module) => (
                  <option
                    key={module.id}
                    value={module.id}
                  >
                    Module{" "}
                    {
                      module.moduleNumber
                    }{" "}
                    —{" "}
                    {module.title}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Curriculum Topic */}

          <div>
            <label
              htmlFor="practice-topic"
              className="block text-sm font-bold text-slate-800"
            >
              Curriculum Topic
            </label>

            <select
              id="practice-topic"
              value={
                selectedTopicId ??
                ""
              }
              onChange={(event) =>
                handleTopicChange(
                  event.target.value,
                )
              }
              disabled={
                curriculumLoading ||
                !selectedModuleId
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                All topics in selected module
              </option>

              {selectedModule?.topics?.map(
                (topic) => (
                  <option
                    key={topic.id}
                    value={topic.id}
                  >
                    {topic.title}
                  </option>
                ),
              )}
            </select>
          </div>

          {curriculumError && (
            <p className="text-xs text-slate-400">
              {curriculumError}
            </p>
          )}

          {/* Legacy Chapter */}

          {!selectedTopicId &&
            !selectedModuleId && (
              <div>
                <label
                  htmlFor="practice-chapter"
                  className="block text-sm font-bold text-slate-800"
                >
                  Legacy Chapter
                </label>

                <select
                  id="practice-chapter"
                  value={
                    selectedChapter
                  }
                  onChange={(
                    event,
                  ) =>
                    setSelectedChapter(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {CHAPTERS.map(
                    (chapter) => (
                      <option
                        key={
                          chapter
                        }
                        value={
                          chapter
                        }
                      >
                        Chapter{" "}
                        {chapter}
                      </option>
                    ),
                  )}
                </select>
              </div>
            )}

          {/* Difficulty */}

          <div>
            <p className="text-sm font-bold text-slate-800">
              Difficulty
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {DIFFICULTIES.map(
                (difficulty) => {
                  const active =
                    selectedDifficulty ===
                    difficulty.value;

                  return (
                    <button
                      key={
                        difficulty.value
                      }
                      type="button"
                      onClick={() =>
                        setSelectedDifficulty(
                          difficulty.value,
                        )
                      }
                      className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {
                        difficulty.label
                      }
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Number of Questions */}

          <div>
            <label
              htmlFor="question-limit"
              className="block text-sm font-bold text-slate-800"
            >
              Number of Questions
            </label>

            <select
              id="question-limit"
              value={
                questionLimit
              }
              onChange={(event) =>
                setQuestionLimit(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value={5}>
                5 Questions
              </option>

              <option value={10}>
                10 Questions
              </option>

              <option value={15}>
                15 Questions
              </option>

              <option value={20}>
                20 Questions
              </option>
            </select>
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          {/* Start */}

          <button
            type="button"
            onClick={
              handleStartPractice
            }
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Loading Questions..."
              : "Start Practice"}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading ||
    questions.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <p className="mt-4 text-sm font-semibold text-slate-600">
          Loading practice questions...
        </p>
      </div>
    );
  }

  // ==========================================================
  // CURRENT QUESTION
  // ==========================================================

  const question =
    questions[currentQuestion];

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  const isCorrect =
    submitted &&
    selectedAnswer ===
      question.correctAnswer;

  // ==========================================================
  // QUIZ
  // ==========================================================

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}

      <div className="border-b border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              {selectedTopic
                ? selectedTopic.title
                : selectedModule
                  ? selectedModule.title
                  : `Chapter ${selectedChapter}`}{" "}
              · {selectedDifficulty}
            </p>

            <h1 className="mt-1 text-xl font-black text-slate-950">
              Quantum Computing Practice
            </h1>
          </div>

          <div className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
            {currentQuestion + 1}{" "}
            / {questions.length}
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}

      <div className="p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            {question.topic}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
            {question.difficulty}
          </span>
        </div>

        <p className="mt-6 text-sm font-semibold text-slate-500">
          Question{" "}
          {currentQuestion + 1}
        </p>

        <h2 className="mt-3 text-xl font-bold leading-8 text-slate-950 sm:text-2xl">
          {question.question}
        </h2>

        {/* Options */}

        <div className="mt-7 space-y-3">
          {question.options.map(
            (option, index) => {
              const isSelected =
                selectedAnswer ===
                index;

              const isCorrectOption =
                submitted &&
                index ===
                  question.correctAnswer;

              const isWrongSelection =
                submitted &&
                isSelected &&
                !isCorrect;

              let optionClass =
                "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50";

              if (
                isSelected &&
                !submitted
              ) {
                optionClass =
                  "border-blue-500 bg-blue-50 ring-2 ring-blue-100";
              }

              if (
                isCorrectOption
              ) {
                optionClass =
                  "border-green-300 bg-green-50";
              }

              if (
                isWrongSelection
              ) {
                optionClass =
                  "border-red-300 bg-red-50";
              }

              return (
                <button
                  key={`${question.id}-${index}`}
                  type="button"
                  onClick={() =>
                    handleSelectAnswer(
                      index,
                    )
                  }
                  disabled={submitted}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${optionClass}`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      isCorrectOption
                        ? "bg-green-600 text-white"
                        : isWrongSelection
                          ? "bg-red-600 text-white"
                          : isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {String.fromCharCode(
                      65 + index,
                    )}
                  </span>

                  <span className="flex-1 text-sm font-semibold text-slate-800">
                    {option}
                  </span>

                  {isCorrectOption && (
                    <CheckCircle2
                      size={19}
                      className="shrink-0 text-green-600"
                    />
                  )}

                  {isWrongSelection && (
                    <XCircle
                      size={19}
                      className="shrink-0 text-red-600"
                    />
                  )}
                </button>
              );
            },
          )}
        </div>

        {/* Explanation */}

        {submitted && (
          <div
            className={`mt-6 rounded-xl border p-4 ${
              isCorrect
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-green-600"
                />
              ) : (
                <XCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-600"
                />
              )}

              <div>
                <p
                  className={`text-sm font-bold ${
                    isCorrect
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {isCorrect
                    ? "Correct!"
                    : "Not quite."}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {
                    question.explanation
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={
              handleChangePractice
            }
            className="text-left text-xs font-semibold text-slate-400 hover:text-blue-600"
          >
            Change practice
          </button>

          {!submitted ? (
            <button
              type="button"
              onClick={
                handleSubmitAnswer
              }
              disabled={
                selectedAnswer ===
                null
              }
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check Answer
            </button>
          ) : (
            <button
              type="button"
              onClick={
                handleNext
              }
              disabled={
                savingResult
              }
              className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingResult
                ? "Saving..."
                : currentQuestion ===
                    questions.length -
                      1
                  ? "Finish Quiz"
                  : "Next Question"}
            </button>
          )}
        </div>

        {resultError && (
          <p className="mt-4 text-sm text-red-600">
            {resultError}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PracticeQuiz(
  props: PracticeQuizProps,
) {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading practice...
          </p>
        </div>
      }
    >
      <PracticeQuizContent {...props} />
    </Suspense>
  );
}