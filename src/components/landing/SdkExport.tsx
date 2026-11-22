"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, FileCode2 } from "lucide-react";
import {
  generateCirqCode,
  generatePennyLaneCode,
  generateQiskitCode,
} from "@/lib/quantum/codegen";
import type { CircuitGate } from "@/lib/quantum/types";
import { SectionIntro } from "@/components/landing/SectionIntro";

// Bell pair with measurement: the same circuit the hero demo starts with.
const BELL: CircuitGate[] = [
  { id: "h", gate: "H", qubit: 0, column: 0 },
  { id: "cx", gate: "CNOT", qubit: 1, column: 1, controlQubit: 0 },
  { id: "m0", gate: "M", qubit: 0, column: 2 },
  { id: "m1", gate: "M", qubit: 1, column: 2 },
];

const TARGETS = [
  { id: "qiskit", label: "Qiskit", file: "bell.py", generate: generateQiskitCode },
  { id: "pennylane", label: "PennyLane", file: "bell_pl.py", generate: generatePennyLaneCode },
  { id: "cirq", label: "Cirq", file: "bell_cirq.py", generate: generateCirqCode },
] as const;

const TOKEN =
  /(#.*$)|("[^"]*"|'[^']*')|\b(from|import|def|return|for|in|as|print|with|lambda|None|True|False)\b|\b(\d+(?:\.\d+)?)\b|(@[\w.]+)/gm;

/** Minimal Python highlighter that renders React spans (no innerHTML). */
function highlight(code: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(code))) {
    if (match.index > last) parts.push(code.slice(last, match.index));
    const [text, comment, string, keyword, number, decorator] = match;
    const color = comment
      ? "text-white/30"
      : string
        ? "text-emerald-300"
        : keyword
          ? "text-violet-300"
          : number
            ? "text-amber-300"
            : decorator
              ? "text-cyan-300"
              : "";
    parts.push(
      <span key={key++} className={color}>
        {text}
      </span>,
    );
    last = match.index + text.length;
  }
  parts.push(code.slice(last));
  return parts;
}

export function SdkExport() {
  const [target, setTarget] = useState<(typeof TARGETS)[number]["id"]>("qiskit");
  const [copied, setCopied] = useState(false);

  const active = TARGETS.find((item) => item.id === target) ?? TARGETS[0];
  const code = useMemo(() => active.generate(2, BELL), [active]);
  const lines = code.split("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#05070d] pb-24 pt-4 text-white sm:pb-32 sm:pt-8">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-12">
        <div>
          <SectionIntro
            eyebrow="Design once, export anywhere"
            title="Your circuit is already code."
            description="Every circuit you build in the lab compiles to idiomatic Qiskit, PennyLane and Cirq. No lock-in, no toy syntax — take it straight to a notebook or real hardware."
          />
          <ul className="ql-reveal mt-8 space-y-3 text-sm text-white/60">
            {[
              "Generated live from the circuit model — what you see is what runs",
              "Export as JSON or OpenQASM 2.0 from the lab",
              "Run on five simulation backends without leaving the browser",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/coding"
            className="ql-reveal group mt-10 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-blue-300"
          >
            Explore the coding workspace
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="ql-reveal relative">
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-600/20 to-blue-600/10 blur-3xl" />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e18] shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/10 pr-3">
              <div role="tablist" aria-label="SDK" className="flex">
                {TARGETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={item.id === target}
                    onClick={() => setTarget(item.id)}
                    className={`relative px-4 py-3 text-xs font-medium transition-colors sm:px-5 ${
                      item.id === target ? "text-white" : "text-white/45 hover:text-white/80"
                    }`}
                  >
                    {item.label}
                    {item.id === target && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-violet-400" />
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] text-white/60 transition-colors hover:border-white/25 hover:text-white"
              >
                {copied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2 font-mono text-[11px] text-white/35">
              <FileCode2 size={12} />
              {active.file}
              <span className="ml-auto">generated · read-only</span>
            </div>
            <pre key={target} className="ql-enter max-h-[420px] overflow-auto py-4 font-mono text-[12.5px] leading-6" style={{ animationDuration: "0.4s" }}>
              {lines.map((line, index) => (
                <div key={index} className="flex px-4 hover:bg-white/[0.025]">
                  <span className="mr-5 w-6 shrink-0 select-none text-right text-white/20">{index + 1}</span>
                  <code className="whitespace-pre text-white/80">{highlight(line)}</code>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
