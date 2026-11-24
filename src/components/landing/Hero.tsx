"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { QuantumCircuitField } from "@/components/fx/QuantumCircuitField";
import { HeroVideo } from "@/components/landing/HeroVideo";
import { CountUp } from "@/components/fx/CountUp";
import { platformFacts } from "@/lib/platform-facts";

const ROTATING_WORDS = ["building it.", "simulating it.", "coding it.", "questioning it."];

const STATS = [
  { value: platformFacts.chapters, label: "Curriculum chapters" },
  { value: platformFacts.topics, label: "Mapped topics" },
  { value: platformFacts.algorithmTemplates, label: "Algorithm templates" },
  { value: platformFacts.sdks.length, label: "SDK targets" },
];

export function Hero() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth
      .getUser()
      .then(({ data: { user } }) => setIsAuthenticated(!!user))
      .catch((error) => {
        console.error("Failed to check authentication:", error);
        setIsAuthenticated(false);
      })
      .finally(() => setAuthLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setWordIndex((index) => (index + 1) % ROTATING_WORDS.length),
      2600,
    );
    return () => window.clearInterval(timer);
  }, []);

  const startLearningHref = isAuthenticated ? "/dashboard" : "/signup";

  return (
    <section className="relative isolate overflow-hidden bg-[#05070d] text-white">
      {/* Backdrop layers */}
      <div className="ql-grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[620px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.28),transparent)] blur-2xl" />
      <div className="pointer-events-none absolute -right-40 top-1/3 -z-10 h-[480px] w-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.22),transparent)] blur-2xl" />
      {/* Live circuit — the background itself */}
      <div className="absolute inset-0 -z-10">
        <QuantumCircuitField />
      </div>
      {/* Readability: darken behind the copy, leave the right side vivid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,7,13,0.94)_0%,rgba(5,7,13,0.82)_34%,rgba(5,7,13,0.25)_62%,rgba(5,7,13,0)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(5,7,13,0.55)_0%,rgba(5,7,13,0.85)_45%,rgba(5,7,13,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-[#05070d]" />

      <p className="ql-enter pointer-events-none absolute right-8 top-8 hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 lg:flex" style={{ "--ql-delay": "900ms" } as React.CSSProperties}>
        <span className="ql-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Live circuit · hover to interact
      </p>

      <div className="mx-auto grid min-h-[calc(100svh-72px)] max-w-[1800px] content-center gap-y-9 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-x-8 lg:pl-12 lg:pr-8 lg:pt-20">
        {/* Copy */}
        <div className="max-w-2xl lg:self-end">
          <Link
            href="/quantum-lab"
            className="ql-enter group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3.5 text-xs text-white/70 backdrop-blur-md transition-colors hover:border-white/20 hover:text-white"
          >
            <span className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              Live
            </span>
            A real statevector simulator, right in your browser
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <h1
            className="ql-enter mt-8 text-[clamp(2.75rem,6.4vw,5.75rem)] lg:text-[clamp(2.75rem,4.7vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.05em]"
            style={{ "--ql-delay": "80ms" } as React.CSSProperties}
          >
            <span className="ql-text-fade">Learn quantum computing by</span>
            <br />
            <span className="relative inline-grid">
              {ROTATING_WORDS.map((word, index) => (
                <span
                  key={word}
                  aria-hidden={index !== wordIndex}
                  className={`ql-text-gradient col-start-1 row-start-1 pb-2 transition-all duration-700 ${
                    index === wordIndex
                      ? "translate-y-0 opacity-100 blur-0"
                      : "pointer-events-none translate-y-6 opacity-0 blur-sm"
                  }`}
                >
                  {word}
                </span>
              ))}
            </span>
          </h1>

          <p
            className="ql-enter mt-6 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8"
            style={{ "--ql-delay": "160ms" } as React.CSSProperties}
          >
            A structured curriculum, a circuit lab, multi-SDK coding and an
            AI tutor that knows what you are studying — one continuous
            workspace from your first qubit to your first algorithm.
          </p>
        </div>

        {/* Intro video: right of the copy on desktop, under the subtitle on mobile */}
        <div
          className="ql-enter max-sm:-mx-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
          style={{ "--ql-delay": "200ms" } as React.CSSProperties}
        >
          <HeroVideo />
        </div>

        <div className="max-w-2xl lg:self-start">
          <div
            className="ql-enter flex flex-col gap-3 sm:flex-row"
            style={{ "--ql-delay": "240ms" } as React.CSSProperties}
          >
            <Link
              href={startLearningHref}
              aria-disabled={authLoading}
              onClick={(event) => {
                if (authLoading) event.preventDefault();
              }}
              className={`ql-shine group inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_40px_-8px_rgba(59,130,246,0.9)] transition-colors hover:bg-blue-500 ${
                authLoading ? "cursor-wait opacity-80" : ""
              }`}
            >
              {isAuthenticated ? "Go to dashboard" : "Start learning"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/quantum-lab"
              className="group inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/[0.08]"
            >
              <FlaskConical size={16} className="text-blue-300" />
              Open Quantum Lab
            </Link>
          </div>

          <p
            className="ql-enter mt-6 hidden items-center gap-2 text-xs text-white/40 sm:flex"
            style={{ "--ql-delay": "320ms" } as React.CSSProperties}
          >
            Tip: press
            <kbd className="rounded border border-white/15 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-white/70">
              Ctrl K
            </kbd>
            anywhere to jump to any page.
          </p>

          {/* Stats */}
          <dl
            className="ql-enter mt-12 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4"
            style={{ "--ql-delay": "400ms" } as React.CSSProperties}
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-[#05070d]/80 px-4 py-4 backdrop-blur-md">
                <dd className="text-2xl font-semibold tracking-tight text-white">
                  <CountUp value={stat.value} />
                </dd>
                <dt className="mt-1 text-[11px] leading-4 text-white/45">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>

      </div>
    </section>
  );
}
