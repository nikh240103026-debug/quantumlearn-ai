"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { QuantumField } from "@/components/fx/QuantumField";
import { TOPIC_JUMPS } from "@/data/quantumResources";

/** Animated "quantum core": tilted orbits, travelling electrons, pulsing nucleus. */
function QuantumPortal() {
  const rings = [
    { rx: 230, ry: 70, rotate: 0, speed: "26s", color: "rgba(96,165,250,0.55)" },
    { rx: 230, ry: 70, rotate: 60, speed: "34s", color: "rgba(167,139,250,0.5)" },
    { rx: 230, ry: 70, rotate: 120, speed: "30s", color: "rgba(34,211,238,0.45)" },
  ];

  return (
    <svg viewBox="-260 -260 520 520" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="vault-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#93c5fd" />
          <stop offset="60%" stopColor="rgba(99,102,241,0.55)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0)" />
        </radialGradient>
        <radialGradient id="vault-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(59,130,246,0.25)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0)" />
        </radialGradient>
      </defs>

      <circle r="250" fill="url(#vault-halo)" />
      <circle r="200" fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 10" />
      <circle r="150" fill="none" stroke="rgba(255,255,255,0.05)" />

      {rings.map((ring, index) => (
        <g key={index} transform={`rotate(${ring.rotate})`}>
          <g className={`ql-orbit ${index % 2 ? "ql-orbit-reverse" : ""}`} style={{ "--ql-orbit-speed": ring.speed } as React.CSSProperties}>
            <ellipse rx={ring.rx} ry={ring.ry} fill="none" stroke={ring.color} strokeWidth="1.2" />
            <circle cx={ring.rx} cy="0" r="5" fill="#e0f2fe" />
            <circle cx={ring.rx} cy="0" r="14" fill={ring.color} opacity="0.5" />
            <circle cx={-ring.rx} cy="0" r="3" fill="#c4b5fd" />
          </g>
        </g>
      ))}

      <circle r="64" fill="url(#vault-core)" className="ql-core-pulse" />
      <circle r="18" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function VaultHero({
  query,
  onQuery,
  stats,
}: {
  query: string;
  onQuery: (value: string) => void;
  stats: Array<{ label: string; value: string }>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses search from anywhere on the page.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key === "/" && !target?.closest("input, textarea, select, [contenteditable='true']")) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-[#05070d] text-white">
      <div className="absolute inset-0 -z-10 opacity-70">
        <QuantumField density={1.1} />
      </div>
      <div className="ql-grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 opacity-60 sm:h-[820px] sm:w-[820px]">
        <QuantumPortal />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-[#05070d]" />

      <div className="mx-auto flex min-h-[calc(92svh-72px)] max-w-5xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
        <p className="ql-enter inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-blue-200/80 backdrop-blur-md">
          <span className="ql-pulse-dot h-1.5 w-1.5 rounded-full bg-cyan-300" />
          Resources · The quantum vault
        </p>

        <h1
          className="ql-enter mt-7 text-[clamp(2.6rem,7vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.05em]"
          style={{ "--ql-delay": "80ms" } as React.CSSProperties}
        >
          <span className="ql-text-fade">Step inside the</span>
          <br />
          <span className="ql-text-gradient">quantum world.</span>
        </h1>

        <p
          className="ql-enter mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg"
          style={{ "--ql-delay": "160ms" } as React.CSSProperties}
        >
          The papers that built the field, the tools that run it, playgrounds to break it and the
          milestones that shaped it — all in one vault.
        </p>

        {/* Search */}
        <div className="ql-enter mt-10 w-full max-w-2xl" style={{ "--ql-delay": "240ms" } as React.CSSProperties}>
          <div className="ql-beam group relative flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0a0e18]/80 px-5 shadow-[0_0_80px_-20px_rgba(59,130,246,0.8)] backdrop-blur-xl transition-colors focus-within:border-blue-400/60">
            <Search size={20} className="shrink-0 text-blue-300" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder="Search papers, SDKs, concepts, authors…"
              aria-label="Search the vault"
              className="h-16 w-full bg-transparent text-base text-white outline-none placeholder:text-white/35 sm:text-lg"
            />
            {query ? (
              <button type="button" onClick={() => onQuery("")} aria-label="Clear search" className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white">
                <X size={16} />
              </button>
            ) : (
              <kbd className="hidden rounded-md border border-white/15 bg-white/[0.05] px-2 py-1 font-mono text-xs text-white/50 sm:block">/</kbd>
            )}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {TOPIC_JUMPS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  onQuery(topic);
                  document.getElementById("vault-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/65 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-blue-400/50 hover:text-white"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <dl
          className="ql-enter mt-14 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4"
          style={{ "--ql-delay": "320ms" } as React.CSSProperties}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#05070d]/80 px-4 py-4 backdrop-blur-md">
              <dd className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</dd>
              <dt className="mt-0.5 text-[11px] text-white/45">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
