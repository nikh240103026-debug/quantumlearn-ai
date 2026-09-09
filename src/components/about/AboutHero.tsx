"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export function AboutHero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 100);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-68px)] overflow-hidden border-b border-black/10 bg-[#090c11] text-white">
      <div className="absolute inset-0">
        <div className="absolute left-[8%] top-[15%] h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[10%] right-[8%] h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-68px)] w-full max-w-[1600px] items-center px-6 py-20 sm:px-10 lg:px-16">
        <div
          className={`grid w-full gap-16 lg:grid-cols-[1.15fr_.85fr] lg:items-end transition-all duration-1000 ease-out ${
            visible
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div>
            <div
              className={`mb-8 flex items-center gap-3 transition-all duration-700 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              <span className="h-px w-10 bg-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">
                About QuantumLearn AI
              </span>
            </div>

            <h1 className="max-w-5xl text-5xl font-medium leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
              Making quantum computing
              <span className="block text-white/45">
                learnable by doing.
              </span>
            </h1>

            <p
              className={`mt-9 max-w-2xl text-base leading-7 text-white/60 sm:text-lg transition-all delay-200 duration-700 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              QuantumLearn AI is an interactive quantum-computing learning
              platform designed to connect theory, experimentation, coding,
              simulation, artificial intelligence, and assessment in one
              environment.
            </p>

            <div
              className={`mt-10 flex flex-wrap gap-3 transition-all delay-300 duration-700 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
              }`}
            >
              <Link
                href="/signup"
                className="group inline-flex items-center gap-3 bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-blue-500 hover:text-white"
              >
                Start learning
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/quantum-lab"
                className="inline-flex items-center gap-3 border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
              >
                Explore Quantum Lab
              </Link>
            </div>
          </div>

          <div
            className={`relative lg:pb-3 transition-all delay-200 duration-1000 ${
              visible
                ? "translate-x-0 opacity-100"
                : "translate-x-12 opacity-0"
            }`}
          >
            <div className="border border-white/10 bg-white/[0.025] p-5 backdrop-blur-sm">
              <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Platform principle
                </span>

                <span className="text-xs text-white/30">
                  01 / 04
                </span>
              </div>

              <div className="space-y-0">
                {[
                  ["01", "Learn", "Build conceptual foundations"],
                  ["02", "Build", "Construct quantum circuits"],
                  ["03", "Execute", "Run and observe experiments"],
                  ["04", "Understand", "Connect results to theory"],
                ].map(([number, title, description]) => (
                  <div
                    key={number}
                    className="group grid grid-cols-[42px_100px_1fr] gap-4 border-b border-white/10 py-5 last:border-b-0"
                  >
                    <span className="text-xs text-white/25">
                      {number}
                    </span>

                    <span className="text-sm font-medium text-white">
                      {title}
                    </span>

                    <span className="text-xs leading-5 text-white/40">
                      {description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/30 sm:left-10 lg:left-16">
          <ArrowDown size={13} />
          Discover the platform
        </div>
      </div>
    </section>
  );
}