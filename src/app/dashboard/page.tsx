import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  ArrowRight,
  Atom,
  BookOpen,
  Brain,
  CheckCircle2,
  Code2,
  FlaskConical,
  Sparkles,
  Target,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <Sparkles size={14} />
                Learning Dashboard
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Welcome back 👋
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                Continue your quantum computing journey and build something
                meaningful today.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Target size={20} />}
            label="Overall Progress"
            value="12%"
            description="Keep learning"
          />

          <StatCard
            icon={<BookOpen size={20} />}
            label="Courses Started"
            value="1"
            description="Quantum Fundamentals"
          />

          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Lessons Completed"
            value="4"
            description="Great start"
          />

          <StatCard
            icon={<Code2 size={20} />}
            label="Circuits Built"
            value="0"
            description="Build your first"
          />
        </section>

        {/* Main content */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Continue Learning */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Continue Learning
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Quantum Computing Fundamentals
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Build the mathematical and conceptual foundation you need
                  before moving into quantum algorithms.
                </p>
              </div>

              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                <Atom size={22} />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Course progress
                </span>

                <span className="font-semibold text-blue-600">35%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[35%] rounded-full bg-blue-600" />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Continue Learning
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                View Roadmap
              </Link>
            </div>
          </div>

          {/* Learning Streak */}
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Brain size={22} />
            </div>

            <p className="mt-6 text-sm font-medium text-slate-400">
              Learning Streak
            </p>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-bold">1</span>
              <span className="text-sm text-slate-400">day</span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Come back tomorrow to keep your learning momentum going.
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-cyan-400">
              <Sparkles size={16} />
              Keep going!
            </div>
          </div>
        </section>

        {/* Quick Access */}
        <section className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quick Access
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Explore your learning tools
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickAccessCard
              icon={<FlaskConical size={22} />}
              title="Quantum Lab"
              description="Build and experiment with quantum circuits."
              href="/#quantum-lab"
            />

            <QuickAccessCard
              icon={<Brain size={22} />}
              title="AI Tutor"
              description="Get intelligent guidance while you learn."
              href="/#ai-tutor"
            />

            <QuickAccessCard
              icon={<Code2 size={22} />}
              title="Practice"
              description="Test your understanding with practical problems."
              href="/#progress"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}

function StatCard({
  icon,
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-950">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-800">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

interface QuickAccessCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

function QuickAccessCard({
  icon,
  title,
  description,
  href,
}: QuickAccessCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
        {icon}
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
        Open
        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}