"use client";

import { useEffect, useRef, useState } from "react";

export function AboutPlatform() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="border-b border-black/10 bg-[#f5f5f3]"
    >
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[.35fr_1fr]">
        <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
            01 — The platform
          </p>
        </div>

        <div className="p-6 sm:p-10 lg:p-16">
          <div
            className={`max-w-5xl transition-all duration-1000 ${
              visible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="max-w-4xl text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Quantum computing should be experienced, not just explained.
            </h2>

            <div className="mt-12 grid gap-10 md:grid-cols-2">
              <p className="text-base leading-7 text-black/60">
                QuantumLearn AI brings together the essential components of
                quantum-computing education inside a single interactive
                environment. Learners can study concepts, construct circuits,
                execute experiments, write quantum programs, analyze results,
                and receive AI-assisted guidance.
              </p>

              <p className="text-base leading-7 text-black/60">
                The platform is designed around practical learning. Instead
                of treating theory, programming, simulation, and assessment as
                separate experiences, QuantumLearn AI connects them into a
                continuous learning workflow.
              </p>
            </div>

            <div className="mt-16 grid border-t border-black/10 sm:grid-cols-3">
              {[
                ["Learning", "Structured curriculum and guided progression"],
                ["Experimentation", "Interactive circuits and quantum simulation"],
                ["Intelligence", "AI-assisted understanding and personalization"],
              ].map(([title, text], index) => (
                <div
                  key={title}
                  className="border-b border-black/10 py-7 sm:border-b-0 sm:border-r sm:px-7 sm:first:pl-0 sm:last:border-r-0"
                >
                  <span className="text-xs text-black/30">
                    0{index + 1}
                  </span>

                  <h3 className="mt-5 text-lg font-semibold">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-black/50">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}