"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Bot, Lightbulb, RotateCw } from "lucide-react";
import { SpotlightGroup } from "@/components/fx/SpotlightGroup";
import {
  CONCEPTS,
  CURATED,
  FACTS,
  MILESTONES,
  SHELVES,
  type CuratedResource,
  type ShelfId,
} from "@/data/quantumResources";

/* ------------------------------------------------------------------ */
/* Section heading                                                     */
/* ------------------------------------------------------------------ */

export function VaultHeading({
  index,
  eyebrow,
  title,
  description,
  right,
}: {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="ql-reveal flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div className="max-w-2xl">
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-blue-300/80">
          <span className="text-white/30">{index}</span>
          <span className="h-px w-8 bg-blue-300/50" />
          {eyebrow}
        </p>
        <h2 className="mt-4 text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-white">{title}</h2>
        {description && <p className="mt-3 text-base leading-7 text-white/55">{description}</p>}
      </div>
      {right}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Did you know                                                        */
/* ------------------------------------------------------------------ */

export function FactTicker() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % FACTS.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      aria-label="Did you know"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="border-y border-white/[0.07] bg-[#070a12]"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-5 sm:px-8">
        <span className="hidden shrink-0 items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200 sm:inline-flex">
          <Lightbulb size={12} />
          Did you know
        </span>
        <p key={index} className="ql-fact-in min-h-[3rem] flex-1 text-sm leading-6 text-white/75 sm:min-h-0 sm:text-base" aria-live="polite">
          {FACTS[index]}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Previous fact"
            onClick={() => setIndex((value) => (value - 1 + FACTS.length) % FACTS.length)}
            className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={15} />
          </button>
          <span className="w-10 text-center font-mono text-[11px] text-white/35">
            {index + 1}/{FACTS.length}
          </span>
          <button
            type="button"
            aria-label="Next fact"
            onClick={() => setIndex((value) => (value + 1) % FACTS.length)}
            className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Concept flip cards                                                  */
/* ------------------------------------------------------------------ */

export function ConceptDeck() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <VaultHeading
        index="01"
        eyebrow="Core ideas"
        title={
          <>
            Six ideas. <span className="ql-text-gradient">Everything else is built on them.</span>
          </>
        }
        description="Hover or tap a card to reveal what it really means."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONCEPTS.map((concept, index) => (
          <button
            key={concept.term}
            type="button"
            data-flipped={flipped[concept.term] ? "true" : "false"}
            onClick={() => setFlipped((value) => ({ ...value, [concept.term]: !value[concept.term] }))}
            aria-label={`${concept.term}: ${concept.back}`}
            className="ql-flip ql-reveal h-60 text-left"
          >
            <span className="ql-flip-inner block">
              {/* front */}
              <span className="ql-flip-face flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d1324] to-[#080b14] p-6">
                <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.25),transparent)]" />
                <span className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-white/30">{String(index + 1).padStart(2, "0")}</span>
                  <RotateCw size={14} className="text-white/25" />
                </span>
                <span className="font-mono text-5xl text-blue-200/90">{concept.glyph}</span>
                <span>
                  <span className="block text-xl font-semibold text-white">{concept.term}</span>
                  <span className="mt-1 block text-sm text-white/45">{concept.front}</span>
                </span>
              </span>
              {/* back */}
              <span className="ql-flip-face ql-flip-back flex flex-col justify-between rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-600/25 via-[#0b1020] to-violet-600/20 p-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-blue-200/80">{concept.term}</span>
                <span className="text-[15px] leading-7 text-white/85">{concept.back}</span>
                <span className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-cyan-200">{concept.math}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Curated collection                                                  */
/* ------------------------------------------------------------------ */

const KIND_TONE: Record<CuratedResource["kind"], string> = {
  Paper: "border-blue-400/30 bg-blue-500/10 text-blue-200",
  Book: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  Course: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  Notes: "border-teal-400/30 bg-teal-500/10 text-teal-200",
  SDK: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  Tool: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  Interactive: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
};

const LEVEL_DOTS: Record<CuratedResource["level"], number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };

