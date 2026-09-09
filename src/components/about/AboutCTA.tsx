"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AboutCTA() {
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
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="border-t border-white/10 bg-[#080b10] text-white"
    >
      <div className="mx-auto max-w-[1600px]">
        <div
          className={`grid gap-12 px-6 py-20 transition-all duration-1000 sm:px-10 sm:py-28 lg:grid-cols-[1fr_auto] lg:items-end lg:px-16 ${
            visible
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              QuantumLearn AI
            </p>

            <h2 className="mt-7 max-w-4xl text-5xl font-medium leading-[0.96] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Learn the theory.
              <span className="block text-white/40">
                Build the circuit.
              </span>
              <span className="block">Understand the result.</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
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
              Open Quantum Lab
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}