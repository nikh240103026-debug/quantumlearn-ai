import {
  Atom,
  CircuitBoard,
  Sigma,
  Code2,
  Rocket,
  Check,
} from "lucide-react";

const roadmap = [
  {
    number: "01",
    title: "Foundations",
    subtitle: "Build the mental model",
    description:
      "Start with qubits, quantum states, measurement, superposition, and the fundamental ideas behind quantum computing.",
    icon: Atom,
    topics: ["Qubits", "Superposition", "Measurement"],
  },
  {
    number: "02",
    title: "Quantum Circuits",
    subtitle: "Think in gates",
    description:
      "Learn how quantum gates transform states and begin constructing circuits visually.",
    icon: CircuitBoard,
    topics: ["Quantum Gates", "Circuit Design", "Entanglement"],
  },
  {
    number: "03",
    title: "Algorithms",
    subtitle: "Apply the concepts",
    description:
      "Explore important quantum algorithms and understand the intuition behind how they work.",
    icon: Sigma,
    topics: ["Deutsch-Jozsa", "Grover", "QFT"],
  },
  {
    number: "04",
    title: "Qiskit",
    subtitle: "Build with code",
    description:
      "Move from visual circuits to programming quantum systems using Qiskit and practical examples.",
    icon: Code2,
    topics: ["Python", "Qiskit", "Simulation"],
  },
  {
    number: "05",
    title: "Advanced Topics",
    subtitle: "Go beyond the basics",
    description:
      "Explore advanced quantum computing concepts and develop the foundation for deeper research.",
    icon: Rocket,
    topics: ["Error Correction", "Quantum ML", "Research"],
  },
];

export function LearningRoadmap() {
  return (
    <section
        id="roadmap"
        className="bg-white py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Learning Roadmap
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            A Clear Path From Beginner to Quantum Builder.
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
            Follow a structured progression that gradually turns
            fundamental concepts into practical quantum computing skills.
          </p>
        </div>

        {/* Roadmap */}
        <div className="relative mt-16">

          {/* Desktop connecting line */}
          <div className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-slate-200 lg:block" />

          <div className="grid gap-6 lg:grid-cols-5 lg:gap-4">
            {roadmap.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.number}
                  className="group relative"
                >
                  {/* Step icon */}
                  <div className="relative z-10 flex items-center gap-4 lg:block">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-blue-300 group-hover:text-blue-600 group-hover:shadow-md">
                      <Icon size={25} strokeWidth={1.7} />
                    </div>

                    <div className="lg:hidden">
                      <p className="text-xs font-bold tracking-widest text-blue-600">
                        {item.number}
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-slate-950">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Desktop content */}
                  <div className="ml-20 mt-0 lg:ml-0 lg:mt-6">
                    <p className="hidden text-xs font-bold tracking-widest text-blue-600 lg:block">
                      {item.number}
                    </p>

                    <h3 className="hidden mt-2 text-lg font-semibold text-slate-950 lg:block">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      {item.subtitle}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>

                    {/* Topics */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.topics.map((topic) => (
                        <span
                          key={topic}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500"
                        >
                          <Check size={11} />
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mobile divider */}
                  {item.number !== "05" && (
                    <div className="ml-8 mt-8 h-px bg-slate-200 lg:hidden" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:p-8">
          <div>
            <p className="text-lg font-semibold text-slate-950">
              Not sure where to start?
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Begin with the foundations and let the platform guide your
              next step.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Start Learning
          </button>
        </div>
      </div>
    </section>
  );
}