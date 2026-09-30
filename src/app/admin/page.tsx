import Link from "next/link";

import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  ClipboardList,
  FileQuestion,
  Flag,
  FlaskConical,
  GraduationCap,
  MessageSquare,
  Network,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { requireAdmin } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type CountResult = {
  count: number | null;
  error: unknown;
};

type Metric = {
  label: string;
  value: number | null;
  detail: string;
  href: string;
  icon: typeof Users;
};

async function getTableCount(
  supabase: ReturnType<
    typeof createSupabaseAdminClient
  >,
  table: string,
): Promise<CountResult> {
  const {
    count,
    error,
  } =
    await supabase
      .from(table)
      .select("*", {
        count: "exact",
        head: true,
      });

  if (error) {
    console.error(
      `[ADMIN_DASHBOARD] Failed to count ${table}:`,
      error,
    );
  }

  return {
    count:
      error
        ? null
        : count ?? 0,
    error,
  };
}

export default async function AdminDashboardPage() {
  const admin =
    await requireAdmin();

  const supabase =
    createSupabaseAdminClient();

  /*
   * ------------------------------------------------------------
   * ADMIN PROFILE
   * ------------------------------------------------------------
   *
   * IMPORTANT:
   * email is NOT read from profiles.
   * It comes from Supabase Auth through admin.email.
   */

  const {
    data: profile,
    error: profileError,
  } =
    await supabase
      .from("profiles")
      .select(
        `
          full_name,
          username,
          institute,
          branch,
          role,
          avatar_url
        `,
      )
      .eq(
        "id",
        admin.id,
      )
      .maybeSingle();

  if (profileError) {
    console.error(
      "[ADMIN_DASHBOARD] Failed to load administrator profile:",
      profileError,
    );
  }

  const adminName =
    profile?.full_name?.trim() ||
    profile?.username?.trim() ||
    admin.full_name?.trim() ||
    admin.username?.trim() ||
    admin.email ||
    "Administrator";

  const adminEmail =
    admin.email ||
    "Administrator account";

  const adminRole = (
  profile?.role ??
  admin.role ??
  "admin"
)
  .replaceAll("_", " ")
  .replace(
    /\b\w/g,
    (letter: string) =>
      letter.toUpperCase(),
  );

  const initials = adminName
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(
    (part: string) =>
      part.charAt(0),
  )
  .join("")
  .toUpperCase();
  const avatarUrl =
    profile?.avatar_url ||
    admin.avatar_url ||
    null;

  /*
   * ------------------------------------------------------------
   * PLATFORM COUNTS
   * ------------------------------------------------------------
   */

  const [
    users,
    courses,
    lessons,
    chapters,
    resources,
    practiceQuestions,
    communityQuestions,
    feedback,
    reports,
    aiConversations,
    labActivity,
  ] =
    await Promise.all([
      getTableCount(
        supabase,
        "profiles",
      ),

      getTableCount(
        supabase,
        "courses",
      ),

      getTableCount(
        supabase,
        "lessons",
      ),

      getTableCount(
        supabase,
        "chapters",
      ),

      getTableCount(
        supabase,
        "resources",
      ),

      getTableCount(
        supabase,
        "practice_questions",
      ),

      getTableCount(
        supabase,
        "community_questions",
      ),

      getTableCount(
        supabase,
        "feedback",
      ),

      getTableCount(
        supabase,
        "reports",
      ),

      getTableCount(
        supabase,
        "ai_conversations",
      ),

      getTableCount(
        supabase,
        "quantum_lab_activity",
      ),
    ]);

  /*
   * ------------------------------------------------------------
   * PRIMARY METRICS
   * ------------------------------------------------------------
   */

  const metrics: Metric[] = [
    {
      label: "Users",
      value:
        users.count,
      detail:
        "Registered learner accounts",
      href:
        "/admin/users",
      icon: Users,
    },

    {
      label: "Courses",
      value:
        courses.count,
      detail:
        "Platform learning courses",
      href:
        "/admin/courses",
      icon: GraduationCap,
    },

    {
      label: "Lessons",
      value:
        lessons.count,
      detail:
        "Learning units",
      href:
        "/admin/lessons",
      icon: BookOpen,
    },

    {
      label: "Feedback",
      value:
        feedback.count,
      detail:
        "Learner platform feedback",
      href:
        "/admin/feedback",
      icon: MessageSquare,
    },
  ];

  /*
   * ------------------------------------------------------------
   * OPERATIONAL METRICS
   * ------------------------------------------------------------
   */

  const operationalMetrics: Metric[] =
    [
      {
        label: "Chapters",
        value:
          chapters.count,
        detail:
          "Course chapter records",
        href:
          "/admin/chapters",
        icon: Network,
      },

      {
        label: "Resources",
        value:
          resources.count,
        detail:
          "Educational resources",
        href:
          "/admin/resources",
        icon: BookOpen,
      },

      {
        label:
          "Practice questions",
        value:
          practiceQuestions.count,
        detail:
          "Assessment question records",
        href:
          "/admin/practice-questions",
        icon: FileQuestion,
      },

      {
        label:
          "User questions",
        value:
          communityQuestions.count,
        detail:
          "Learner-submitted questions",
        href:
          "/admin/user-questions",
        icon: ClipboardList,
      },

      {
        label: "Reports",
        value:
          reports.count,
        detail:
          "Platform reports",
        href:
          "/admin/reports",
        icon: Flag,
      },

      {
        label:
          "AI conversations",
        value:
          aiConversations.count,
        detail:
          "AI Tutor conversations",
        href:
          "/admin/ai-tutor",
        icon: Bot,
      },

      {
        label:
          "Quantum Lab activity",
        value:
          labActivity.count,
        detail:
          "Recorded laboratory activity",
        href:
          "/admin/quantum-lab",
        icon: FlaskConical,
      },
    ];

  const totalSignals =
    [
      feedback.count,
      reports.count,
      communityQuestions.count,
    ]
      .filter(
        (
          value,
        ): value is number =>
          value !== null,
      )
      .reduce(
        (
          sum,
          value,
        ) =>
          sum + value,
        0,
      );

  return (
    <main className="min-h-screen bg-[#f5f3f7] text-[#141018]">
      {/* ======================================================
          ADMIN HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#110c19] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.065]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
              backgroundSize:
                "72px 72px",
            }}
          />

          <div className="absolute -left-24 top-0 h-[520px] w-[520px] rounded-full bg-violet-600/15 blur-3xl" />

          <div className="absolute right-[8%] top-[15%] h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="absolute bottom-[-180px] right-[22%] h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center">
            {/* LEFT */}

            <div>
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-10 bg-violet-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                  Administration console
                </p>
              </div>

              <h1 className="max-w-4xl text-5xl font-medium leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Platform control.
                <span className="block text-white/35">
                  Content, users,
                  systems,
                  <br />
                  and learning.
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
                Manage QuantumLearn AI
                from one operational
                workspace. Monitor the
                learning platform, maintain
                educational content, inspect
                user activity, and respond to
                platform signals.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/admin/analytics"
                  className="bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
                >
                  Open analytics
                </Link>

                <Link
                  href="/dashboard"
                  className="border border-white/15 px-6 py-3.5 text-sm font-semibold text-white/75 transition-colors hover:border-white/30 hover:text-white"
                >
                  Learner dashboard
                </Link>
              </div>
            </div>

            {/* RIGHT */}

            <div className="w-full">
              <div className="flex items-start gap-5">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${adminName} profile`}
                    className="h-20 w-20 shrink-0 rounded-full border border-violet-400/50 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/15 text-2xl font-semibold text-violet-200">
                    {initials ||
                      "AD"}
                  </div>
                )}

                <div className="min-w-0 pt-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
                    Authorized administrator
                  </p>

                  <h2 className="mt-2 truncate text-2xl font-medium tracking-[-0.03em]">
                    {adminName}
                  </h2>

                  <p className="mt-1 text-sm text-white/50">
                    {adminRole}
                  </p>

                  <p className="mt-1 truncate text-xs text-white/30">
                    {adminEmail}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40">
                {(
                  profile?.institute ??
                  admin.institute
                ) && (
                  <span>
                    {profile?.institute ??
                      admin.institute}
                  </span>
                )}

                {(
                  profile?.branch ??
                  admin.branch
                ) && (
                  <span>
                    {profile?.branch ??
                      admin.branch}
                  </span>
                )}
              </div>

              <div className="mt-9 grid grid-cols-4 gap-5">
                <AdminProfileStat
                  value={
                    users.count
                  }
                  label="Users"
                />

                <AdminProfileStat
                  value={
                    courses.count
                  }
                  label="Courses"
                />

                <AdminProfileStat
                  value={
                    lessons.count
                  }
                  label="Lessons"
                />

                <AdminProfileStat
                  value={
                    feedback.count
                  }
                  label="Feedback"
                />
              </div>

              <div className="mt-7 flex items-center gap-2 text-xs text-white/45">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.7)]" />

                <span>
                  Database-connected
                  administration
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIMARY METRICS */}

      <section className="border-b border-black/10">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(
              (metric) => (
                <AdminMetricCard
                  key={
                    metric.href
                  }
                  metric={
                    metric
                  }
                />
              ),
            )}
          </div>
        </div>
      </section>

      {/* CONTROL CENTER */}

      <section className="border-b border-black/10">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[0.35fr_1fr]">
          <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
              01 — Control center
            </p>

            <p className="mt-24 max-w-xs text-4xl font-medium leading-[1.02] tracking-[-0.04em]">
              Operate the
              platform from one
              place.
            </p>
          </div>

          <div className="p-6 sm:p-10 lg:p-16">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-600">
              Platform operations
            </p>

            <h2 className="mt-5 max-w-4xl text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl">
              Everything important,
              <br />
              connected to the
              database.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-black/55">
              Manage learning content,
              users, questions,
              feedback, AI activity,
              and platform operations
              through the administrator
              workspace.
            </p>

            <div className="mt-14 grid border-t border-black/10 md:grid-cols-2">
              {operationalMetrics.map(
                (metric) => (
                  <OperationalCard
                    key={
                      metric.href
                    }
                    metric={
                      metric
                    }
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM SIGNALS */}

      <section className="border-b border-black/10 bg-white/40">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[0.35fr_1fr]">
          <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
              02 — Platform signals
            </p>

            <p className="mt-24 max-w-xs text-4xl font-medium leading-[1.02] tracking-[-0.04em]">
              Watch what
              learners are
              telling you.
            </p>
          </div>

          <div className="p-6 sm:p-10 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-[1fr_280px] lg:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-violet-600">
                  Operational signals
                </p>

                <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.045em]">
                  Feedback,
                  questions,
                  <br />
                  and reports.
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-7 text-black/55">
                  Learner-generated signals
                  give administrators
                  visibility into problems,
                  requests, and areas where
                  the platform can improve.
                </p>
              </div>

              <div>
                <p className="text-7xl font-medium tracking-[-0.06em]">
                  {totalSignals}
                </p>

                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-black/35">
                  recorded signals
                </p>

                <div className="mt-5 h-1 bg-black/10">
                  <div
                    className="h-full bg-violet-600"
                    style={{
                      width:
                        totalSignals >
                        0
                          ? "100%"
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-14 grid border-t border-black/10 sm:grid-cols-3">
              <SignalLink
                label="Feedback"
                value={
                  feedback.count
                }
                href="/admin/feedback"
                description="Review learner feedback."
              />

              <SignalLink
                label="User questions"
                value={
                  communityQuestions.count
                }
                href="/admin/user-questions"
                description="Respond to learner questions."
              />

              <SignalLink
                label="Reports"
                value={
                  reports.count
                }
                href="/admin/reports"
                description="Investigate reported issues."
              />
            </div>
          </div>
        </div>
      </section>

      {/* MANAGEMENT */}

      <section className="border-b border-black/10">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[0.35fr_1fr]">
          <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
              03 — Administration
            </p>
          </div>

          <div className="p-6 sm:p-10 lg:p-16">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-600">
              Management tools
            </p>

            <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.045em]">
              Move directly
              into
              <br />
              platform operations.
            </h2>

            <div className="mt-14 grid border-t border-black/10 md:grid-cols-3">
              <ManagementLink
                number="01"
                title="Analytics"
                description="Inspect product activity and learning signals."
                href="/admin/analytics"
                icon={BarChart3}
              />

              <ManagementLink
                number="02"
                title="System health"
                description="Inspect application and dependency health."
                href="/admin/system-health"
                icon={Activity}
              />

              <ManagementLink
                number="03"
                title="Settings"
                description="Manage persisted platform configuration."
                href="/admin/settings"
                icon={Settings}
              />

              <ManagementLink
                number="04"
                title="Users"
                description="Inspect learner accounts and profiles."
                href="/admin/users"
                icon={Users}
              />

              <ManagementLink
                number="05"
                title="Learning content"
                description="Manage courses, lessons, and chapters."
                href="/admin/courses"
                icon={GraduationCap}
              />

              <ManagementLink
                number="06"
                title="AI Tutor"
                description="Inspect AI Tutor activity and conversations."
                href="/admin/ai-tutor"
                icon={Bot}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <section className="bg-[#110c19] text-white">
        <div className="mx-auto max-w-[1600px] px-6 py-8 sm:px-10 lg:px-16">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-violet-400" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Administrative access
                </p>

                <p className="mt-1 text-xs text-white/35">
                  Protected QuantumLearn
                  AI control surface.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 transition-colors hover:text-white"
            >
              Return to learner
              dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ================================================================
   COMPONENTS
================================================================ */

function AdminProfileStat({
  value,
  label,
}: {
  value: number | null;
  label: string;
}) {
  return (
    <div>
      <p className="text-2xl font-medium tracking-[-0.04em] text-white">
        {value === null
          ? "—"
          : value}
      </p>

      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>
    </div>
  );
}

function AdminMetricCard({
  metric,
}: {
  metric: Metric;
}) {
  const Icon =
    metric.icon;

  return (
    <Link
      href={metric.href}
      className="group border-b border-black/10 p-6 transition-colors hover:bg-white sm:p-8 lg:border-b-0 lg:border-r lg:p-10 last:border-r-0"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-[0.16em] text-black/35">
          {metric.label}
        </p>

        <Icon className="h-4 w-4 text-black/20 transition-colors group-hover:text-violet-600" />
      </div>

      <p className="mt-7 text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
        {metric.value === null
          ? "—"
          : metric.value}
      </p>

      <p className="mt-3 text-sm text-black/45">
        {metric.detail}
      </p>

      <div className="mt-7 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-black/30 transition-colors group-hover:text-violet-600">
        Open module
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function OperationalCard({
  metric,
}: {
  metric: Metric;
}) {
  const Icon =
    metric.icon;

  return (
    <Link
      href={metric.href}
      className="group border-b border-black/10 py-8 sm:px-8 md:first:pl-0 md:last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-black/25">
          {metric.label}
        </span>

        <Icon className="h-4 w-4 text-black/20 transition-colors group-hover:text-violet-600" />
      </div>

      <p className="mt-6 text-3xl font-medium tracking-[-0.05em]">
        {metric.value === null
          ? "—"
          : metric.value}
      </p>

      <p className="mt-2 text-sm text-black/45">
        {metric.detail}
      </p>

      <span className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-black/35 transition-colors group-hover:text-violet-600">
        Manage
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function SignalLink({
  label,
  value,
  description,
  href,
}: {
  label: string;
  value: number | null;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group border-b border-black/10 py-8 sm:px-8 sm:first:pl-0 sm:last:border-b-0"
    >
      <p className="text-xs uppercase tracking-[0.16em] text-black/35">
        {label}
      </p>

      <p className="mt-5 text-4xl font-medium tracking-[-0.05em]">
        {value === null
          ? "—"
          : value}
      </p>

      <p className="mt-3 text-sm leading-6 text-black/45">
        {description}
      </p>

      <span className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-black/35 transition-colors group-hover:text-violet-600">
        Review
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function ManagementLink({
  number,
  title,
  description,
  href,
  icon: Icon,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Activity;
}) {
  return (
    <Link
      href={href}
      className="group border-b border-black/10 py-8 sm:px-8 md:border-b-0 md:border-r md:first:pl-0 md:last:border-r-0"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-black/25">
          {number}
        </span>

        <Icon className="h-4 w-4 text-black/20 transition-colors group-hover:text-violet-600" />
      </div>

      <h3 className="mt-8 text-xl font-medium tracking-tight transition-colors group-hover:text-violet-600">
        {title}
      </h3>

      <p className="mt-3 max-w-xs text-sm leading-6 text-black/50">
        {description}
      </p>

      <span className="mt-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-black/40 transition-colors group-hover:text-violet-600">
        Open
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}