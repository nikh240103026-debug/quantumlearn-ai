"use client";

import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const suggestions = [
  "Explain superposition",
  "Why does measurement change a state?",
  "Show me a simple quantum circuit",
];

export function AITutorPreview() {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) return;

    setSubmitted(true);
    setMessage("");
  }

  return (
    <section
        id="ai-tutor"
        className="bg-slate-50 py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
              AI Tutor
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Learn With Guidance That Adapts to You.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Ask questions in plain language, get step-by-step
              explanations, and receive hints when you're stuck.
              Your AI Tutor helps turn difficult quantum ideas into
              understandable concepts.
            </p>

            {/* Benefits */}
            <div className="mt-8 space-y-4">
              <Benefit
                title="Context-aware explanations"
                description="Get explanations based on the concept or circuit you're currently studying."
              />

              <Benefit
                title="Hints instead of instant answers"
                description="Work through difficult problems while receiving guidance at the right moment."
              />

              <Benefit
                title="Learn at your own pace"
                description="Ask follow-up questions until the idea actually makes sense."
              />
            </div>
          </div>

          {/* Tutor interface */}
          <TutorInterface
            message={message}
            setMessage={setMessage}
            submitted={submitted}
            onSubmit={handleSubmit}
          />

        </div>
      </div>
    </section>
  );
}

interface TutorInterfaceProps {
  message: string;
  setMessage: (value: string) => void;
  submitted: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

function TutorInterface({
  message,
  setMessage,
  submitted,
  onSubmit,
}: TutorInterfaceProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Bot size={20} strokeWidth={1.8} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950">
              QuantumLearn Tutor
            </p>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-xs text-slate-500">
                Online
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
          <Sparkles size={13} />
          AI Tutor
        </div>
      </div>

      {/* Conversation */}
      <div className="min-h-[420px] space-y-5 bg-slate-50/60 p-5 sm:p-6">

        {/* User message */}
        <div className="flex justify-end">
          <div className="flex max-w-[85%] items-end gap-2">

            <div className="rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white shadow-sm">
              Why can't I think of a qubit as simply being
              0 and 1 at the same time?
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
              <User size={15} />
            </div>
          </div>
        </div>

        {/* AI response */}
        <div className="flex items-start gap-3">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
            <Bot size={15} />
          </div>

          <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-4 shadow-sm">

            <p className="text-sm leading-6 text-slate-700">
              That's a common point of confusion. A qubit isn't
              literally storing both classical values at once.
              Instead, its state is described by a{" "}
              <span className="font-semibold text-slate-950">
                probability amplitude
              </span>
              for each possible measurement outcome.
            </p>

            {/* Concept visualization */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Qubit state
                </span>

                <span className="font-mono text-xs text-blue-600">
                  α|0⟩ + β|1⟩
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <Probability
                  label="|0⟩"
                  value="70%"
                  width="70%"
                />

                <Probability
                  label="|1⟩"
                  value="30%"
                  width="30%"
                />
              </div>

            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
              <Lightbulb
                size={15}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <p className="text-xs leading-5 text-amber-800">
                Think of superposition as a mathematical state
                that determines the probabilities of different
                measurement outcomes—not as a tiny classical
                computer holding two definite values.
              </p>
            </div>

          </div>
        </div>

        {/* Submitted message */}
        {submitted && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm text-white">
              Thanks for the question. The tutor will continue
              from here once the AI backend is connected.
            </div>
          </div>
        )}

      </div>

      {/* Suggestions */}
      <div className="border-t border-slate-200 px-5 py-4 sm:px-6">

        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Suggested questions
        </p>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setMessage(suggestion)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={onSubmit}
          className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100"
        >
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask your quantum question..."
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />

          <button
            type="submit"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>

      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6">
        <span className="text-xs text-slate-400">
          AI-generated guidance
        </span>

        <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
          Explore Tutor
          <ArrowRight size={13} />
        </span>
      </div>

    </div>
  );
}

interface BenefitProps {
  title: string;
  description: string;
}

function Benefit({ title, description }: BenefitProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />

      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

interface ProbabilityProps {
  label: string;
  value: string;
  width: string;
}

function Probability({
  label,
  value,
  width,
}: ProbabilityProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-medium text-slate-600">
          {label}
        </span>

        <span className="text-slate-500">
          {value}
        </span>
      </div>

      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width }}
        />
      </div>
    </div>
  );
}