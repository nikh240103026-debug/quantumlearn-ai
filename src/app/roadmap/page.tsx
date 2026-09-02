import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  ArrowRight,
  Atom,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Circle,
  Code2,
  Cpu,
  FlaskConical,
  Lock,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  duration_minutes: number | null;
};

type ProgressRow = {
  lesson_id: string;
  progress: number | null;
  completed: boolean;
};

type RoadmapStage = {
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  topics: string[];
  icon: typeof Atom;
  practiceChapter: number;
  tutorTopic: string;
};

const ROADMAP_STAGES: RoadmapStage[] = [
  {
    number: 1,
    title: "Quantum Foundations & Mathematics",
    shortTitle: "Foundations",
    description:
      "Build the mathematical and conceptual foundation required to understand quantum computing.",
    topics: [
      "Complex numbers",
      "Linear algebra",
      "Vectors & matrices",
      "Probability",
      "Quantum notation",
    ],
    icon: Atom,
    practiceChapter: 1,
    tutorTopic: "Quantum Foundations & Mathematics",
  },
  {
    number: 2,
    title: "Quantum Mechanics Foundations",
    shortTitle: "Quantum Mechanics",
    description:
      "Understand the physical principles that make quantum information different from classical information.",
    topics: [
      "Quantum states",
      "Superposition",
      "Observables",
      "Operators",
      "Unitary evolution",
    ],
    icon: Brain,
    practiceChapter: 2,
    tutorTopic: "Quantum Mechanics Foundations",
  },
  {
    number: 3,
    title: "Qubits, States & Quantum Gates",
    shortTitle: "Qubits & Gates",
    description:
      "Learn how qubits represent information and how quantum gates transform their states.",
    topics: [
      "Qubit representation",
      "Bloch sphere",
      "Pauli gates",
      "Hadamard gate",
      "Rotation gates",
    ],
    icon: Cpu,
    practiceChapter: 3,
    tutorTopic: "Qubits, States & Quantum Gates",
  },
  {
    number: 4,
    title: "Quantum Measurement & Entanglement",
    shortTitle: "Measurement",
    description:
      "Understand measurement, probability, entanglement and the correlations between quantum systems.",
    topics: [
      "Measurement",
      "Born rule",
      "Entanglement",
      "Bell states",
      "Quantum correlations",
    ],
    icon: Zap,
    practiceChapter: 4,
    tutorTopic: "Quantum Measurement & Entanglement",
  },
  {
    number: 5,
    title: "Quantum Circuits & Computational Model",
    shortTitle: "Quantum Circuits",
    description:
      "Move from individual gates to complete quantum circuits and computational workflows.",
    topics: [
      "Circuit model",
      "Multi-qubit circuits",
      "CNOT",
      "Circuit depth",
      "Interference",
    ],
    icon: Code2,
    practiceChapter: 5,
    tutorTopic: "Quantum Circuits & Computational Model",
  },
  {
    number: 6,
    title: "Quantum Algorithms",
    shortTitle: "Algorithms",
    description:
      "Study the major algorithms that demonstrate how quantum computation can solve specific problems differently.",
    topics: [
      "Deutsch-Jozsa",
      "Grover's algorithm",
      "Quantum Fourier Transform",
      "Phase estimation",
      "Shor's algorithm",
    ],
    icon: Brain,
    practiceChapter: 6,
    tutorTopic: "Quantum Algorithms",
  },
  {
    number: 7,
    title: "Quantum Information & Communication",
    shortTitle: "Information",
    description:
      "Explore quantum information theory, communication protocols and quantum channels.",
    topics: [
      "Density matrices",
      "Quantum channels",
      "Entropy",
      "Fidelity",
      "Quantum communication",
    ],
    icon: Sparkles,
    practiceChapter: 7,
    tutorTopic: "Quantum Information & Communication",
  },
  {
    number: 8,
    title: "Quantum Hardware & Physical Systems",
    shortTitle: "Hardware",
    description:
      "Understand how real quantum computers are physically built and controlled.",
    topics: [
      "Superconducting qubits",
      "Trapped ions",
      "Photonic qubits",
      "Quantum control",
      "Cryogenics",
    ],
    icon: FlaskConical,
    practiceChapter: 8,
    tutorTopic: "Quantum Hardware & Physical Systems",
  },
  {
    number: 9,
    title: "Quantum Noise & Error Correction",
    shortTitle: "Error Correction",
    description:
      "Learn why real quantum systems are noisy and how quantum error correction addresses those limitations.",
    topics: [
      "Decoherence",
      "Noise models",
      "T1 & T2",
      "Quantum error correction",
      "Surface codes",
    ],
    icon: Target,
    practiceChapter: 9,
    tutorTopic: "Quantum Noise & Error Correction",
  },
  {
    number: 10,
    title: "Quantum Programming & Advanced Computing",
    shortTitle: "Advanced",
    description:
      "Bring everything together through quantum programming, advanced algorithms and practical quantum workflows.",
    topics: [
      "Qiskit",
      "Quantum programming",
      "Variational algorithms",
      "Hybrid computing",
      "Advanced applications",
    ],
    icon: Award,
    practiceChapter: 10,
    tutorTopic: "Quantum Programming & Advanced Computing",
  },
];

