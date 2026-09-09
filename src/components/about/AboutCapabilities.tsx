"use client";

import { useEffect, useRef, useState } from "react";

const capabilities = [
  {
    number: "01",
    title: "Structured Curriculum",
    text: "A progressive learning journey designed to take learners from foundational concepts toward advanced quantum computing.",
  },
  {
    number: "02",
    title: "Quantum Circuit Builder",
    text: "Construct quantum circuits visually and experiment with gates, qubits, measurements, and circuit behavior.",
  },
  {
    number: "03",
    title: "Quantum Simulation",
    text: "Execute circuits, inspect quantum states, probabilities, measurements, and experiment outcomes.",
  },
  {
    number: "04",
    title: "Multi-SDK Execution",
    text: "Explore quantum programs across multiple quantum-computing frameworks and execution environments.",
  },
  {
    number: "05",
    title: "Quantum Coding",
    text: "Write quantum programs, follow tutorials, solve challenges, and build practical programming skills.",
  },
  {
    number: "06",
    title: "AI Tutor",
    text: "Receive contextual explanations, guidance, error assistance, and learning support while studying.",
  },
  {
    number: "07",
    title: "Practice & Assessment",
    text: "Reinforce concepts through practice questions, challenges, assessments, and performance tracking.",
  },
  {
    number: "08",
    title: "Personalized Learning",
    text: "Use learning activity and progress data to create a more adaptive and focused learning experience.",
  },
];

export function AboutCapabilities() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-b border-black/10 bg-[#f5f5f3]">
      <div className="mx-auto max-w-[1600px]">
        <div className="border-b border-black/10 p-6 sm:p-10 lg:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
            03 — What it provides
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
            <h2 className="text-4xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              One environment for the quantum learning journey.
            </h2>

            <p className="max-w-xl self-end text-base leading-7 text-black/55">
              Every major part of the learning workflow is designed to work
              together, allowing learners to move naturally between concepts,
              experimentation, programming, and evaluation.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((capability, index) => (
            <article
              key={capability.number}
              className={`min-h-[260px] border-b border-black/10 p-6 transition-all duration-700 sm:p-8 lg:p-10 ${
                index % 4 !== 3 ? "lg:border-r" : ""
              } ${index % 2 !== 1 ? "sm:border-r" : ""} ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <span className="text-xs text-black/30">
                {capability.number}
              </span>

              <h3 className="mt-12 text-xl font-semibold tracking-tight">
                {capability.title}
              </h3>

              <p className="mt-4 text-sm leading-6 text-black/50">
                {capability.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}