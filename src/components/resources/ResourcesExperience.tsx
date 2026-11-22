"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, FlaskConical } from "lucide-react";
import { VaultHero } from "@/components/resources/VaultHero";
import {
  ConceptDeck,
  CuratedCollection,
  FactTicker,
  MilestoneTimeline,
  VaultHeading,
} from "@/components/resources/VaultSections";
import { ResourceLibrary } from "@/components/resources/ResourceLibrary";
import { CURATED, CONCEPTS, MILESTONES } from "@/data/quantumResources";

const STATS = [
  { label: "Research papers", value: String(CURATED.filter((item) => item.kind === "Paper").length) },
  { label: "SDKs & tools", value: String(CURATED.filter((item) => item.shelf === "tools").length) },
  { label: "Core concepts", value: String(CONCEPTS.length) },
  { label: "Milestones", value: String(MILESTONES.length) },
];

export function ResourcesExperience() {
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;

  return (
    <main className="bg-[#05070d] text-white">
      <VaultHero query={query} onQuery={setQuery} stats={STATS} />
      <FactTicker />

      {/* When searching, jump straight to results; otherwise tell the story. */}
      {!searching && <ConceptDeck />}
      <CuratedCollection query={query} />
      {!searching && <MilestoneTimeline />}

      <section className="border-t border-white/[0.07] bg-[#05070d]">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <VaultHeading
            index={searching ? "03" : "04"}
            eyebrow="Instructor library"
            title="Published by the QuantumLearn team."
            description={
              searching
                ? `Library entries matching “${query.trim()}”.`
                : "Papers, documents and references chosen to go alongside your lessons. Bookmark anything to find it again."
            }
          />
          <div className="mt-10">
            <ResourceLibrary query={query} />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.07]">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.22),transparent)] blur-2xl" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 py-24 text-center sm:px-8">
          <p className="font-mono text-xs tracking-[0.18em] text-blue-300/80">READ IT → BUILD IT</p>
          <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
            Don&apos;t just read about qubits. <span className="ql-text-gradient">Move them.</span>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/55">
            Rebuild any circuit from these papers in the Quantum Lab, or ask the AI tutor to walk you
            through the maths step by step.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quantum-lab"
              className="ql-shine group inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold shadow-[0_8px_40px_-8px_rgba(59,130,246,0.9)] hover:bg-blue-500"
            >
              <FlaskConical size={16} />
              Open the Quantum Lab
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/ai-tutor"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold hover:border-white/30"
            >
              <Bot size={16} className="text-violet-300" />
              Ask the AI tutor
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
