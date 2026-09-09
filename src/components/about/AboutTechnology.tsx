"use client";

import { useEffect, useRef, useState } from "react";

const technologies = [
  ["Frontend", "Next.js", "TypeScript", "React"],
  ["Platform", "Supabase", "Authentication", "Database"],
  ["Quantum", "Qiskit", "PennyLane", "Cirq"],
  ["Execution", "Local Simulation", "Multi-SDK", "qBraid"],
  ["AI", "AI Tutor", "Learning Assistance", "Personalization"],
];

export function AboutTechnology() {
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
    <section
      ref={ref}
      className="border-b border-white/10 bg-[#090c11] text-white"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="grid lg:grid-cols-[.4fr_1fr]">
          <div className="border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
              04 — Technology
            </p>

            <h2 className="mt-24 max-w-sm text-4xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-5xl">
              Built as a platform, not a collection of pages.
            </h2>
          </div>

          <div className="p-6 sm:p-10 lg:p-16">
            <p className="max-w-3xl text-lg leading-8 text-white/55">
              QuantumLearn AI connects modern web engineering with quantum
              computing frameworks, simulation engines, AI-assisted learning,
              and persistent learner data.
            </p>

            <div className="mt-16 border-t border-white/10">
              {technologies.map(([category, ...items], index) => (
                <div
                  key={category}
                  className={`grid gap-5 border-b border-white/10 py-7 transition-all duration-700 md:grid-cols-[160px_1fr] ${
                    visible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <span className="text-xs uppercase tracking-[0.15em] text-white/30">
                    {category}
                  </span>

                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="text-sm text-white/70"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 grid gap-3 sm:grid-cols-2">
              <div className="border border-white/10 p-7">
                <span className="text-xs uppercase tracking-[0.15em] text-white/30">
                  Architecture
                </span>

                <p className="mt-5 text-sm leading-6 text-white/55">
                  A modular architecture allows learning, AI, quantum
                  execution, data, and user experiences to work together.
                </p>
              </div>

              <div className="border border-white/10 p-7">
                <span className="text-xs uppercase tracking-[0.15em] text-white/30">
                  Philosophy
                </span>

                <p className="mt-5 text-sm leading-6 text-white/55">
                  Technology should reduce the distance between understanding
                  a concept and experimenting with it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}