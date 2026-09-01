"use client";

import { useState } from "react";

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
  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function askTutor() {
    if (!question.trim() || loading) {
      return;
    }

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const response = await fetch(
        "/api/quantum-tutor",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            question,
            qubits,
            circuit,
            state,
            probabilities,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to get tutor response.",
        );
      }

      setAnswer(data.answer);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          AI Tutor
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Ask the Quantum Tutor
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ask questions about your current circuit, gates,
          quantum state, probabilities, or measurements.
        </p>
      </div>

      <div className="mt-5">

        <textarea
          value={question}
          onChange={(event) =>
            setQuestion(
              event.target.value,
            )
          }
          placeholder="Why does the Hadamard gate create a superposition?"
          rows={4}
          className="w-full resize-none rounded-xl border border-slate-300 p-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />

        <button
          type="button"
          onClick={askTutor}
          disabled={
            loading ||
            !question.trim()
          }
          className="mt-3 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Thinking..."
            : "Ask Tutor"}
        </button>

      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-5">

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Quantum Tutor
          </p>

          <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {answer}
          </div>

        </div>
      )}

    </section>
  );
}