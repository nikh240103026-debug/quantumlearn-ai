"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Flag,
  Flame,
  Keyboard,
  LayoutDashboard,
  LogIn,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  XCircle,
} from "lucide-react";
import { ExamShell } from "@/components/exam/ExamShell";
import { OmrOption, type OmrState } from "@/components/exam/OmrOption";
import { ConfirmDialog } from "@/components/exam/ConfirmDialog";

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
  createdAt?: string;
  updatedAt?: string;
}

interface PracticeQuizProps {
  chapterNumber?: number;
  difficulty?: Difficulty;
  limit?: number;
  topicId?: string;
  moduleId?: string;
  // Checking answers requires an account; guests are asked to sign
  // in before starting instead of failing on the first answer.
  isSignedIn?: boolean;
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

interface NextTopicRecommendation {
  topicId: string;
  moduleId?: string | null;
  reason?: string | null;
  priority?: number;
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

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

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
  isSignedIn = true,
}: PracticeQuizProps) {
  const searchParams = useSearchParams();

  // ==========================================================
  // URL CONTEXT
  // ==========================================================

  const urlTopicId =
    searchParams.get("topicId")?.trim() ||
    initialTopicId;

  const urlModuleId =
    searchParams.get("moduleId")?.trim() ||
    initialModuleId;

  const urlChapter =
    searchParams.get("chapterNumber");

  const urlDifficulty =
    searchParams.get("difficulty");

  const resolvedInitialChapter =
    urlChapter &&
    Number.isInteger(Number(urlChapter)) &&
    Number(urlChapter) >= 1 &&
    Number(urlChapter) <= 10
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
    useState<number>(resolvedInitialChapter);

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>(resolvedInitialDifficulty);

  const [questionLimit, setQuestionLimit] =
    useState<number>(
      Math.min(Math.max(limit, 1), 100),
    );

  const [selectedTopicId, setSelectedTopicId] =
    useState<string | undefined>(urlTopicId);

  const [selectedModuleId, setSelectedModuleId] =
    useState<string | undefined>(urlModuleId);

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

  // Correct answers are not sent with the questions. They are
  // revealed per question by /api/practice/check after answering.
  const [revealed, setRevealed] =
    useState<
      Record<
        string,
        {
          correctAnswer: number;
          explanation: string;
        }
      >
    >({});

  const [checkingAnswer, setCheckingAnswer] =
    useState(false);

  const savingResultRef = useRef(false);

  // Server-issued practice session (null before the migration or for
  // guests). Sent with every check and with the final result.
  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const [checkError, setCheckError] =
    useState("");

  const [finished, setFinished] =
    useState(false);

      // ==========================================================
      // QUESTION REPORT
      // ==========================================================

      const [showReportForm, setShowReportForm] =
        useState(false);

      const [reportReason, setReportReason] =
        useState("");

      const [reportDetails, setReportDetails] =
        useState("");

      const [submittingReport, setSubmittingReport] =
        useState(false);

      const [reportSuccess, setReportSuccess] =
        useState("");

      const [reportError, setReportError] =
        useState("");

  // ==========================================================
  // RESULT STATE
  // ==========================================================

  const [savingResult, setSavingResult] =
    useState(false);

  const [resultError, setResultError] =
    useState("");

  const [nextRecommendation, setNextRecommendation] =
    useState<NextTopicRecommendation | null>(null);

  // ==========================================================
  // SYNC URL CONTEXT
  // ==========================================================

  useEffect(() => {
    setSelectedTopicId(urlTopicId);
    setSelectedModuleId(urlModuleId);
    setSelectedChapter(resolvedInitialChapter);
    setSelectedDifficulty(
      resolvedInitialDifficulty,
    );
  }, [
    urlTopicId,
    urlModuleId,
    resolvedInitialChapter,
    resolvedInitialDifficulty,
  ]);

  // ==========================================================
  // LOAD CURRICULUM
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadCurriculum() {
      try {
        setCurriculumLoading(true);
        setCurriculumError("");

        const response = await fetch(
          "/api/curriculum",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load curriculum.",
          );
        }

        const data = await response.json();

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
  // SELECTED MODULE
  // ==========================================================

  const selectedModule = useMemo(() => {
    return curriculumModules.find(
      (module) =>
        module.id === selectedModuleId,
    );
  }, [
    curriculumModules,
    selectedModuleId,
  ]);

  // ==========================================================
  // SELECTED TOPIC
  // ==========================================================

  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) {
      return undefined;
    }

    for (const curriculumModule of curriculumModules) {
      const topic = curriculumModule.topics?.find(
        (item) =>
          item.id === selectedTopicId,
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
  // RECOMMENDED TOPIC
  // ==========================================================

  const recommendedTopic = useMemo(() => {
    if (!nextRecommendation?.topicId) {
      return undefined;
    }

    for (const curriculumModule of curriculumModules) {
      const topic = curriculumModule.topics?.find(
        (item) =>
          item.id ===
          nextRecommendation.topicId,
      );

      if (topic) {
        return topic;
      }
    }

    return undefined;
  }, [
    curriculumModules,
    nextRecommendation,
  ]);

  const recommendedModule = useMemo(() => {
    if (
      !nextRecommendation?.moduleId
    ) {
      if (recommendedTopic?.moduleId) {
        return curriculumModules.find(
          (module) =>
            module.id ===
            recommendedTopic.moduleId,
        );
      }

      return undefined;
    }

    return curriculumModules.find(
      (module) =>
        module.id ===
        nextRecommendation.moduleId,
    );
  }, [
    curriculumModules,
    nextRecommendation,
    recommendedTopic,
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
          (revealed[questions[index].id]
            ?.correctAnswer ===
          answer
            ? 1
            : 0)
        );
      },
      0,
    );
  }, [answers, questions, revealed]);

  // ==========================================================
  // FETCH QUESTIONS
  // ==========================================================

  async function loadQuestions() {
    setLoading(true);
    setError("");
    setResultError("");
    setQuestions([]);
    setSessionId(null);
    setNextRecommendation(null);

    try {
      const params =
        new URLSearchParams();

      /*
       * Priority:
       *
       * 1. Topic
       * 2. Module
       * 3. Legacy chapter
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

      const nextSessionId =
        typeof data.sessionId === "string"
          ? data.sessionId
          : null;

      // A session pins exactly the questions the server returned, so
      // don't trim them (the server already applied the limit).
      setQuestions(
        nextSessionId
          ? randomized
          : randomized.slice(
              0,
              questionLimit,
            ),
      );

      setSessionId(nextSessionId);

      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswers({});
      setRevealed({});
      setCheckError("");
      setSubmitted(false);
      setFinished(false);
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
  // MODULE CHANGE
  // ==========================================================

  function handleModuleChange(
    moduleId: string,
  ) {
    if (!moduleId) {
      setSelectedModuleId(undefined);
      setSelectedTopicId(undefined);
      return;
    }

    setSelectedModuleId(moduleId);
    setSelectedTopicId(undefined);
  }

  // ==========================================================
  // TOPIC CHANGE
  // ==========================================================

  function handleTopicChange(
    topicId: string,
  ) {
    if (!topicId) {
      setSelectedTopicId(undefined);
      return;
    }

    setSelectedTopicId(topicId);

    const topicModule =
      curriculumModules.find(
        (module) =>
          module.topics?.some(
            (topic) =>
              topic.id === topicId,
          ),
      );

    if (topicModule) {
      setSelectedModuleId(
        topicModule.id,
      );
    }
  }

  // ==========================================================
  // ANSWER SELECTION
  // ==========================================================

  function handleSelectAnswer(
    answerIndex: number,
  ) {
    if (submitted) {
      return;
    }

    setSelectedAnswer(answerIndex);
  }

  // ==========================================================
  // SUBMIT ANSWER
  // ==========================================================

  async function handleSubmitAnswer() {
    const current =
      questions[currentQuestion];

    if (
      selectedAnswer === null ||
      !current ||
      checkingAnswer
    ) {
      return;
    }

    setCheckingAnswer(true);
    setCheckError("");

    try {
      const response =
        await fetch(
          "/api/practice/check",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              questionId:
                current.id,
              answer:
                selectedAnswer,
              sessionId,
            }),
          },
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        typeof data.correctAnswer !==
          "number"
      ) {
        throw new Error(
          data.error ||
            "Could not check your answer. Please try again.",
        );
      }

      setRevealed((previous) => ({
        ...previous,
        [current.id]: {
          correctAnswer:
            data.correctAnswer,
          explanation:
            typeof data.explanation ===
            "string"
              ? data.explanation
              : "",
        },
      }));

      setAnswers((previous) => ({
        ...previous,
        [currentQuestion]:
          selectedAnswer,
      }));

      setSubmitted(true);
    } catch (err) {
      setCheckError(
        err instanceof Error
          ? err.message
          : "Could not check your answer. Please try again.",
      );
    } finally {
      setCheckingAnswer(false);
    }
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

    setCurrentQuestion(nextIndex);

    setSelectedAnswer(
      answers[nextIndex] ?? null,
    );

    setSubmitted(
      Object.prototype.hasOwnProperty.call(
        answers,
        nextIndex,
      ),
    );

    // Report state belongs to the previous question; carrying it over
    // would report the wrong question.
    setShowReportForm(false);
    setReportReason("");
    setReportDetails("");
    setReportSuccess("");
    setReportError("");
    setCheckError("");
  }

  // ==========================================================
  // EXTRACT RECOMMENDATION
  // ==========================================================

  function extractRecommendation(
    data: unknown,
  ): NextTopicRecommendation | null {
    if (
      !data ||
      typeof data !== "object"
    ) {
      return null;
    }

    const payload =
      data as Record<string, unknown>;

    const candidates = [
      payload.nextTopicRecommendation,
      payload.recommendation,
      payload.nextRecommendation,
    ];

    for (const candidate of candidates) {
      if (
        !candidate ||
        typeof candidate !== "object"
      ) {
        continue;
      }

      const recommendation =
        candidate as Record<
          string,
          unknown
        >;

      const topicId =
        typeof recommendation.topicId ===
        "string"
          ? recommendation.topicId
          : typeof recommendation.topic_id ===
              "string"
            ? recommendation.topic_id
            : null;

      if (!topicId) {
        continue;
      }

      const moduleId =
        typeof recommendation.moduleId ===
        "string"
          ? recommendation.moduleId
          : typeof recommendation.module_id ===
              "string"
            ? recommendation.module_id
            : null;

      const reason =
        typeof recommendation.reason ===
        "string"
          ? recommendation.reason
          : null;

      const priority =
        typeof recommendation.priority ===
        "number"
          ? recommendation.priority
          : undefined;

      return {
        topicId,
        moduleId,
        reason,
        priority,
      };
    }

    return null;
  }

  // ==========================================================
  // FINISH QUIZ
  // ==========================================================

  async function finishQuiz() {
    // A ref, not state: a fast double-click fires twice before the
    // `savingResult` state update re-renders, saving the result twice.
    if (savingResultRef.current) {
      return;
    }

    savingResultRef.current = true;
    setSavingResult(true);
    setResultError("");
    setNextRecommendation(null);

    const finalAnswers = {
      ...answers,
      ...(selectedAnswer !== null
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
          [questionIndex, answer],
        ) => {
          const index =
            Number(questionIndex);

          if (!questions[index]) {
            return total;
          }

          return (
            total +
            (revealed[questions[index].id]
              ?.correctAnswer ===
            answer
              ? 1
              : 0)
          );
        },
        0,
      );

    const percentage =
      questions.length > 0
        ? Math.round(
            (finalScore /
              questions.length) *
              100,
          )
        : 0;

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

              score: finalScore,

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

              sessionId,

              curriculumTopicId:
                selectedTopicId ??
                null,

              curriculumModuleId:
                selectedModuleId ??
                null,
            }),
          },
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Practice result could not be saved.",
        );
      }

      const recommendation =
        extractRecommendation(
          data,
        );

      if (recommendation) {
        setNextRecommendation(
          recommendation,
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
       * Result visibility is never blocked by
       * analytics/recommendation persistence.
       */
      setFinished(true);
    } finally {
      savingResultRef.current = false;
      setSavingResult(false);
    }
  }

  // ==========================================================
  // RESTART
  // ==========================================================

  function handleRestart() {
    loadQuestions();
  }
  
    // ==========================================================
    // REPORT QUESTION
    // ==========================================================

    async function handleSubmitQuestionReport() {
      if (!question?.id || !reportReason) {
        return;
      }

      setSubmittingReport(true);
      setReportError("");
      setReportSuccess("");

      try {
        const response = await fetch(
          "/api/practice/questions/report",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question_id: question.id,
              reason: reportReason,
              details:
                reportDetails.trim() || null,
            }),
          },
        );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to submit the report.",
          );
        }

        setReportSuccess(
          "Thanks for reporting this question. We'll review it.",
        );

        setReportReason("");
        setReportDetails("");
        setShowReportForm(false);
      } catch (err) {
        console.error(
          "Failed to submit question report:",
          err,
        );

        setReportError(
          err instanceof Error
            ? err.message
            : "Unable to submit the report.",
        );
      } finally {
        setSubmittingReport(false);
      }
    }

  // ==========================================================
  // CHANGE PRACTICE
  // ==========================================================

  function handleChangePractice() {
    setStarted(false);
    setFinished(false);
    setQuestions([]);
    setSessionId(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setRevealed({});
    setCheckError("");
    setSubmitted(false);
    setError("");
    setResultError("");
    setNextRecommendation(null);
  }

  // ==========================================================
  // DERIVED SESSION STATE (per-question outcome, streaks)
  // ==========================================================

  const questionStates = useMemo(
    () =>
      questions.map((item, index): QuestionState => {
        if (!Object.prototype.hasOwnProperty.call(answers, index)) {
          return "pending";
        }

        const key = revealed[item.id];

        if (!key) {
          return "pending";
        }

        return key.correctAnswer === answers[index]
          ? "correct"
          : "wrong";
      }),
    [questions, answers, revealed],
  );

  const sessionStats = useMemo(() => {
    let best = 0;
    let run = 0;

    for (const state of questionStates) {
      if (state === "correct") {
        run += 1;
        best = Math.max(best, run);
      } else if (state === "wrong") {
        run = 0;
      }
    }

    let current = 0;

    for (let i = questionStates.length - 1; i >= 0; i--) {
      if (questionStates[i] === "pending") continue;
      if (questionStates[i] === "correct") current += 1;
      else break;
    }

    const answered = questionStates.filter(
      (state) => state !== "pending",
    ).length;

    const correct = questionStates.filter(
      (state) => state === "correct",
    ).length;

    return {
      answered,
      correct,
      wrong: answered - correct,
      best,
      current,
      accuracy: answered
        ? Math.round((correct / answered) * 100)
        : 0,
    };
  }, [questionStates]);

  const [reviewFilter, setReviewFilter] =
    useState<"all" | "wrong">("all");

  // ==========================================================
  // KEYBOARD SHORTCUTS
  // 1–9 / A–H pick an option, Enter checks or advances.
  // ==========================================================

  const keyboardRef = useRef<(event: KeyboardEvent) => void>(
    () => {},
  );

  useEffect(() => {
    keyboardRef.current = (event: KeyboardEvent) => {
      if (
        !started ||
        finished ||
        loading ||
        questions.length === 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (
        target?.closest(
          "input, textarea, select, [contenteditable='true'], [role='dialog'], [role='alertdialog']",
        ) ||
        document.querySelector("[role='alertdialog'], [role='dialog']")
      ) {
        return;
      }

      const current = questions[currentQuestion];

      if (!current) return;

      const key = event.key.toLowerCase();

      let optionIndex = -1;

      if (key.length === 1) {
        const letter = "abcdefgh".indexOf(key);
        const digit = Number(key);

        if (letter >= 0) optionIndex = letter;
        else if (Number.isInteger(digit) && digit >= 1) {
          optionIndex = digit - 1;
        }
      }

      if (
        optionIndex >= 0 &&
        optionIndex < current.options.length &&
        !submitted
      ) {
        event.preventDefault();
        handleSelectAnswer(optionIndex);
        return;
      }

      if (key === "enter") {
        // A focused button already handles Enter natively.
        if (target?.closest("button, a")) return;

        event.preventDefault();

        if (!submitted) {
          void handleSubmitAnswer();
        } else if (!savingResult) {
          void handleNext();
        }
      }
    };
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) =>
      keyboardRef.current(event);

    window.addEventListener("keydown", listener);

    return () =>
      window.removeEventListener("keydown", listener);
  }, []);

  const [confirmExit, setConfirmExit] =
    useState(false);

  const scopeTitle = selectedTopic
    ? selectedTopic.title
    : selectedModule
      ? selectedModule.title
      : `Chapter ${selectedChapter}`;

  const difficultyLabel =
    DIFFICULTIES.find((item) => item.value === selectedDifficulty)?.label ??
    selectedDifficulty;

  // ==========================================================
  // FINISHED SCREEN — a marked answer script
  // ==========================================================

  if (finished) {
    const finalPercentage =
      questions.length > 0
        ? Math.round((score / questions.length) * 100)
        : 0;

    const remark =
      finalPercentage >= 90
        ? "Excellent — you own this topic."
        : finalPercentage >= 70
          ? "Strong work. Nearly there."
          : finalPercentage >= 50
            ? "Good effort. Review the misses."
            : "Keep going — revise and retry.";

    const reviewItems = questions
      .map((item, index) => ({
        item,
        index,
        state: questionStates[index],
      }))
      .filter(
        ({ state }) =>
          reviewFilter === "all" || state === "wrong",
      );

    return (
      <ExamShell
        eyebrow="Practice · marked script"
        title={`${scopeTitle} · ${difficultyLabel}`}
        onExit={handleChangePractice}
        exitLabel="Close"
      >
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Score sheet */}
          <section className="ql-sheet relative overflow-hidden rounded-xl border border-rule">
            <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[auto_1fr] md:items-center">
              <RedPenScore score={score} total={questions.length} />

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                  Result · {finalPercentage}%
                </p>
                <p className="mt-2 font-serif text-3xl italic leading-tight text-exam-red sm:text-4xl">
                  {remark}
                </p>

                <dl className="mt-6 grid grid-cols-2 border-y border-rule sm:grid-cols-4">
                  <ScriptStat label="Correct" value={sessionStats.correct} tone="text-exam-green" />
                  <ScriptStat label="Incorrect" value={sessionStats.wrong} tone="text-exam-red" />
                  <ScriptStat label="Accuracy" value={`${finalPercentage}%`} tone="text-ink" />
                  <ScriptStat label="Best streak" value={sessionStats.best} tone="text-exam-amber" />
                </dl>

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={handleRestart}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70"
                  >
                    <RotateCcw size={15} />
                    {loading ? "Preparing…" : "New set, same settings"}
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePractice}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/25 bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/60"
                  >
                    <SlidersHorizontal size={15} />
                    Change settings
                  </button>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
                  >
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>
                </div>

                {resultError && (
                  <p className="mt-4 flex items-start gap-2 rounded-md border border-exam-amber/30 bg-[#fdf3e2] px-3 py-2.5 text-sm text-[#7a4a00]">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>Your score is shown but wasn&apos;t saved: {resultError}</span>
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Recommendation */}
          {nextRecommendation && recommendedTopic && (
            <section className="mt-5 flex flex-col gap-4 rounded-xl border-2 border-dashed border-exam-blue/40 bg-[#eef1ff] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-exam-blue text-white">
                  <Sparkles size={17} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-exam-blue">
                    Study next{recommendedModule ? ` · Module ${recommendedModule.moduleNumber}` : ""}
                  </p>
                  <p className="mt-1 font-serif text-xl font-semibold">{recommendedTopic.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {nextRecommendation.reason ||
                      "Continue with this topic to keep progressing through your curriculum."}
                  </p>
                </div>
              </div>
              <Link
                href={`/practice?topicId=${encodeURIComponent(recommendedTopic.id)}&moduleId=${encodeURIComponent(recommendedTopic.moduleId)}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-exam-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a33c4]"
              >
                Practise it
                <ArrowRight size={15} />
              </Link>
            </section>
          )}

          {/* Marked answer script */}
          <section className="ql-sheet mt-5 overflow-hidden rounded-xl border border-rule">
            <div className="flex flex-col gap-3 border-b border-rule px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <h2 className="font-serif text-2xl font-semibold">Answer script</h2>
              <div role="tablist" aria-label="Filter answers" className="inline-flex self-start rounded-md border border-rule bg-paper p-0.5 sm:self-auto">
                {(
                  [
                    ["all", `All ${questions.length}`],
                    ["wrong", `Mistakes ${sessionStats.wrong}`],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={reviewFilter === value}
                    onClick={() => setReviewFilter(value)}
                    className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                      reviewFilter === value ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {reviewItems.length === 0 ? (
              <p className="px-8 py-14 text-center font-serif text-xl italic text-exam-green">
                No mistakes in this set. Try a harder level next.
              </p>
            ) : (
              <ol>
                {reviewItems.map(({ item, index, state }) => {
                  const key = revealed[item.id];
                  const yours = answers[index];
                  const correct = state === "correct";

                  return (
                    <li key={item.id} className="relative border-b border-rule last:border-b-0">
                      {/* margin with red-pen mark */}
                      <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[84px_1fr]">
                        <div className="flex flex-col items-center gap-2 border-r-2 border-exam-red/25 py-5">
                          <span className="font-serif text-lg font-semibold text-ink-soft">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <PenMark correct={correct} />
                        </div>

                        <div className="px-4 py-5 sm:px-7">
                          <p className="font-serif text-lg leading-7">{item.question}</p>

                          <div className="mt-4 space-y-2 text-sm">
                            {!correct && yours !== undefined && (
                              <ScriptAnswer
                                label="Your answer"
                                letter={String.fromCharCode(65 + yours)}
                                text={item.options[yours]}
                                tone="wrong"
                              />
                            )}
                            {key && (
                              <ScriptAnswer
                                label={correct ? "Your answer" : "Correct answer"}
                                letter={String.fromCharCode(65 + key.correctAnswer)}
                                text={item.options[key.correctAnswer]}
                                tone="right"
                              />
                            )}
                          </div>

                          {key?.explanation && (
                            <p className="mt-4 border-l-2 border-exam-blue/40 pl-4 font-serif text-[15px] italic leading-6 text-ink-soft">
                              {key.explanation}
                            </p>
                          )}

                          <Link
                            href={`/ai-tutor?topic=${encodeURIComponent(item.topic)}`}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-exam-blue hover:underline"
                          >
                            <Bot size={13} />
                            Ask the AI tutor about {item.topic}
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </ExamShell>
    );
  }

  // ==========================================================
  // SETUP SCREEN — fill in the paper form
  // ==========================================================

  if (!started) {
    const scopeKind = selectedTopic
      ? "Topic"
      : selectedModule
        ? `Module ${selectedModule.moduleNumber}`
        : "Chapter";

    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="ql-sheet overflow-hidden rounded-xl border border-rule">
          <div className="flex items-center justify-between border-b border-rule px-5 py-4 sm:px-8">
            <h2 className="font-serif text-2xl font-semibold">Practice paper</h2>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Fill the bubbles
            </span>
          </div>

          {/* Section A — syllabus */}
          <FormSection letter="A" title="Syllabus" hint="Choose a curriculum module, then narrow it to a topic if you like.">
            {curriculumLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="h-12 animate-pulse rounded-md bg-paper" />
                ))}
              </div>
            ) : (
              <div role="radiogroup" aria-label="Syllabus" className="divide-y divide-rule overflow-hidden rounded-lg border border-rule">
                <SyllabusRow
                  active={!selectedModuleId}
                  onClick={() => handleModuleChange("")}
                  code="CH"
                  title="Whole chapter"
                  meta={`Chapters 1–${CHAPTERS.length}`}
                />
                {curriculumModules.map((module) => (
                  <SyllabusRow
                    key={module.id}
                    active={selectedModuleId === module.id}
                    onClick={() => handleModuleChange(module.id)}
                    code={`M${module.moduleNumber}`}
                    title={module.title}
                    meta={`${module.topics?.length ?? 0} topics`}
                  />
                ))}
              </div>
            )}

            {curriculumError && (
              <p className="mt-3 flex items-center gap-2 text-xs text-exam-amber">
                <AlertTriangle size={13} />
                {curriculumError} Chapter practice still works.
              </p>
            )}

            {selectedModule ? (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">Topic</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <TopicTag active={!selectedTopicId} onClick={() => handleTopicChange("")}>
                    All topics
                  </TopicTag>
                  {selectedModule.topics?.map((topic) => (
                    <TopicTag
                      key={topic.id}
                      active={selectedTopicId === topic.id}
                      onClick={() => handleTopicChange(topic.id)}
                    >
                      {topic.title}
                    </TopicTag>
                  ))}
                </div>
              </div>
            ) : !selectedModuleId ? (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">Chapter</p>
                <BubbleRow
                  label="Chapter"
                  options={CHAPTERS.map((chapter) => ({ value: chapter, label: String(chapter).padStart(2, "0") }))}
                  value={selectedChapter}
                  onChange={setSelectedChapter}
                />
              </div>
            ) : null}
          </FormSection>

          {/* Section B — level */}
          <FormSection letter="B" title="Level" hint="Pre-filled from Settings → Learning.">
            <div role="radiogroup" aria-label="Difficulty" className="grid gap-2.5 sm:grid-cols-3">
              {DIFFICULTIES.map((difficulty) => {
                const active = selectedDifficulty === difficulty.value;
                const meta = DIFFICULTY_META[difficulty.value];
                return (
                  <button
                    key={difficulty.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedDifficulty(difficulty.value)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                      active ? "border-ink bg-white" : "border-rule bg-sheet hover:border-ink/40"
                    }`}
                  >
                    <FormBubble filled={active} />
                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        {difficulty.label}
                        <SignalBars level={meta.level} className={active ? meta.text : "text-ink/25"} />
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-soft">{meta.blurb}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </FormSection>

          {/* Section C — length */}
          <FormSection letter="C" title="Number of questions" hint="Short sets are perfect for a daily check-in." last>
            <BubbleRow
              label="Number of questions"
              options={QUESTION_COUNTS.map((count) => ({ value: count, label: String(count) }))}
              value={questionLimit}
              onChange={setQuestionLimit}
              size="lg"
            />
          </FormSection>
        </div>

        {/* Admit card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-xl border border-ink bg-sheet shadow-[6px_6px_0_var(--color-ink)]">
            <div className="flex items-center justify-between bg-ink px-5 py-3 text-white">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Admit card</span>
              <span className="font-mono text-[11px] text-white/60">Practice</span>
            </div>

            <dl className="divide-y divide-dashed divide-rule px-5 text-sm">
              <TicketRow label={scopeKind} value={scopeTitle} />
              <TicketRow label="Level" value={difficultyLabel} />
              <TicketRow label="Questions" value={String(questionLimit)} />
              <TicketRow label="Est. time" value={`~${questionLimit} min`} />
              <TicketRow label="Marking" value="Instant, with explanations" />
            </dl>

            {/* perforation */}
            <div className="relative my-1 border-t-2 border-dashed border-rule">
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-ink bg-paper" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full border border-ink bg-paper" />
            </div>

            <div className="p-5">
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-md border border-exam-red/30 bg-[#fbecec] px-3 py-2.5 text-sm leading-6 text-exam-red">
                  <AlertTriangle size={16} className="mt-1 shrink-0" />
                  {error}
                </div>
              )}

              {isSignedIn ? (
                <button
                  type="button"
                  onClick={handleStartPractice}
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Preparing your paper…
                    </>
                  ) : (
                    <>
                      Begin practice
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              ) : (
                <>
                  <p className="mb-3 flex items-start gap-2 text-xs leading-5 text-ink-soft">
                    <LogIn size={14} className="mt-0.5 shrink-0 text-exam-blue" />
                    Sign in to have your answers marked and your progress saved.
                  </p>
                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black"
                  >
                    Log in to practise
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/signup"
                    className="mt-2 flex w-full items-center justify-center rounded-md border border-ink/25 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/60"
                  >
                    Create an account
                  </Link>
                </>
              )}

              <p className="mt-4 hidden items-center justify-center gap-1.5 text-[11px] text-ink-soft lg:flex">
                <Keyboard size={12} />
                Keys <PaperKbd>1</PaperKbd>–<PaperKbd>4</PaperKbd> answer · <PaperKbd>Enter</PaperKbd> continues
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile: keep the start action reachable (leaves room for the tutor bubble) */}
        <div className="sticky bottom-4 z-30 mr-16 lg:hidden">
          <div className="flex items-center gap-3 rounded-lg border border-ink bg-sheet p-2 pl-4 shadow-[4px_4px_0_var(--color-ink)]">
            <p className="min-w-0 flex-1 truncate text-xs text-ink-soft">
              <span className="font-semibold text-ink">{scopeTitle}</span> · {difficultyLabel} · {questionLimit} Qs
            </p>
            {isSignedIn ? (
              <button
                type="button"
                onClick={handleStartPractice}
                disabled={loading}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
              >
                {loading ? "Preparing…" : "Begin"}
                {!loading && <ArrowRight size={15} />}
              </button>
            ) : (
              <Link href="/login" className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white">
                Log in
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading || questions.length === 0) {
    return (
      <ExamShell eyebrow="Practice" title={scopeTitle} onExit={handleChangePractice}>
        <div className="flex h-full flex-col items-center justify-center gap-4 py-24">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-rule border-t-ink" />
          <p className="font-serif text-lg italic text-ink-soft">Printing your question paper…</p>
        </div>
      </ExamShell>
    );
  }

  // ==========================================================
  // CURRENT QUESTION
  // ==========================================================

  const question = questions[currentQuestion];

  const revealedAnswer = revealed[question.id];

  const isCorrect =
    submitted &&
    revealedAnswer !== undefined &&
    selectedAnswer === revealedAnswer.correctAnswer;

  const isLast = currentQuestion === questions.length - 1;

  const questionMeta =
    DIFFICULTY_META[question.difficulty] ?? DIFFICULTY_META.easy;

  // ==========================================================
  // QUIZ — exam mode
  // ==========================================================

  return (
    <ExamShell
      eyebrow={`Practice · ${difficultyLabel}`}
      title={scopeTitle}
      onExit={() => setConfirmExit(true)}
      center={
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-white/50">
            Q{String(currentQuestion + 1).padStart(2, "0")}/{String(questions.length).padStart(2, "0")}
          </span>
          <div className="flex w-56 gap-1" aria-hidden="true">
            {questionStates.map((state, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  state === "correct"
                    ? "bg-[#3ecf8e]"
                    : state === "wrong"
                      ? "bg-[#ff6b6b]"
                      : index === currentQuestion
                        ? "bg-white"
                        : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      }
      right={
        <div className="flex items-center gap-2">
          {sessionStats.current >= 2 && (
            <span
              key={sessionStats.current}
              className="ql-pop inline-flex items-center gap-1 rounded-md bg-amber-400 px-2 py-1 text-xs font-bold text-ink"
              title="Correct answers in a row"
            >
              <Flame size={13} />
              {sessionStats.current}
            </span>
          )}
          <span className="rounded-md border border-white/15 px-2 py-1 font-mono text-xs text-white/80" title="Correct so far">
            {sessionStats.correct}/{sessionStats.answered} ✓
          </span>
        </div>
      }
      footer={
        <PracticeFooter
          submitted={submitted}
          isCorrect={isCorrect}
          correctLetter={String.fromCharCode(65 + (revealedAnswer?.correctAnswer ?? 0))}
          explanation={revealedAnswer?.explanation}
          topic={question.topic}
          streak={sessionStats.current}
          canCheck={selectedAnswer !== null}
          checking={checkingAnswer}
          saving={savingResult}
          isLast={isLast}
          error={checkError || resultError}
          onCheck={() => void handleSubmitAnswer()}
          onNext={() => void handleNext()}
          onReport={() => {
            setShowReportForm(true);
            setReportError("");
            setReportSuccess("");
          }}
        />
      }
    >
      <div key={question.id} className="ql-enter mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12" style={{ animationDuration: "0.4s" }}>
        {/* mobile progress */}
        <div className="mb-6 flex gap-1 md:hidden" aria-hidden="true">
          {questionStates.map((state, index) => (
            <span
              key={index}
              className={`h-1 flex-1 rounded-full ${
                state === "correct" ? "bg-exam-green" : state === "wrong" ? "bg-exam-red" : index === currentQuestion ? "bg-ink" : "bg-ink/15"
              }`}
            />
          ))}
        </div>

        <div className="flex items-start gap-4 sm:gap-6">
          <span className="font-serif text-5xl font-medium leading-none text-ink/20 sm:text-6xl">
            {String(currentQuestion + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
              <span className="font-semibold uppercase tracking-[0.14em] text-exam-blue">{question.topic}</span>
              <span className="h-3 w-px bg-rule" />
              <span className={`inline-flex items-center gap-1.5 font-semibold capitalize ${questionMeta.text}`}>
                <SignalBars level={questionMeta.level} className="" />
                {question.difficulty}
              </span>
              {question.chapterNumber ? (
                <>
                  <span className="h-3 w-px bg-rule" />
                  <span>Chapter {question.chapterNumber}</span>
                </>
              ) : null}
            </div>
            <h2 className="mt-3 font-serif text-[1.6rem] font-medium leading-[1.3] tracking-[-0.01em] sm:text-[2rem]">
              {question.question}
            </h2>
          </div>
        </div>

        <div role="radiogroup" aria-label="Answer options" className="mt-9 space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = submitted && index === revealedAnswer?.correctAnswer;
            const isWrongSelection = submitted && isSelected && !isCorrect;

            const state: OmrState = isCorrectOption
              ? "correct"
              : isWrongSelection
                ? "wrong"
                : submitted
                  ? "dimmed"
                  : isSelected
                    ? "selected"
                    : "idle";

            return (
              <OmrOption
                key={`${question.id}-${index}`}
                letter={String.fromCharCode(65 + index)}
                text={option}
                state={state}
                disabled={submitted}
                shortcut={String(index + 1)}
                onSelect={() => handleSelectAnswer(index)}
              />
            );
          })}
        </div>

        {reportSuccess && (
          <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-exam-green">
            <CheckCircle2 size={16} />
            {reportSuccess}
          </p>
        )}
      </div>

      {/* Report dialog */}
      <ConfirmDialog
        open={showReportForm}
        title="Report this question"
        confirmLabel={submittingReport ? "Sending…" : "Send report"}
        tone="danger"
        busy={submittingReport}
        confirmDisabled={!reportReason}
        onConfirm={() => void handleSubmitQuestionReport()}
        onCancel={() => {
          setShowReportForm(false);
          setReportReason("");
          setReportDetails("");
          setReportError("");
        }}
      >
        <p className="text-ink">What&apos;s wrong with question {currentQuestion + 1}?</p>
        <div role="radiogroup" aria-label="Reason" className="mt-3 flex flex-wrap gap-2">
          {REPORT_REASONS.map((reason) => (
            <TopicTag
              key={reason.value}
              active={reportReason === reason.value}
              onClick={() => {
                setReportReason(reason.value);
                setReportError("");
              }}
            >
              {reason.label}
            </TopicTag>
          ))}
        </div>
        <label htmlFor="question-report-details" className="mt-4 block text-xs font-semibold text-ink">
          Details <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <textarea
          id="question-report-details"
          value={reportDetails}
          onChange={(event) => {
            setReportDetails(event.target.value);
            setReportError("");
          }}
          maxLength={5000}
          rows={3}
          placeholder="What should be corrected?"
          className="mt-1.5 w-full resize-y rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none focus:border-exam-blue focus:ring-2 focus:ring-exam-blue/15"
        />
        {reportError && <p className="mt-2 text-sm text-exam-red">{reportError}</p>}
      </ConfirmDialog>

      {/* Leave confirmation */}
      <ConfirmDialog
        open={confirmExit}
        title="Leave this practice set?"
        confirmLabel="Leave set"
        cancelLabel="Keep going"
        tone="danger"
        onConfirm={() => {
          setConfirmExit(false);
          handleChangePractice();
        }}
        onCancel={() => setConfirmExit(false)}
      >
        You&apos;ve answered {sessionStats.answered} of {questions.length} questions. Results
        for an unfinished set aren&apos;t saved.
      </ConfirmDialog>
    </ExamShell>
  );
}

export default function PracticeQuiz(
  props: PracticeQuizProps,
) {
  return (
    <Suspense
      fallback={
        <div className="ql-sheet flex items-center justify-center gap-3 rounded-xl border border-rule px-6 py-20 text-ink-soft">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-rule border-t-ink" />
          Loading practice…
        </div>
      }
    >
      <PracticeQuizContent {...props} />
    </Suspense>
  );
}

// ============================================================
// PRESENTATION HELPERS
// ============================================================

type QuestionState = "pending" | "correct" | "wrong";

const QUESTION_COUNTS = [5, 10, 15, 20];

const REPORT_REASONS = [
  { value: "wrong_answer", label: "Wrong answer" },
  { value: "ambiguous_question", label: "Ambiguous" },
  { value: "incorrect_explanation", label: "Bad explanation" },
  { value: "typo", label: "Typo" },
  { value: "too_difficult", label: "Too difficult" },
  { value: "other", label: "Other" },
];

const DIFFICULTY_META: Record<
  Difficulty,
  { level: 1 | 2 | 3; blurb: string; text: string }
> = {
  easy: { level: 1, blurb: "Definitions and core ideas", text: "text-exam-green" },
  medium: { level: 2, blurb: "Apply concepts to problems", text: "text-exam-amber" },
  difficult: { level: 3, blurb: "Multi-step reasoning", text: "text-exam-red" },
};

function PracticeFooter({
  submitted,
  isCorrect,
  correctLetter,
  explanation,
  topic,
  streak,
  canCheck,
  checking,
  saving,
  isLast,
  error,
  onCheck,
  onNext,
  onReport,
}: {
  submitted: boolean;
  isCorrect: boolean;
  correctLetter: string;
  explanation?: string;
  topic: string;
  streak: number;
  canCheck: boolean;
  checking: boolean;
  saving: boolean;
  isLast: boolean;
  error: string;
  onCheck: () => void;
  onNext: () => void;
  onReport: () => void;
}) {
  if (submitted) {
    return (
      <div
        role="status"
        className={`ql-sheet-up shrink-0 border-t-2 ${
          isCorrect ? "border-exam-green bg-[#e3f4ea]" : "border-exam-red bg-[#fbe7e7]"
        }`}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${
              isCorrect ? "bg-exam-green" : "bg-exam-red"
            }`}
          >
            {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`font-serif text-2xl font-semibold ${isCorrect ? "text-exam-green" : "text-exam-red"}`}>
              {isCorrect ? (streak >= 3 ? `Correct — ${streak} in a row!` : "Correct!") : `Not quite — it's ${correctLetter}.`}
            </p>
            {explanation && <p className="mt-1 text-sm leading-6 text-ink/80">{explanation}</p>}
            <Link
              href={`/ai-tutor?topic=${encodeURIComponent(topic)}`}
              className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-exam-blue hover:underline"
            >
              <Bot size={13} />
              Go deeper with the AI tutor
            </Link>
            {error && <p className="mt-1 text-sm text-exam-red">{error}</p>}
          </div>
          <button
            type="button"
            onClick={onNext}
            disabled={saving}
            autoFocus
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-bold text-white transition-colors disabled:cursor-wait disabled:opacity-70 ${
              isCorrect ? "bg-exam-green hover:bg-[#086637]" : "bg-exam-red hover:bg-[#a82222]"
            }`}
          >
            {saving ? "Marking…" : isLast ? "See my result" : "Continue"}
            {!saving && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-rule bg-sheet">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={onReport}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-exam-red"
        >
          <Flag size={13} />
          <span className="hidden sm:inline">Report question</span>
        </button>
        <p className="ml-auto hidden items-center gap-1.5 text-xs text-ink-soft lg:flex">
          Press <PaperKbd>1</PaperKbd>–<PaperKbd>4</PaperKbd> then <PaperKbd>Enter</PaperKbd>
        </p>
        {error && <p className="ml-auto text-sm text-exam-red lg:ml-0">{error}</p>}
        <button
          type="button"
          onClick={onCheck}
          disabled={!canCheck || checking}
          className="ml-auto inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40 lg:ml-0"
        >
          {checking ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Checking…
            </>
          ) : (
            "Check answer"
          )}
        </button>
      </div>
    </div>
  );
}

function FormSection({
  letter,
  title,
  hint,
  last,
  children,
}: {
  letter: string;
  title: string;
  hint: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`grid gap-4 px-5 py-6 sm:grid-cols-[150px_1fr] sm:gap-6 sm:px-8 ${last ? "" : "border-b border-rule"}`}>
      <div>
        <p className="font-serif text-sm italic text-ink-soft">Section {letter}</p>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-ink-soft">{hint}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function FormBubble({ filled }: { filled: boolean }) {
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink/70 bg-white">
      {filled && <span className="ql-bubble-fill absolute inset-[2.5px] rounded-full bg-ink" />}
    </span>
  );
}

function SyllabusRow({
  active,
  onClick,
  code,
  title,
  meta,
}: {
  active: boolean;
  onClick: () => void;
  code: string;
  title: string;
  meta: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex w-full items-center gap-4 px-4 py-3 text-left transition-colors ${
        active ? "bg-[#eef1ff]" : "bg-sheet hover:bg-white"
      }`}
    >
      <FormBubble filled={active} />
      <span className="w-8 shrink-0 font-mono text-xs font-semibold text-ink-soft">{code}</span>
      <span className={`min-w-0 flex-1 text-sm ${active ? "font-semibold text-ink" : "text-ink/85"}`}>{title}</span>
      <span className="hidden shrink-0 text-xs text-ink-soft sm:inline">{meta}</span>
    </button>
  );
}

function BubbleRow<T extends number>({
  label,
  options,
  value,
  onChange,
  size = "md",
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  size?: "md" | "lg";
}) {
  const dimension = size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm";

  return (
    <div role="radiogroup" aria-label={label} className="mt-3 flex flex-wrap gap-2.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative flex items-center justify-center rounded-full border-[1.5px] font-serif font-semibold tabular-nums transition-colors ${dimension} ${
              active ? "border-ink text-white" : "border-ink/50 bg-white text-ink hover:border-ink"
            }`}
          >
            {active && <span className="ql-bubble-fill absolute inset-[3px] rounded-full bg-ink" />}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TopicTag({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active ? "border-ink bg-ink text-white" : "border-rule bg-white text-ink/75 hover:border-ink/50 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">{label}</dt>
      <dd className="text-right font-serif text-[15px] font-semibold leading-5">{value}</dd>
    </div>
  );
}

function SignalBars({ level, className }: { level: 1 | 2 | 3; className: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex items-end gap-[2px] ${className}`}>
      {[1, 2, 3].map((bar) => (
        <span
          key={bar}
          className={`w-[3px] rounded-sm ${bar <= level ? "bg-current" : "bg-current opacity-20"}`}
          style={{ height: `${4 + bar * 3}px` }}
        />
      ))}
    </span>
  );
}

function PaperKbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-rule bg-paper px-1.5 py-px font-mono text-[10px] text-ink">
      {children}
    </kbd>
  );
}

function ScriptStat({ label, value, tone }: { label: string; value: React.ReactNode; tone: string }) {
  return (
    <div className="border-rule py-3 pr-3 [&:not(:last-child)]:sm:border-r sm:px-4 first:sm:pl-0">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">{label}</dt>
      <dd className={`mt-0.5 font-serif text-3xl font-semibold tabular-nums ${tone}`}>{value}</dd>
    </div>
  );
}

function ScriptAnswer({
  label,
  letter,
  text,
  tone,
}: {
  label: string;
  letter: string;
  text: string | undefined;
  tone: "right" | "wrong";
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-serif text-xs font-bold text-white ${
          tone === "right" ? "bg-exam-green" : "bg-exam-red"
        }`}
      >
        {letter}
      </span>
      <p>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">{label} · </span>
        <span className={tone === "wrong" ? "text-exam-red line-through decoration-1" : "text-ink"}>{text}</span>
      </p>
    </div>
  );
}

/** Hand-drawn red-pen tick or cross for the answer script margin. */
function PenMark({ correct }: { correct: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 text-exam-red" aria-label={correct ? "Correct" : "Incorrect"}>
      {correct ? (
        <path d="M7 22 C 11 25, 14 29, 16 32 C 21 21, 27 12, 35 6" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <g fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
          <path d="M9 9 C 17 17, 24 25, 32 32" />
          <path d="M31 8 C 24 16, 16 24, 9 32" />
        </g>
      )}
    </svg>
  );
}

/** Score written in red pen and circled, like a marked exam paper. */
function RedPenScore({ score, total }: { score: number; total: number }) {
  return (
    <div className="relative mx-auto flex h-40 w-52 items-center justify-center">
      <svg viewBox="0 0 220 160" className="absolute inset-0 h-full w-full text-exam-red" aria-hidden="true">
        <path
          d="M30 86 C 22 40, 92 14, 140 20 C 196 27, 214 70, 196 110 C 176 150, 82 156, 44 128 C 24 112, 26 92, 48 70"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          className="ql-ring"
          style={{ "--ql-ring-from": "1", "--ql-ring-to": "0" } as React.CSSProperties}
        />
      </svg>
      <p className="relative font-serif text-exam-red" aria-label={`Score ${score} out of ${total}`}>
        <span className="text-7xl font-semibold italic leading-none tabular-nums">{score}</span>
        <span className="ml-1 text-3xl italic">/{total}</span>
      </p>
    </div>
  );
}