function getDisplayName(
  user: {
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  },
): string {
  const metadata = user.user_metadata ?? {};

  const candidates = [
    metadata.full_name,
    metadata.name,
    metadata.display_name,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "Learner";
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "QL";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getStageStatus(
  stageNumber: number,
  currentStage: number,
): "completed" | "current" | "upcoming" {
  if (stageNumber < currentStage) {
    return "completed";
  }

  if (stageNumber === currentStage) {
    return "current";
  }

  return "upcoming";
}

function getProgressLabel(progress: number): string {
  if (progress <= 0) {
    return "Not started";
  }

  if (progress >= 100) {
    return "Roadmap complete";
  }

  return `${progress}% complete`;
}

export default async function RoadmapPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = getDisplayName(user);
  const initials = getInitials(displayName);

  // ------------------------------------------------------------
  // CURRENT PUBLISHED COURSE
  // ------------------------------------------------------------

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, level")
    .eq("slug", "quantum-computing-fundamentals")
    .eq("is_published", true)
    .maybeSingle();

  // ------------------------------------------------------------
  // PUBLISHED LESSONS
  // ------------------------------------------------------------

  let lessons: Lesson[] = [];

  if (course?.id) {
    const { data } = await supabase
      .from("lessons")
      .select(
        "id, title, slug, description, order_index, duration_minutes",
      )
      .eq("course_id", course.id)
      .eq("is_published", true)
      .order("order_index", {
        ascending: true,
      });

    lessons = (data ?? []) as Lesson[];
  }

  // ------------------------------------------------------------
  // USER PROGRESS
  // ------------------------------------------------------------

  let progressRows: ProgressRow[] = [];

  if (course?.id) {
    const { data } = await supabase
      .from("user_progress")
      .select("lesson_id, progress, completed")
      .eq("user_id", user.id)
      .eq("course_id", course.id);

    progressRows = (data ?? []) as ProgressRow[];
  }

  // ------------------------------------------------------------
  // REAL COURSE PROGRESS
  // ------------------------------------------------------------

  const totalLessons = lessons.length;

  const completedLessons = progressRows.filter(
    (item) => item.completed,
  ).length;

  const overallProgress =
    totalLessons > 0
      ? Math.min(
          100,
          Math.round(
            (completedLessons / totalLessons) * 100,
          ),
        )
      : 0;

  const averageLessonProgress =
    progressRows.length > 0
      ? Math.min(
          100,
          Math.round(
            progressRows.reduce(
              (total, item) =>
                total + Number(item.progress ?? 0),
              0,
            ) / progressRows.length,
          ),
        )
      : 0;

  // ------------------------------------------------------------
  // NEXT REAL LESSON
  // ------------------------------------------------------------

  const nextLesson =
    lessons.find((lesson) => {
      const progress = progressRows.find(
        (item) => item.lesson_id === lesson.id,
      );

      return !progress?.completed;
    }) ?? null;

  // ------------------------------------------------------------
  // CURRENT ROADMAP STAGE
  //
  // We use the real overall course progress to position the
  // learner on the roadmap. We do NOT invent chapter-level
  // completion percentages.
  // ------------------------------------------------------------

  const currentStage =
    overallProgress >= 100
      ? ROADMAP_STAGES.length
      : Math.min(
          ROADMAP_STAGES.length,
          Math.max(
            1,
            Math.floor(
              (overallProgress /
                100) *
                ROADMAP_STAGES.length,
            ) + 1,
          ),
        );

  const activeStage =
    ROADMAP_STAGES[currentStage - 1] ??
    ROADMAP_STAGES[0];

  const remainingLessons =
    Math.max(
      0,
      totalLessons - completedLessons,
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                <Sparkles size={14} />
                Personalized Learning Roadmap
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Your Quantum Learning Journey
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Follow a structured path from mathematical
                foundations to advanced quantum computing.
                Learn the theory, build circuits, practice
                concepts, and use AI to strengthen your
                understanding.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={
                    nextLesson
                      ? `/learn/${encodeURIComponent(
                          nextLesson.slug,
                        )}`
                      : "/learn"
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  {overallProgress >= 100
                    ? "Review Learning"
                    : "Continue Learning"}
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href={`/ai-tutor?topic=${encodeURIComponent(
                    activeStage.tutorTopic,
                  )}&source=roadmap`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                >
                  <Brain size={16} />
                  Ask AI Tutor
                </Link>
              </div>
            </div>

            {/* User progress card */}

            <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
                  {initials}
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">
                    Learning as
                  </p>

                  <p className="truncate font-semibold text-white">
                    {displayName}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-500">
                    Overall progress
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {overallProgress}%
                  </p>
                </div>

                <p className="text-xs text-slate-500">
                  {completedLessons}/{totalLessons} lessons
                </p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {getProgressLabel(overallProgress)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          PROGRESS SUMMARY
      ======================================================== */}

      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px border-x border-slate-800 bg-slate-800 sm:grid-cols-4">
          <div className="bg-slate-950 px-5 py-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <BookOpen size={14} />
              Lessons
            </div>

            <p className="mt-2 text-2xl font-bold">
              {completedLessons}
              <span className="text-sm font-normal text-slate-600">
                /{totalLessons}
              </span>
            </p>

            <p className="mt-1 text-xs text-slate-600">
              completed
            </p>
          </div>

          <div className="bg-slate-950 px-5 py-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Target size={14} />
              Current stage
            </div>

            <p className="mt-2 text-2xl font-bold">
              {currentStage}
              <span className="text-sm font-normal text-slate-600">
                /10
              </span>
            </p>

            <p className="mt-1 truncate text-xs text-slate-600">
              {activeStage.shortTitle}
            </p>
          </div>

          <div className="bg-slate-950 px-5 py-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Zap size={14} />
              Course progress
            </div>

            <p className="mt-2 text-2xl font-bold">
              {overallProgress}%
            </p>

            <p className="mt-1 text-xs text-slate-600">
              based on completed lessons
            </p>
          </div>

          <div className="bg-slate-950 px-5 py-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Trophy size={14} />
              Remaining
            </div>

            <p className="mt-2 text-2xl font-bold">
              {remainingLessons}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              lessons to complete
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          CURRENT FOCUS
      ======================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-slate-900 to-slate-900 p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <activeStage.icon size={24} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                    {overallProgress >= 100
                      ? "Roadmap Complete"
                      : "Current Focus"}
                  </span>

                  <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-500">
                    Stage {currentStage}
                  </span>
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  {activeStage.title}
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                  {activeStage.description}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={`/practice?chapterNumber=${activeStage.practiceChapter}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                <Target size={14} />
                Practice
              </Link>

              <Link
                href={`/ai-tutor?topic=${encodeURIComponent(
                  activeStage.tutorTopic,
                )}&source=roadmap`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                <Brain size={14} />
                Learn with AI
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ROADMAP
      ======================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-white">
            Quantum Computing Roadmap
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Progress from fundamentals to advanced quantum
            computing.
          </p>
        </div>

        <div className="relative">
          {/* Vertical roadmap line */}

          <div className="absolute bottom-0 left-[23px] top-0 hidden w-px bg-slate-800 sm:block" />

          <div className="space-y-5">
            {ROADMAP_STAGES.map(
              (stage) => {
                const status = getStageStatus(
                  stage.number,
                  currentStage,
                );

                const StageIcon = stage.icon;

                const isCompleted =
                  status === "completed";

                const isCurrent =
                  status === "current";

                return (
                  <article
                    key={stage.number}
                    className={`relative sm:pl-16 ${
                      isCurrent
                        ? "sm:pl-16"
                        : ""
                    }`}
                  >
                    {/* Timeline node */}

                    <div
                      className={`absolute left-0 top-6 hidden h-12 w-12 items-center justify-center rounded-full border sm:flex ${
                        isCompleted
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : isCurrent
                            ? "border-blue-400/50 bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-500/10"
                            : "border-slate-800 bg-slate-900 text-slate-600"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={21} />
                      ) : isCurrent ? (
                        <StageIcon size={21} />
                      ) : (
                        <Lock size={18} />
                      )}
                    </div>

                    <div
                      className={`overflow-hidden rounded-2xl border transition ${
                        isCurrent
                          ? "border-blue-500/30 bg-slate-900 shadow-xl shadow-blue-950/20"
                          : isCompleted
                            ? "border-emerald-500/15 bg-slate-900/70"
                            : "border-slate-800 bg-slate-900/40"
                      }`}
                    >
                      {/* Stage header */}

                      <div className="flex flex-col gap-4 p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:hidden ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-400"
                                : isCurrent
                                  ? "bg-blue-500/10 text-blue-300"
                                  : "bg-slate-800 text-slate-600"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2
                                size={21}
                              />
                            ) : isCurrent ? (
                              <StageIcon
                                size={21}
                              />
                            ) : (
                              <Lock size={18} />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  isCompleted
                                    ? "text-emerald-400"
                                    : isCurrent
                                      ? "text-blue-300"
                                      : "text-slate-600"
                                }`}
                              >
                                {String(
                                  stage.number,
                                ).padStart(
                                  2,
                                  "0",
                                )}
                              </span>

                              {isCompleted && (
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                  Completed
                                </span>
                              )}

                              {isCurrent && (
                                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                                  Current stage
                                </span>
                              )}

                              {status ===
                                "upcoming" && (
                                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                  Upcoming
                                </span>
                              )}
                            </div>

                            <h3
                              className={`mt-1 text-lg font-semibold ${
                                status ===
                                "upcoming"
                                  ? "text-slate-500"
                                  : "text-white"
                              }`}
                            >
                              {stage.title}
                            </h3>

                            <p
                              className={`mt-2 max-w-3xl text-sm leading-6 ${
                                status ===
                                "upcoming"
                                  ? "text-slate-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {stage.description}
                            </p>
                          </div>
                        </div>

                        {/* Topics */}

                        <div className="flex flex-wrap gap-2 sm:ml-[60px]">
                          {stage.topics.map(
                            (topic) => (
                              <span
                                key={topic}
                                className={`rounded-lg border px-2.5 py-1 text-[11px] ${
                                  status ===
                                  "upcoming"
                                    ? "border-slate-800 text-slate-600"
                                    : "border-slate-700 bg-slate-950/50 text-slate-400"
                                }`}
                              >
                                {topic}
                              </span>
                            ),
                          )}
                        </div>

                        {/* Actions */}

                        {status !==
                          "upcoming" && (
                          <div className="flex flex-wrap gap-2 sm:ml-[60px]">
                            <Link
                              href={`/practice?chapterNumber=${stage.practiceChapter}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
                            >
                              Practice
                              <ChevronRight
                                size={13}
                              />
                            </Link>

                            <Link
                              href={`/ai-tutor?topic=${encodeURIComponent(
                                stage.tutorTopic,
                              )}&source=roadmap`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
                            >
                              AI Tutor
                              <ChevronRight
                                size={13}
                              />
                            </Link>
                          </div>
                        )}

                        {status ===
                          "upcoming" && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 sm:ml-[60px]">
                            <Lock size={13} />
                            Complete earlier stages to
                            reach this topic.
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          CONTINUE LEARNING
      ======================================================== */}

      {nextLesson && (
        <section className="border-t border-slate-800 bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950">
                  <BookOpen size={20} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                    Up next
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-white">
                    {nextLesson.title}
                  </h2>

                  {nextLesson.description && (
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                      {nextLesson.description}
                    </p>
                  )}

                  {nextLesson.duration_minutes && (
                    <p className="mt-2 text-xs text-slate-600">
                      {nextLesson.duration_minutes} min
                    </p>
                  )}
                </div>
              </div>

              <Link
                href={`/learn/${encodeURIComponent(
                  nextLesson.slug,
                )}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Continue
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          COURSE EMPTY STATE
      ======================================================== */}

      {!course && (
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
            <Circle className="mx-auto text-amber-400" size={28} />

            <h2 className="mt-3 text-lg font-semibold text-white">
              Course content is not available yet
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The roadmap is ready, but the published
              Quantum Computing Fundamentals course could
              not be found.
            </p>

            <Link
              href="/learn"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Open Learn
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      )}

      {/* ========================================================
          FOOTER CTA
      ======================================================== */}

      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
            <Atom size={24} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
            Build your quantum foundation.
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Learn the mathematics, understand the physics,
            build circuits, run experiments, practice your
            concepts, and use AI Tutor whenever you get
            stuck.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={
                nextLesson
                  ? `/learn/${encodeURIComponent(
                      nextLesson.slug,
                    )}`
                  : "/learn"
              }
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Start Learning
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/quantum-lab"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              <FlaskConical size={16} />
              Open Quantum Lab
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}