export function matchesCurated(item: CuratedResource, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.title, item.authors, item.venue, item.summary, item.topic, item.kind, item.ref, String(item.year)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(q);
}

function tutorHref(item: CuratedResource) {
  const reason = `Help me understand "${item.title}" (${item.authors}, ${item.year}). Explain the key ideas, prerequisites and why it matters in quantum computing.`;
  return `/ai-tutor?source=resource&topic=${encodeURIComponent(item.topic)}&reason=${encodeURIComponent(reason)}`;
}

function CuratedCard({ item }: { item: CuratedResource }) {
  const external = !item.internal;
  const level = LEVEL_DOTS[item.level];

  return (
    <article className="ql-spotlight group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e18] transition-colors hover:border-white/20">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${KIND_TONE[item.kind]}`}>{item.kind}</span>
        <span className="font-mono text-2xl font-semibold leading-none text-white/15 transition-colors group-hover:text-white/30">{item.year}</span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-white">{item.title}</h3>
        <p className="mt-1.5 text-xs text-white/45">
          {item.authors} · <span className="italic">{item.venue}</span>
        </p>
        <p className="mt-3 text-sm leading-6 text-white/60">{item.summary}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4 text-[11px] text-white/45">
          <span className="inline-flex items-center gap-1.5" title={item.level}>
            <span className="inline-flex items-end gap-[2px]" aria-hidden="true">
              {[1, 2, 3].map((bar) => (
                <span key={bar} className={`w-[3px] rounded-sm ${bar <= level ? "bg-blue-300" : "bg-white/15"}`} style={{ height: `${3 + bar * 3}px` }} />
              ))}
            </span>
            {item.level}
          </span>
          <span>{item.topic}</span>
          {item.ref && <span className="truncate font-mono text-white/30">{item.ref}</span>}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] border-t border-white/[0.07]">
        {external ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-5 py-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            Open source
            <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        ) : (
          <Link
            href={item.url}
            className="flex items-center justify-between px-5 py-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            Open in QuantumLearn
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
        <Link
          href={tutorHref(item)}
          title="Ask the AI tutor about this"
          aria-label={`Ask the AI tutor about ${item.title}`}
          className="flex items-center gap-1.5 border-l border-white/[0.07] px-4 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/10 hover:text-violet-200"
        >
          <Bot size={14} />
          <span className="hidden sm:inline">Ask AI</span>
        </Link>
      </div>
    </article>
  );
}

export function CuratedCollection({ query }: { query: string }) {
  const [shelf, setShelf] = useState<ShelfId>("landmarks");
  const searching = query.trim().length > 0;

  const counts = useMemo(() => {
    const result: Partial<Record<ShelfId, number>> = {};
    for (const item of CURATED) result[item.shelf] = (result[item.shelf] ?? 0) + 1;
    return result;
  }, []);

  const items = useMemo(
    () =>
      (searching ? CURATED.filter((item) => matchesCurated(item, query)) : CURATED.filter((item) => item.shelf === shelf)).sort(
        (a, b) => a.year - b.year,
      ),
    [searching, query, shelf],
  );

  const activeShelf = SHELVES.find((item) => item.id === shelf);

  return (
    <section id="vault-results" className="scroll-mt-24 border-t border-white/[0.07] bg-[#05070d]">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <VaultHeading
          index="02"
          eyebrow="Curated collection"
          title={
            searching ? (
              <>
                Results for <span className="ql-text-gradient">&ldquo;{query.trim()}&rdquo;</span>
              </>
            ) : (
              "Hand-picked by the QuantumLearn team."
            )
          }
          description={
            searching
              ? `${items.length} curated ${items.length === 1 ? "match" : "matches"} — your instructors' library is searched below too.`
              : "Every entry links to the original source. Ask the AI tutor to unpack any of them."
          }
        />

        {!searching && (
          <div role="tablist" aria-label="Shelves" className="mt-10 flex gap-2 overflow-x-auto pb-1">
            {SHELVES.map((item) => {
              const active = item.id === shelf;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setShelf(item.id)}
                  className={`relative shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? "border-blue-400/60 bg-blue-500/15 text-white shadow-[0_0_30px_-8px_rgba(59,130,246,0.8)]"
                      : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span className={`ml-2 font-mono text-[11px] ${active ? "text-blue-200" : "text-white/30"}`}>{counts[item.id] ?? 0}</span>
                </button>
              );
            })}
          </div>
        )}

        {!searching && activeShelf && <p className="mt-4 text-sm text-white/45">{activeShelf.blurb}</p>}

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center text-white/50">
            Nothing curated matches that yet — check the instructor library below.
          </div>
        ) : (
          <SpotlightGroup key={searching ? `q-${query}` : shelf} className="ql-enter mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3" style={{ animationDuration: "0.5s" }}>
            {items.map((item) => (
              <CuratedCard key={item.id} item={item} />
            ))}
          </SpotlightGroup>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

export function MilestoneTimeline() {
  const [active, setActive] = useState(MILESTONES.length - 1);
  const milestone = MILESTONES[active];
  const progress = MILESTONES.length > 1 ? (active / (MILESTONES.length - 1)) * 100 : 100;

  return (
    <section className="relative overflow-hidden border-t border-white/[0.07] bg-[#070a12]">
      <div className="ql-dots-bg pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <VaultHeading
          index="03"
          eyebrow="Timeline"
          title="Forty years, from thought experiment to chips."
          right={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActive((value) => Math.max(0, value - 1))}
                disabled={active === 0}
                aria-label="Earlier milestone"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/35 hover:text-white disabled:opacity-30"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setActive((value) => Math.min(MILESTONES.length - 1, value + 1))}
                disabled={active === MILESTONES.length - 1}
                aria-label="Later milestone"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/35 hover:text-white disabled:opacity-30"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          }
        />

        {/* Track */}
        <div className="mt-14 overflow-x-auto pb-4">
          <div className="relative min-w-[760px]">
            <div className="absolute left-0 right-0 top-[9px] h-px bg-white/10" />
            <div
              className="absolute left-0 top-[9px] h-px bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 shadow-[0_0_12px_rgba(96,165,250,0.8)] transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
            <ol className="relative flex justify-between">
              {MILESTONES.map((item, index) => {
                const reached = index <= active;
                return (
                  <li key={item.year} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`${item.year}: ${item.title}`}
                      aria-current={index === active ? "step" : undefined}
                      className="group flex flex-col items-center"
                    >
                      <span
                        className={`h-[19px] w-[19px] rounded-full border-2 transition-all duration-300 ${
                          index === active
                            ? "scale-125 border-white bg-blue-500 shadow-[0_0_20px_rgba(96,165,250,1)]"
                            : reached
                              ? "border-blue-400 bg-[#070a12]"
                              : "border-white/20 bg-[#070a12] group-hover:border-white/50"
                        }`}
                      />
                      <span className={`mt-3 font-mono text-xs transition-colors ${index === active ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>
                        {item.year}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Detail */}
        <div key={active} className="ql-enter mt-8 grid gap-6 rounded-2xl border border-white/10 bg-[#0a0e18]/80 p-6 backdrop-blur-md sm:grid-cols-[auto_1fr] sm:items-center sm:p-8" style={{ animationDuration: "0.45s" }}>
          <p className="ql-text-gradient font-mono text-6xl font-semibold leading-none sm:text-7xl">{milestone.year}</p>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-white">{milestone.title}</h3>
            <p className="mt-2 max-w-2xl text-base leading-7 text-white/60">{milestone.body}</p>
            {milestone.href && (
              <a
                href={milestone.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 hover:text-blue-200"
              >
                Read the original
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
