import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Code2,
  FlaskConical,
} from "lucide-react";

const problems = [
  {
    number: "01",
    title: "Quantum concepts stay abstract",
    description:
      "Move beyond static explanations with interactive visual learning that connects theory to observable quantum behavior.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Building circuits is difficult",
    description:
      "Experiment with quantum gates visually and understand how each operation changes the circuit and its state.",
    icon: FlaskConical,
  },
  {
    number: "03",
    title: "Quantum code has a steep learning curve",
    description:
      "Write and execute programs across major quantum SDKs while learning the ideas behind the code.",
    icon: Code2,
  },
  {
    number: "04",
    title: "Learners lack personalized guidance",
    description:
      "Use AI-powered assistance for explanations, mistakes, optimization suggestions, and a learning path adapted to progress.",
    icon: Brain,
  },
];

export function ProblemSection() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1600px]">
        {/* Section introduction */}
        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-slate-200 px-6 py-14 sm:px-10 lg:border-b-0 lg:border-r lg:px-16 lg:py-20 xl:px-24">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              The learning gap
            </p>

            <h2 className="mt-5 max-w-md text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Quantum computing should be learned by doing.
            </h2>
          </div>

          <div className="flex items-end px-6 py-14 sm:px-10 lg:px-16 lg:py-20 xl:px-24">
            <div className="max-w-2xl">
              <p className="text-lg leading-8 text-slate-600">
                Traditional learning often separates theory, coding,
                experimentation, and feedback. QuantumLearn AI brings them
                together in one continuous learning environment.
              </p>

              <Link
                href="/roadmap"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition-colors hover:text-blue-600"
              >
                Explore the learning journey
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Problem grid */}
        <div className="grid border-t border-slate-200 md:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem, index) => {
            const Icon = problem.icon;

            return (
              <article
                key={problem.number}
                className={`group relative px-6 py-10 transition-colors hover:bg-slate-50 sm:px-10 lg:px-8 xl:px-10 ${
                  index !== problems.length - 1
                    ? "border-b border-slate-200 md:border-r"
                    : ""
                } ${
                  index === 1
                    ? "lg:border-r"
                    : index === 2
                      ? "lg:border-r"
                      : ""
                } ${
                  index === 0 || index === 1
                    ? "lg:border-b-0"
                    : "lg:border-b-0"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold tracking-[0.16em] text-slate-400">
                    {problem.number}
                  </span>

                  <div className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white text-slate-500 transition-colors group-hover:border-blue-200 group-hover:text-blue-600">
                    <Icon size={17} strokeWidth={1.7} />
                  </div>
                </div>

                <h3 className="mt-12 max-w-xs text-xl font-semibold leading-7 tracking-[-0.02em] text-slate-950">
                  {problem.title}
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                  {problem.description}
                </p>

                <div className="mt-10 h-px w-10 bg-slate-300 transition-all duration-300 group-hover:w-16 group-hover:bg-blue-600" />
              </article>
            );
          })}
        </div>

        {/* Statement */}
        <div className="grid border-t border-slate-200 bg-[#050816] text-white lg:grid-cols-[1fr_2fr]">
          <div className="border-b border-white/10 px-6 py-10 sm:px-10 lg:border-b-0 lg:border-r lg:px-16 xl:px-24">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
              QuantumLearn AI
            </p>
          </div>

          <div className="px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
            <p className="max-w-4xl text-2xl font-medium leading-9 tracking-[-0.02em] text-white sm:text-3xl sm:leading-10">
              A single environment where learners can understand the
              fundamentals, build circuits, execute quantum programs, analyze
              results, and receive intelligent guidance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}