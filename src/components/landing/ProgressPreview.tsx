import {
  TrendingUp,
  Flame,
  BookOpen,
  Target,
  CheckCircle2,
  ArrowRight,
  Clock3,
} from "lucide-react";

const topics = [
  {
    name: "Quantum Foundations",
    progress: 92,
  },
  {
    name: "Quantum Circuits",
    progress: 68,
  },
  {
    name: "Quantum Algorithms",
    progress: 41,
  },
  {
    name: "Qiskit",
    progress: 24,
  },
];

const activities = [
  {
    title: "Completed: Introduction to Qubits",
    time: "Today, 10:32 AM",
    icon: CheckCircle2,
  },
  {
    title: "Scored 86% in Quantum Gates",
    time: "Yesterday, 7:18 PM",
    icon: Target,
  },
  {
    title: "Started: Bell States",
    time: "Yesterday, 5:42 PM",
    icon: BookOpen,
  },
];

export function ProgressPreview() {
  return (
    <section
        id="progress"
        className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
              Progress & Practice
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              See Your Understanding Grow.
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg lg:justify-self-end">
            Track what you've learned, identify areas that need more
            practice, and always know what to work on next.
          </p>
        </div>

        {/* Dashboard */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:mt-16">

          {/* Dashboard header */}
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Learning Dashboard
              </p>

              <h3 className="mt-1 text-lg font-semibold text-slate-950">
                Your Quantum Learning Progress
              </h3>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <TrendingUp size={17} />
              Improving steadily
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">

            {/* Left */}
            <div className="p-5 sm:p-7">

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  icon={BookOpen}
                  label="Lessons"
                  value="24"
                  detail="completed"
                />

                <Stat
                  icon={Target}
                  label="Practice"
                  value="86%"
                  detail="accuracy"
                />

                <Stat
                  icon={Flame}
                  label="Streak"
                  value="12"
                  detail="days"
                />

                <Stat
                  icon={Clock3}
                  label="Learning"
                  value="18.5h"
                  detail="this month"
                />
              </div>

              {/* Overall progress */}
              <div className="mt-8 rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Overall Progress
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Quantum Computing Foundations
                    </p>
                  </div>

                  <span className="text-lg font-bold text-blue-600">
                    64%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: "64%" }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs text-slate-400">
                  <span>24 lessons completed</span>
                  <span>38 lessons total</span>
                </div>
              </div>

              {/* Topic mastery */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950">
                    Topic Mastery
                  </p>

                  <span className="text-xs text-slate-400">
                    Updated today
                  </span>
                </div>

                <div className="mt-4 space-y-5">
                  {topics.map((topic) => (
                    <div key={topic.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">
                          {topic.name}
                        </span>

                        <span className="font-semibold text-slate-500">
                          {topic.progress}%
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all duration-500"
                          style={{
                            width: `${topic.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0">

              {/* Recommended */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Recommended Next
                </p>

                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Continue learning
                      </p>

                      <h4 className="mt-1 text-lg font-semibold text-slate-950">
                        Understanding Entanglement
                      </h4>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <BookOpen size={17} />
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Explore how two qubits can become correlated and
                    why entanglement is central to quantum computing.
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      18 min
                    </span>

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Continue
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950">
                    Recent Activity
                  </p>

                  <span className="text-xs text-slate-400">
                    View all
                  </span>
                </div>

                <div className="mt-4 divide-y divide-slate-200">
                  {activities.map((activity) => {
                    const Icon = activity.icon;

                    return (
                      <div
                        key={activity.title}
                        className="flex gap-3 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                          <Icon size={15} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-medium leading-5 text-slate-700">
                            {activity.title}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom statement */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Your progress adapts as you learn and practice.
          </p>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            Keep building your quantum intuition
            <ArrowRight size={15} />
          </div>
        </div>
      </div>
    </section>
  );
}

interface StatProps {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
}

function Stat({
  icon: Icon,
  label,
  value,
  detail,
}: StatProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={14} />
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-3 text-xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-0.5 text-[11px] text-slate-400">
        {detail}
      </p>
    </div>
  );
}