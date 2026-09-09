"use client";

import { useEffect, useRef, useState } from "react";

export function AboutPurpose() {
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
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="overflow-hidden border-b border-white/10 bg-[#0a0d12] text-white"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="grid lg:grid-cols-2">
          <div className="border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
              02 — Why it exists
            </p>

            <div className="mt-24 max-w-xl">
              <p className="text-sm uppercase tracking-[0.18em] text-blue-400">
                The problem
              </p>

              <h2
                className={`mt-6 text-4xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-5xl transition-all duration-1000 ${
                  visible
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-10 opacity-0"
                }`}
              >
                Quantum computing is powerful. Learning it can be fragmented.
              </h2>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-16">
            <div
              className={`transition-all delay-200 duration-1000 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <p className="max-w-2xl text-lg leading-8 text-white/65">
                Quantum-computing learners often move between lectures,
                documentation, coding environments, simulators, articles, and
                disconnected practice resources. The result can be a gap
                between understanding an algorithm conceptually and knowing how
                to implement and interpret it.
              </p>

              <div className="mt-16 border-y border-white/10">
                {[
                  "Theory without immediate experimentation",
                  "Quantum programming spread across different tools",
                  "Limited contextual guidance while learning",
                  "Difficulty connecting circuit behavior with results",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="grid grid-cols-[40px_1fr] gap-5 border-b border-white/10 py-6 last:border-b-0"
                  >
                    <span className="text-xs text-white/25">
                      0{index + 1}
                    </span>

                    <span className="text-sm text-white/70">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-16">
                <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                  Our response
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-2 text-sm font-medium">
                  {[
                    "Learn",
                    "Build",
                    "Execute",
                    "Observe",
                    "Understand",
                  ].map((item, index) => (
                    <span key={item} className="flex items-center gap-2">
                      <span className="border border-white/15 px-4 py-2.5">
                        {item}
                      </span>

                      {index < 4 && (
                        <span className="text-white/20">→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}