import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createSupabaseServerClient,
} from "@/lib/supabase-server";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StudentRow = {
  id: string;
  full_name?: string | null;
  role?: string | null;
  institute?: string | null;
  branch?: string | null;
  quantum_experience?: string | null;
  learning_goal?: string | null;
};

function safeNumber(
  value: unknown,
) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function average(
  values: number[],
) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / values.length,
  );
}

async function getInstructor() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
    error: authError,
  } =
    await supabase.auth.getUser();

  if (
    authError ||
    !user
  ) {
    return {
      supabase,
      user: null,
      profile: null,
      error:
        NextResponse.json(
          {
            error:
              "Authentication required.",
          },
          {
            status: 401,
          },
        ),
    };
  }

  const {
    data: profile,
    error: profileError,
  } =
    await supabase
      .from("profiles")
      .select(
        "id, role, full_name",
      )
      .eq(
        "id",
        user.id,
      )
      .maybeSingle();

  if (
    profileError
  ) {
    return {
      supabase,
      user,
      profile: null,
      error:
        NextResponse.json(
          {
            error:
              "Unable to verify instructor access.",
          },
          {
            status: 500,
          },
        ),
    };
  }

  const allowedRoles = [
    "admin",
    "tutor",
  ];

  if (
    !profile ||
    !allowedRoles.includes(
      profile.role,
    )
  ) {
    return {
      supabase,
      user,
      profile,
      error:
        NextResponse.json(
          {
            error:
              "Instructor access required.",
          },
          {
            status: 403,
          },
        ),
    };
  }

  return {
    supabase,
    user,
    profile,
    error: null,
  };
}

