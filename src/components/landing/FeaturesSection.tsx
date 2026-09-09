import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Code2,
  FlaskConical,
  GraduationCap,
  LineChart,
  Route,
} from "lucide-react";

const features = [
  {
    number: "01",
    title: "Interactive Learning",
    description:
      "Follow a structured quantum curriculum with visual explanations, concepts, examples, and guided lessons.",
    href: "/roadmap",
    icon: GraduationCap,
    size: "large",
  },
  {
    number: "02",
    title: "Quantum Lab",
    description:
      "Design quantum circuits, run simulations, inspect states, and understand measurement outcomes.",
    href: "/quantum-lab",
    icon: FlaskConical,
    size: "large",
  },
  {
    number: "03",
    title: "Quantum Coding",
    description:
      "Write, execute, and experiment with quantum programs using major quantum SDKs.",
    href: "/coding",
    icon: Code2,
    size: "normal",
  },
  {
    number: "04",
    title: "AI Tutor",
    description:
      "Get contextual explanations, debugging help, conceptual guidance, and intelligent learning support.",
    href: "/ai-tutor",
    icon: BrainCircuit,
    size: "normal",
  },
  {
    number: "05",
    title: "Personalized Learning",
    description:
      "Track progress and follow a learning journey that adapts to your performance and activity.",
    href: "/dashboard",
    icon: Route,
    size: "normal",
  },
  {
    number: "06",
    title: "Practice & Assessment",
    description:
      "Strengthen understanding with practice questions, assessments, results, and performance tracking.",
    href: "/practice",
    icon: LineChart,
    size: "normal",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="grid border-b border-slate-200 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-slate-200 px-6 py-14 sm:px-10 lg:border-b-0 lg:border-r lg:px-16 lg:py-20 xl:px-24">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Platform
            </p>

            <h2 className="mt-5 max-w-md text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Everything you need to explore quantum computing.
            </h2>
          </div>

          <div className="flex items-end px-6 py-14 sm:px-10 lg:px-16 lg:py-20 xl:px-24">
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              QuantumLearn AI connects learning, experimentation, programming,
              assessment, and AI assistance into one continuous workflow.
            </p>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid border-b border-slate-200 md:grid-cols-2 lg:grid-cols-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.size === "large";

            return (
              <article
                key={feature.number}
                className={`group relative flex min-h-[340px] flex-col justify-between border-b border-slate-200 bg-white p-7 transition-colors hover:bg-slate-50 sm:p-9 lg:border-b-0 ${
                  isLarge ? "lg:col-span-6" : "lg:col-span-4"
                } ${
                  index === 0
                    ? "lg:border-r"
                    : index === 1
                      ? "lg:border-r"
                      : index === 2
                        ? "lg:border-r"
                        : index === 3
                          ? "lg:border-r"
                          : index === 4
                            ? "lg:border-r"
                            : ""
                }`}
              >
                {/* Top */}
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold tracking-[0.16em] text-slate-400">
                    {feature.number}
                  </span>

                  <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-slate-50 text-slate-600 transition-all duration-300 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                    <Icon size={18} strokeWidth={1.7} />
                  </div>
                </div>

                {/* Content */}
                <div className="mt-16">
                  <h3
                    className={`font-semibold tracking-[-0.025em] text-slate-950 ${
                      isLarge
                        ? "text-2xl leading-8 sm:text-3xl"
                        : "text-xl leading-7"
                    }`}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={`mt-4 max-w-xl leading-6 text-slate-500 ${
                      isLarge ? "text-base" : "text-sm"
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>

                {/* Link */}
                <Link
                  href={feature.href}
                  className="mt-10 inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600"
                >
                  Explore
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
              </article>
            );
          })}
        </div>

        {/* Workflow section */}
        <div className="grid bg-[#050816] text-white lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-white/10 px-6 py-12 sm:px-10 lg:border-b-0 lg:border-r lg:px-16 lg:py-16 xl:px-24">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
              One continuous workflow
            </p>

            <h3 className="mt-5 max-w-sm text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
              From your first concept to your first quantum program.
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            <WorkflowStep
              number="01"
              title="Learn"
              description="Build the fundamentals."
            />

            <WorkflowStep
              number="02"
              title="Build"
              description="Create quantum circuits."
            />

            <WorkflowStep
              number="03"
              title="Execute"
              description="Run and experiment."
            />

            <WorkflowStep
              number="04"
              title="Understand"
              description="Analyze with AI guidance."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-white/10 px-6 py-9 sm:px-8 lg:border-b-0 lg:border-r lg:px-7 xl:px-9">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-blue-400">
        {number}
      </p>

      <h4 className="mt-8 text-lg font-semibold text-white">{title}</h4>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}