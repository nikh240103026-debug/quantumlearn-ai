"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

import type {
  CircuitGate,
  Complex,
} from "@/lib/quantum/types";

interface QuantumTutorProps {
  qubits: number;
  circuit: CircuitGate[];
  state: Complex[];
  probabilities: number[];
}

export default function QuantumTutor({
  qubits,
  circuit,
  state,
  probabilities,
}: QuantumTutorProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askTutor() {
    if (!question.trim() || loading) {
      return;
    }

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const response = await fetch("/api/quantum-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          qubits,
          circuit,
          state,
          probabilities,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to get tutor response.",
        );
      }

      setAnswer(
        typeof data.answer === "string"
          ? data.answer
          : "",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border border-slate-800 bg-[#080d18] p-6">
      <div className="mb-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-blue-400">
          Quantum Tutor
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Ask questions about your current quantum circuit,
          state vector, gates, probabilities, or measurement.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              askTutor();
            }
          }}
          placeholder="Ask about your current circuit..."
          disabled={loading}
          className="min-h-11 flex-1 border border-slate-700 bg-[#050912] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={askTutor}
          disabled={loading || !question.trim()}
          className="min-h-11 border border-blue-500 bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
        >
          {loading ? "Thinking..." : "Ask Tutor"}
        </button>
      </div>

      {error && (
        <div className="mt-4 border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-6 border border-slate-800 bg-[#050912] p-5">
          <div className="mb-4 border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">
              Tutor Response
            </span>
          </div>

          <div
            className="
              prose prose-invert max-w-none
              text-sm leading-7 text-slate-200

              prose-headings:font-semibold
              prose-headings:text-white

              prose-h2:mb-3
              prose-h2:mt-7
              prose-h2:text-lg

              prose-h3:mb-2
              prose-h3:mt-6
              prose-h3:text-base
              prose-h3:text-blue-300

              prose-p:my-3
              prose-p:text-slate-200

              prose-strong:text-white

              prose-ul:my-3
              prose-ol:my-3

              prose-li:my-1
              prose-li:text-slate-200

              prose-code:border
              prose-code:border-slate-700
              prose-code:bg-slate-900
              prose-code:px-1.5
              prose-code:py-0.5
              prose-code:text-blue-300
              prose-code:before:content-none
              prose-code:after:content-none

              prose-pre:border
              prose-pre:border-slate-700
              prose-pre:bg-black

              prose-blockquote:border-l-blue-500
              prose-blockquote:text-slate-300

              prose-a:text-blue-400
              prose-a:no-underline
              hover:prose-a:underline
            "
          >
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {answer}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </section>
  );
}