export async function GET(
  request: NextRequest,
) {
  try {
    const {
      error: accessError,
    } = await getInstructor();

    if (accessError) {
      return accessError;
    }

    const admin =
      createSupabaseAdminClient();

    const studentId =
      request.nextUrl.searchParams.get(
        "id",
      );

    const {
      data: profiles,
      error:
        profilesError,
    } =
      await admin
        .from("profiles")
        .select(
          "id, full_name, role, institute, branch, quantum_experience, learning_goal",
        )
        .eq(
          "role",
          "student",
        )
        .order(
          "full_name",
          {
            ascending: true,
          },
        );

    if (
      profilesError
    ) {
      return NextResponse.json(
        {
          error:
            "Unable to load students.",
        },
        {
          status: 500,
        },
      );
    }

    const students =
      (profiles ??
        []) as StudentRow[];

    const selectedIds =
      studentId
        ? students
            .filter(
              (student) =>
                student.id ===
                studentId,
            )
            .map(
              (student) =>
                student.id,
            )
        : students.map(
            (student) =>
              student.id,
          );

    if (
      studentId &&
      selectedIds.length ===
        0
    ) {
      return NextResponse.json(
        {
          error:
            "Student not found.",
        },
        {
          status: 404,
        },
      );
    }

    const [
      progressResult,
      practiceResult,
      activityResult,
      labResult,
    ] = await Promise.all([
      admin
        .from("user_progress")
        .select(
          "user_id, progress, completed",
        )
        .in(
          "user_id",
          selectedIds,
        ),

      admin
        .from(
          "practice_results",
        )
        .select(
          "user_id, percentage, score, total_questions, completed_at",
        )
        .in(
          "user_id",
          selectedIds,
        )
        .order(
          "completed_at",
          {
            ascending:
              false,
          },
        ),

      admin
        .from("ai_activity")
        .select(
          "user_id, activity_type, topic, created_at, metadata",
        )
        .in(
          "user_id",
          selectedIds,
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          },
        )
        .limit(
          2000,
        ),

      admin
        .from(
          "quantum_lab_activity",
        )
        .select(
          "user_id, activity_type, qubits, shots, metadata, created_at",
        )
        .in(
          "user_id",
          selectedIds,
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          },
        )
        .limit(
          2000,
        ),
    ]);

    if (
      progressResult.error ||
      practiceResult.error ||
      activityResult.error ||
      labResult.error
    ) {
      console.error(
        "Instructor analytics query error:",
        progressResult.error ??
          practiceResult.error ??
          activityResult.error ??
          labResult.error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load student analytics.",
        },
        {
          status: 500,
        },
      );
    }

    const progress =
      progressResult.data ??
      [];

    const practices =
      practiceResult.data ??
      [];

    const activities =
      activityResult.data ??
      [];

    const labs =
      labResult.data ??
      [];

    const analytics =
      students.map(
        (student) => {
          const studentProgress =
            progress.filter(
              (item) =>
                item.user_id ===
                student.id,
            );

          const studentPractice =
            practices.filter(
              (item) =>
                item.user_id ===
                student.id,
            );

          const studentActivities =
            activities.filter(
              (item) =>
                item.user_id ===
                student.id,
            );

          const studentLabs =
            labs.filter(
              (item) =>
                item.user_id ===
                student.id,
            );

          const progressValues =
            studentProgress.map(
              (item) =>
                Math.min(
                  100,
                  Math.max(
                    0,
                    safeNumber(
                      item.progress,
                    ),
                  ),
                ),
            );

          const practiceValues =
            studentPractice.map(
              (item) =>
                Math.min(
                  100,
                  Math.max(
                    0,
                    safeNumber(
                      item.percentage,
                    ),
                  ),
            ));

          const completedLessons =
            studentProgress.filter(
              (item) =>
                item.completed ===
                true,
            ).length;

          const codingCompleted =
            studentActivities.filter(
              (item) =>
                item.activity_type ===
                "coding_challenge_completed",
            );

          const codingPoints =
            codingCompleted.reduce(
              (
                total,
                activity,
              ) => {
                const metadata =
                  activity.metadata;

                if (
                  !metadata ||
                  typeof metadata !==
                    "object" ||
                  Array.isArray(
                    metadata,
                  )
                ) {
                  return total;
                }

                return (
                  total +
                  Math.max(
                    0,
                    safeNumber(
                      (
                        metadata as Record<
                          string,
                          unknown
                        >
                      ).points,
                    ),
                  )
                );
              },
              0,
            );

          const activeDates =
            new Set<string>();

          for (
            const activity of studentActivities
          ) {
            if (
              activity.created_at
            ) {
              activeDates.add(
                activity.created_at.slice(
                  0,
                  10,
                ),
              );
            }
          }

          for (
            const lab of studentLabs
          ) {
            if (
              lab.created_at
            ) {
              activeDates.add(
                lab.created_at.slice(
                  0,
                  10,
                ),
              );
            }
          }

          const recentActivity =
            [
              ...studentActivities,
              ...studentLabs,
            ]
              .sort(
                (a, b) =>
                  new Date(
                    b.created_at,
                  ).getTime() -
                  new Date(
                    a.created_at,
                  ).getTime(),
              )
              .slice(
                0,
                5,
              );

          return {
            id: student.id,
            name:
              student.full_name ??
              "Student",
            institute:
              student.institute ??
              "—",
            branch:
              student.branch ??
              "—",
            quantumExperience:
              student.quantum_experience ??
              "—",
            learningGoal:
              student.learning_goal ??
              null,

            lessonProgress:
              average(
                progressValues,
              ),

            completedLessons,

            practiceAverage:
              average(
                practiceValues,
              ),

            practiceAttempts:
              studentPractice.length,

            codingChallenges:
              codingCompleted.length,

            codingPoints,

            labRuns:
              studentLabs.filter(
                (item) =>
                  item.activity_type ===
                  "circuit_run",
              ).length,

            labMeasurements:
              studentLabs.filter(
                (item) =>
                  item.activity_type ===
                  "measurement",
              ).length,

            activeDays:
              activeDates.size,

            lastActivity:
              recentActivity[0]
                ?.created_at ??
              null,
          };
        },
      );

    if (
      studentId
    ) {
      const student =
        analytics.find(
          (item) =>
            item.id ===
            studentId,
        );

      const studentProgress =
        progress.filter(
          (item) =>
            item.user_id ===
            studentId,
        );

      const studentPractice =
        practices.filter(
          (item) =>
            item.user_id ===
            studentId,
        );

      const studentActivities =
        activities
          .filter(
            (item) =>
              item.user_id ===
              studentId,
          )
          .slice(
            0,
            50,
          );

      const studentLabs =
        labs
          .filter(
            (item) =>
              item.user_id ===
              studentId,
          )
          .slice(
            0,
            50,
          );

      return NextResponse.json(
        {
          student,
          progress:
            studentProgress,
          practice:
            studentPractice,
          activities:
            studentActivities,
          labActivity:
            studentLabs,
        },
        {
          status: 200,
        },
      );
    }

    const totalStudents =
      analytics.length;

    const activeStudents =
      analytics.filter(
        (student) =>
          student.activeDays >
          0,
      ).length;

    const averageMastery =
      average(
        analytics.map(
          (student) =>
            Math.round(
              student.lessonProgress *
                0.5 +
                student.practiceAverage *
                  0.25 +
                Math.min(
                  100,
                  student.codingPoints,
                ) *
                  0.15 +
                Math.min(
                  100,
                  student.labRuns *
                    10,
                ) *
                  0.1,
            ),
        ),
      );

    const totalLabRuns =
      analytics.reduce(
        (
          total,
          student,
        ) =>
          total +
          student.labRuns,
        0,
      );

    const totalCodingPoints =
      analytics.reduce(
        (
          total,
          student,
        ) =>
          total +
          student.codingPoints,
        0,
      );

    return NextResponse.json(
      {
        summary: {
          totalStudents,
          activeStudents,
          averageMastery,
          totalLabRuns,
          totalCodingPoints,
        },
        students: analytics,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Instructor students API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load instructor analytics.",
      },
      {
        status: 500,
      },
    );
  }
}