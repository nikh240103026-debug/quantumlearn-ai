"use client";

import { useEffect, useRef, useState } from "react";

export function AboutVision() {
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
    <section ref={ref} className="bg-[#f5f5f3]">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid lg:grid-cols-[.35fr_1fr]">
          <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
              06 — Purpose & vision
            </p>
          </div>

          <div className="p-6 sm:p-10 lg:p-16">
            <div
              className={`transition-all duration-1000 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <p className="text-sm uppercase tracking-[0.18em] text-blue-600">
                Our purpose
              </p>

              <h2 className="mt-6 max-w-5xl text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                Make quantum computing education more interactive, practical,
                and accessible.
              </h2>

              <div className="mt-20 grid gap-12 md:grid-cols-2">
                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-black/35">
                    Vision
                  </p>

                  <p className="mt-5 text-lg leading-8 text-black/60">
                    Build a learning environment where anyone can move from
                    understanding quantum concepts to confidently
                    experimenting with quantum algorithms.
                  </p>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-black/35">
                    Who it serves
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      "Beginners",
                      "Students",
                      "Developers",
                      "Educators",
                      "Researchers",
                      "Enthusiasts",
                    ].map((item) => (
                      <span
                        key={item}
                        className="border-b border-black/10 pb-3 text-sm text-black/65"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-20 border-y border-black/10 py-12">
                <div className="grid gap-8 sm:grid-cols-5">
                  {[
                    "Theory",
                    "Interaction",
                    "Experimentation",
                    "Understanding",
                    "Confidence",
                  ].map((item, index) => (
                    <div key={item}>
                      <span className="text-xs text-black/25">
                        0{index + 1}
                      </span>

                      <p className="mt-4 text-sm font-medium">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-16 max-w-3xl text-2xl font-medium leading-9 tracking-tight text-black/75">
                The long-term goal is simple: reduce the distance between
                learning about quantum computing and actually building with
                it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}