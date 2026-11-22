"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { quantumChapters } from "@/data/quantumChapters";
import { curriculumModules } from "@/data/quantumCurriculum";
import { SectionIntro } from "@/components/landing/SectionIntro";

/** Interactive browser over the real curriculum data. */
export function CurriculumExplorer() {
  const [active, setActive] = useState(quantumChapters[0]?.number ?? 1);

  const chapter = quantumChapters.find((item) => item.number === active) ?? quantumChapters[0];

  const { moduleTitle, topics } = useMemo(() => {
    const owner = curriculumModules.find((module) => module.chapterNumbers.includes(active));
    const related = curriculumModules
      .flatMap((module) => module.topics)
      .filter((topic) => topic.chapterNumbers.includes(active));
    return { moduleTitle: owner?.title, topics: related };
  }, [active]);

  const progress = (active / quantumChapters.length) * 100;

  return (
    <section id="curriculum" className="relative bg-[#05070d] py-24 text-white sm:py-32">
      <div className="pointer-events-none absolute left-0 top-1/3 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.16),transparent)] blur-2xl" />
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionIntro
            eyebrow="Curriculum"
            title={`${quantumChapters.length} chapters. Zero hand-waving.`}
            description="From complex numbers to error correction and real quantum programming, in the order the ideas actually depend on each other. Pick a chapter to see what it covers."
          />
          <Link
            href="/roadmap"
            className="ql-reveal group inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold transition-colors hover:border-white/30 hover:bg-white/[0.05]"
          >
            Full roadmap
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="ql-reveal mt-14 grid overflow-hidden rounded-2xl border border-white/10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Chapter list */}
          <div role="tablist" aria-label="Curriculum chapters" className="max-h-[560px] overflow-y-auto border-b border-white/10 bg-[#0a0e18] lg:border-b-0 lg:border-r">
            {quantumChapters.map((item) => {
              const selected = item.number === active;
              return (
                <button
                  key={item.number}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => setActive(item.number)}
                  onMouseEnter={() => setActive(item.number)}
                  className={`relative flex w-full items-center gap-4 border-b border-white/[0.06] px-5 py-4 text-left transition-colors last:border-b-0 ${
                    selected ? "bg-white/[0.05]" : "hover:bg-white/[0.025]"
                  }`}
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-blue-400 to-violet-400 transition-opacity ${
                      selected ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className={`font-mono text-xs ${selected ? "text-blue-300" : "text-white/30"}`}>
                    {String(item.number).padStart(2, "0")}
                  </span>
                  <span className={`text-sm font-medium ${selected ? "text-white" : "text-white/60"}`}>
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <div role="tabpanel" className="relative flex flex-col justify-between overflow-hidden bg-[#070a12] p-7 sm:p-10">
            <div className="ql-dots-bg pointer-events-none absolute inset-0 opacity-50" />
            <div key={active} className="ql-enter relative" style={{ animationDuration: "0.5s" }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
                Chapter {active} of {quantumChapters.length}
                {moduleTitle ? ` · ${moduleTitle}` : ""}
              </p>
              <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{chapter.title}</h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/60">{chapter.description}</p>

              {topics.length > 0 && (
                <div className="mt-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">Topics</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <span
                        key={topic.id}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/70"
                      >
                        {topic.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative mt-10">
              <div className="flex justify-between font-mono text-[10px] text-white/35">
                <span>Foundations</span>
                <span>Advanced</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                <Link
                  href={`/practice?chapterNumber=${chapter.number}`}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition-colors hover:text-blue-200"
                >
                  Practice this chapter
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href={`/ai-tutor?topic=${encodeURIComponent(chapter.title)}`}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition-colors hover:text-white"
                >
                  Ask the tutor about it
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
