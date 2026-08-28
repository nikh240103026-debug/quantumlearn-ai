import Link from "next/link";

import {
  BookOpen,
  FlaskConical,
  Bot,
  BrainCircuit,
  BarChart3,
  Library,
  ArrowUpRight,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

const features = [
  {
    icon: BookOpen,
    title: "Interactive Learning",
    description:
      "Learn quantum computing through structured lessons, visual explanations, examples, and guided concepts.",
    href: "/learn",
    label: "Explore courses",
  },
  {
    icon: FlaskConical,
    title: "Quantum Lab",
    description:
      "Build quantum circuits, experiment with gates, and explore quantum algorithms in an interactive environment.",
    href: "/quantum-lab",
    label: "Open Quantum Lab",
  },
  {
    icon: Bot,
    title: "AI Tutor",
    description:
      "Ask questions, request explanations, and receive contextual guidance while learning quantum computing.",
    href: "/ai-tutor",
    label: "Meet your AI Tutor",
  },
  {
    icon: BrainCircuit,
    title: "Smart Practice",
    description:
      "Practice with questions and challenges designed to reinforce concepts and identify areas that need more work.",
    href: "/practice",
    label: "Start practicing",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Monitor lessons, practice performance, learning milestones, and your overall quantum learning journey.",
    href: "/progress",
    label: "View progress",
  },
  {
    icon: Library,
    title: "Curated Resources",
    description:
      "Discover carefully organized papers, documentation, references, tools, and additional learning material.",
    href: "/resources",
    label: "Browse resources",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Everything You Need"
          title="Learn Quantum Computing in One Connected Environment."
          description="From your first quantum concept to building circuits and analyzing results, QuantumLearn AI brings the essential parts of the learning experience together."
          centered
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-600 transition-all duration-300 group-hover:border-blue-200 group-hover:bg-blue-50">
                  <Icon size={23} strokeWidth={1.7} />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>

                {/* Link */}
                <Link
                    href={feature.href}
                    className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                >
                  {feature.label}

                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}