import {
  BookOpen,
  Bot,
  BrainCircuit,
  Code2,
  FlaskConical,
  Play,
  ArrowDown,
} from "lucide-react";

const journeySteps = [
  {
    number: "01",
    title: "Learn",
    description:
      "Understand quantum concepts through structured lessons and visual explanations.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Build",
    description:
      "Create quantum circuits and experiment with gates, qubits, and algorithms.",
    icon: Code2,
  },
  {
    number: "03",
    title: "Run",
    description:
      "Execute your circuit and observe how the quantum system behaves.",
    icon: Play,
  },
  {
    number: "04",
    title: "Visualize",
    description:
      "Explore circuit states, probabilities, measurements, and simulation results.",
    icon: FlaskConical,
  },
  {
    number: "05",
    title: "AI Analyze",
    description:
      "Get intelligent explanations of your circuit, results, and mistakes.",
    icon: Bot,
  },
  {
    number: "06",
    title: "Practice",
    description:
      "Strengthen your understanding with targeted questions and challenges.",
    icon: BrainCircuit,
  },
];

export function LearningJourney() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            The Learning Loop
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            One Platform. The Complete Quantum Learning Journey.
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
            Move seamlessly from understanding a concept to building,
            executing, analyzing, and practicing it—all within one
            connected learning environment.
          </p>
        </div>

        {/* Desktop journey */}
        <div className="relative mt-16 hidden lg:block">

          {/* Connecting line */}
          <div className="absolute left-[8%] right-[8%] top-10 h-px bg-slate-200" />

          <div className="grid grid-cols-6 gap-5">
            {journeySteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="group relative"
                >
                  {/* Icon */}
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-blue-300 group-hover:text-blue-600 group-hover:shadow-md">
                    <Icon size={28} strokeWidth={1.7} />
                  </div>

                  {/* Number */}
                  <p className="mt-6 text-xs font-bold tracking-widest text-blue-600">
                    {step.number}
                  </p>

                  {/* Title */}
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile / Tablet journey */}
        <div className="mt-12 lg:hidden">
          <div className="space-y-0">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === journeySteps.length - 1;

              return (
                <div
                  key={step.number}
                  className="relative flex gap-5"
                >
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm">
                      <Icon size={22} strokeWidth={1.8} />
                    </div>

                    {!isLast && (
                      <div className="h-full min-h-16 w-px bg-slate-200" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-10">
                    <p className="text-xs font-bold tracking-widest text-blue-600">
                      {step.number}
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom statement */}
        <div className="mt-12 flex items-center gap-3 border-t border-slate-200 pt-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ArrowDown size={17} />
          </div>

          <p className="text-sm font-medium text-slate-600">
            Every step reinforces the next—turning theory into practical
            quantum intuition.
          </p>
        </div>
      </div>
    </section>
  );
}