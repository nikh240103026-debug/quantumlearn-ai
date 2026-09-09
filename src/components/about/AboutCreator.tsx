"use client";

import { useEffect, useRef, useState } from "react";
// import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function AboutCreator() {
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
      {
        threshold: 0.05,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="border-b border-black/10 bg-[#f5f5f3]"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* Section heading */}
        <div className="border-b border-black/10 p-6 sm:p-10 lg:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
            05 — The creator
          </p>
        </div>

        <div className="grid lg:grid-cols-[.9fr_1.1fr]">
          {/* Creator image */}
          <div
            className={`relative border-b border-black/10 p-6 transition-all duration-1000 sm:p-10 lg:border-b-0 lg:border-r lg:p-16 ${
              visible
                ? "translate-x-0 opacity-100"
                : "-translate-x-8 opacity-0"
            }`}
          >
            <div className="relative mx-auto max-w-[560px] overflow-hidden bg-[#111318]">
              <div className="relative aspect-[4/5] w-full">
                <img
                  src="/images/creator/nikhil-raj.jpg"
                  alt="Nikhil Raj — Creator of QuantumLearn AI"
                  className="absolute inset-0 h-full w-full object-cover object-center grayscale-[15%] transition-transform duration-[1600ms] hover:scale-[1.025]"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>

              {/* Image caption */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6 text-white sm:p-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                    Creator
                  </p>

                  <p className="mt-2 text-lg font-medium">
                    Nikhil Raj
                  </p>
                </div>

                <span className="text-xs text-white/50">
                  QuantumLearn AI
                </span>
              </div>
            </div>
          </div>

          {/* Creator information */}
          <div
            className={`p-6 transition-all delay-150 duration-1000 sm:p-10 lg:p-16 ${
              visible
                ? "translate-x-0 opacity-100"
                : "translate-x-8 opacity-0"
            }`}
          >
            <p className="text-sm uppercase tracking-[0.18em] text-blue-600">
              Builder · Developer · Learner
            </p>

            <h2 className="mt-7 max-w-3xl text-5xl font-medium leading-[0.98] tracking-[-0.05em] sm:text-6xl">
              Nikhil Raj
            </h2>

            <p className="mt-6 text-sm font-medium text-black/45">
              B.Tech — Computer Science & Engineering
              <br />
              Artificial Intelligence & Data Science
            </p>

            <div className="mt-12 max-w-2xl space-y-6 text-base leading-7 text-black/60">
              <p>
                Nikhil Raj is a Computer Science and Engineering student
                specializing in Artificial Intelligence and Data Science, with
                a strong interest in artificial intelligence, quantum
                computing, software engineering, and emerging technologies.
              </p>

              <p>
                QuantumLearn AI was conceived and developed as an exploration
                of how modern software, artificial intelligence, and quantum
                computing can be brought together to create a more practical
                approach to technical education.
              </p>

              <p>
                The project reflects a broader belief that technology should
                not only present information. It should give people the ability
                to interact with concepts, experiment with them, make mistakes,
                ask questions, and understand what happens.
              </p>
            </div>

            {/* Creator details */}
            <div className="mt-14 border-y border-black/10">
              <div className="grid sm:grid-cols-2">
                {[
                  ["Focus", "AI & Quantum Computing"],
                  ["Discipline", "Computer Science"],
                  ["Interest", "Emerging Technologies"],
                  ["Approach", "Build through experimentation"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="border-b border-black/10 py-6 sm:pr-8"
                  >
                    <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                      {label}
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator's note */}
            <div className="mt-14 border-l-2 border-blue-500 pl-6">
              <p className="text-xs uppercase tracking-[0.18em] text-black/35">
                Creator&apos;s note
              </p>

              <blockquote className="mt-5 max-w-2xl text-xl font-medium leading-8 tracking-tight text-black/80">
                “Quantum computing should not remain something learners only
                read about. The goal is to create an environment where they
                can build, experiment, question, and understand.”
              </blockquote>
            </div>

            {/* LinkedIn */}
            <div className="mt-12">
              <a
                href="https://www.linkedin.com/in/nikhil-raj-bb8676320/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 border-b border-black/20 pb-2 text-sm font-semibold transition-colors hover:border-black"
              >
                Connect with the creator

                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}