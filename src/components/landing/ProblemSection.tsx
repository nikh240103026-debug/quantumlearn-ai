import {
  Brain,
  Layers3,
  FlaskConical,
  UserRoundCheck,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

const problems = [
  {
    icon: Brain,
    number: "01",
    title: "Abstract Concepts",
    description:
      "Superposition, entanglement and quantum states are difficult to understand from theory alone.",
  },
  {
    icon: Layers3,
    number: "02",
    title: "Fragmented Tools",
    description:
      "Learning materials, circuit builders, simulators and coding environments are often separated.",
  },
  {
    icon: FlaskConical,
    number: "03",
    title: "Limited Hands-on Practice",
    description:
      "Students need practical experimentation to understand how quantum algorithms actually behave.",
  },
  {
    icon: UserRoundCheck,
    number: "04",
    title: "Lack of Personalized Guidance",
    description:
      "Traditional learning platforms cannot continuously adapt to individual mistakes and learning gaps.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Challenge"
          title="Quantum Computing Shouldn't Be This Difficult to Learn."
          description="Understanding quantum computing requires more than reading theory. Learners need a connected environment where concepts, experimentation and feedback come together."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {problems.map((problem) => {
            const Icon = problem.icon;

            return (
              <Card
                key={problem.number}
                className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                {/* Number */}
                <div className="absolute right-5 top-5 text-xs font-bold tracking-widest text-slate-300 transition-colors group-hover:text-blue-200">
                  {problem.number}
                </div>

                {/* Icon */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-blue-600 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50">
                  <Icon size={21} strokeWidth={1.8} />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-lg font-semibold text-slate-950">
                  {problem.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {problem.description}
                </p>

                {/* Bottom accent */}
                <div className="mt-6 h-px w-10 bg-slate-200 transition-all duration-300 group-hover:w-16 group-hover:bg-blue-500" />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}