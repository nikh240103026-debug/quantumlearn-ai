import {
  isValidTimeZone,
  localDateKey,
} from "@/lib/local-date";

// "Active days" counts distinct days within this many days.
export const ACTIVE_DAYS_WINDOW = 30;

export interface ProgressEngineInput {
  // IANA timezone of the learner (e.g. "Asia/Kolkata"); UTC if unknown.
  timeZone?: string;

  // Reference time for the active-days window (defaults to now).
  now?: Date;

  lessons: Array<{
    id: string;
    progress: number | null;
    completed: boolean | null;
  }>;

  practiceResults: Array<{
    score: number | null;
    total_questions: number | null;
    percentage: number | null;
  }>;

  aiActivities: Array<{
    activity_type: string | null;
    metadata: unknown;
    created_at: string | null;
  }>;

  labActivities: Array<{
    activity_type: string | null;
    created_at: string | null;
    qubits: number | null;
    shots: number | null;
  }>;
}

export interface ProgressAnalytics {
  lessonProgress: number;
  lessonsCompleted: number;
  totalLessons: number;

  practiceAttempts: number;
  practiceAverage: number;
  practiceBest: number;
  questionsAnswered: number;

  codingChallengesCompleted: number;
  codingPoints: number;

  labRuns: number;
  labMeasurements: number;
  maxQubitsUsed: number;

  overallMastery: number;

  recentActiveDays: number;

  totalActivity: number;
}

// Highest point value of any coding challenge
// (see app/api/coding/challenges/submit/route.ts).
const MAX_CHALLENGE_POINTS = 35;

function safeNumber(
  value: unknown,
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function clamp(
  value: number,
  min = 0,
  max = 100,
): number {
  return Math.min(
    max,
    Math.max(
      min,
      value,
    ),
  );
}

export function calculateProgressAnalytics(
  input: ProgressEngineInput,
): ProgressAnalytics {
  const totalLessons =
    input.lessons.length;

  const completedLessons =
    input.lessons.filter(
      (lesson) =>
        lesson.completed === true,
    ).length;

  const lessonProgress =
    totalLessons > 0
      ? Math.round(
          input.lessons.reduce(
            (
              total,
              lesson,
            ) =>
              total +
              clamp(
                safeNumber(
                  lesson.progress,
                ),
              ),
            0,
          ) / totalLessons,
        )
      : 0;

  const practiceAttempts =
    input.practiceResults.length;

  const practiceAverage =
    practiceAttempts > 0
      ? Math.round(
          input.practiceResults.reduce(
            (
              total,
              result,
            ) =>
              total +
              clamp(
                safeNumber(
                  result.percentage,
                ),
              ),
            0,
          ) /
            practiceAttempts,
        )
      : 0;

  const practiceBest =
    practiceAttempts > 0
      ? Math.round(
          Math.max(
            ...input.practiceResults.map(
              (result) =>
                clamp(
                  safeNumber(
                    result.percentage,
                  ),
                ),
            ),
          ),
        )
      : 0;

  const questionsAnswered =
    input.practiceResults.reduce(
      (
        total,
        result,
      ) =>
        total +
        Math.max(
          0,
          Math.floor(
            safeNumber(
              result.total_questions,
            ),
          ),
        ),
      0,
    );

  const codingActivities =
    input.aiActivities.filter(
      (activity) =>
        activity.activity_type ===
        "coding_challenge_completed",
    );

  const uniqueCodingChallenges =
    new Set<string>();

  // Best points per challenge: repeats don't add up, and values are
  // capped in case older rows were written with forged points.
  const pointsByChallenge =
    new Map<string, number>();

  for (
    const activity of codingActivities
  ) {
    if (
      activity.metadata &&
      typeof activity.metadata ===
        "object" &&
      !Array.isArray(
        activity.metadata,
      )
    ) {
      const metadata =
        activity.metadata as Record<
          string,
          unknown
        >;

      const challengeId =
        metadata.challenge_id;

      if (
        typeof challengeId ===
        "string"
      ) {
        uniqueCodingChallenges.add(
          challengeId,
        );

        const points = Math.min(
          MAX_CHALLENGE_POINTS,
          Math.max(
            0,
            safeNumber(
              metadata.points,
            ),
          ),
        );

        pointsByChallenge.set(
          challengeId,
          Math.max(
            pointsByChallenge.get(
              challengeId,
            ) ?? 0,
            points,
          ),
        );
      }
    }
  }

  let codingPoints = 0;

  for (const points of pointsByChallenge.values()) {
    codingPoints += points;
  }

  const labRuns =
    input.labActivities.filter(
      (activity) =>
        activity.activity_type ===
          "circuit_run" ||
        activity.activity_type ===
          "measurement",
    ).length;

  const labMeasurements =
    input.labActivities.filter(
      (activity) =>
        activity.activity_type ===
        "measurement",
    ).length;

  const maxQubitsUsed =
    input.labActivities.reduce(
      (
        maximum,
        activity,
      ) =>
        Math.max(
          maximum,
          Math.floor(
            safeNumber(
              activity.qubits,
            ),
          ),
        ),
      0,
    );

  // Distinct calendar days with activity in the last
  // ACTIVE_DAYS_WINDOW days, in the learner's own timezone.
  const timeZone =
    isValidTimeZone(input.timeZone)
      ? input.timeZone
      : "UTC";

  const windowStart =
    (input.now ?? new Date()).getTime() -
    ACTIVE_DAYS_WINDOW * 24 * 60 * 60 * 1000;

  const activeDates =
    new Set<string>();

  for (
    const activity of [
      ...input.aiActivities,
      ...input.labActivities,
    ]
  ) {
    if (!activity.created_at) {
      continue;
    }

    if (
      new Date(activity.created_at).getTime() <
      windowStart
    ) {
      continue;
    }

    const day = localDateKey(
      activity.created_at,
      timeZone,
    );

    if (day) {
      activeDates.add(day);
    }
  }

  const recentActiveDays =
    activeDates.size;

  /*
   * Transparent mastery formula:
   *
   * 50% curriculum progress
   * 25% practice performance
   * 15% coding performance
   * 10% lab engagement
   */

  const codingMastery =
    codingActivities.length > 0
      ? clamp(
          Math.min(
            100,
            codingPoints,
          ),
        )
      : 0;

  const labMastery =
    labRuns > 0
      ? clamp(
          Math.min(
            100,
            labRuns * 10,
          ),
        )
      : 0;

  const overallMastery =
    Math.round(
      lessonProgress *
        0.5 +
        practiceAverage *
          0.25 +
        codingMastery *
          0.15 +
        labMastery *
          0.1,
    );

  return {
  lessonProgress,
  lessonsCompleted: completedLessons,
  totalLessons,

    practiceAttempts,
    practiceAverage,
    practiceBest,
    questionsAnswered,

    codingChallengesCompleted:
      uniqueCodingChallenges.size,

    codingPoints,

    labRuns,
    labMeasurements,
    maxQubitsUsed,

    overallMastery: clamp(
      overallMastery,
    ),

    recentActiveDays,

    totalActivity:
      input.aiActivities.length +
      input.labActivities.length,
  };
}